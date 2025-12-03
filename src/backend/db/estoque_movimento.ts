import pool from './connection.js';

function toNumberSafe(v, decimals = 4) {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Number(n.toFixed(decimals));
}

export async function registrarMovimentoEstoque({ produto_id, tipo, origem, quantidade, custo_unitario = null, documento_id = null, observacao = null }) {
    const [result] = await pool.query(
        'INSERT INTO estoque_movimento(produto_id, tipo, origem,quantidade,custo_unitario,documento_id,observacao) VALUES (?,?,?,?,?,?,?)',
        [produto_id, tipo, origem, quantidade, custo_unitario, documento_id, observacao])

    return { id: result.insertId }

}

export async function atualizarEstoqueECusto(produto_id, quantidade, custo_unitario) {
    const [[produto]] = await pool.query(
        `SELECT EstoqueAtual, CustoMedio FROM produto WHERE CodigoProduto = ?`,
        [produto_id]
    );

    if (!produto) throw new Error("Produto não encontrado");

    const estoqueAtual = toNumberSafe(produto.EstoqueAtual || 0, 3);
    const custoMedioAtual = toNumberSafe(produto.CustoMedio || 0, 4);
    const qtd = toNumberSafe(quantidade, 3);
    const custo = toNumberSafe(custo_unitario, 4);

    const novoEstoque = estoqueAtual + qtd;
    const novoCustoMedio =
        novoEstoque > 0
            ? ((estoqueAtual * custoMedioAtual) + (qtd * custo)) / novoEstoque
            : custo;

    await pool.query(
        `UPDATE produto
     SET EstoqueAtual = ?, CustoMedio = ?, CustoUltimaCompra = ?, atualizado_em = NOW()
     WHERE CodigoProduto = ?`,
        [novoEstoque, novoCustoMedio, custo, produto_id]
    );

    return { novoEstoque, novoCustoMedio };
}

export async function validarEstoqueDisponivel(produto_id, quantidadeSolicitada) {
    const [[produto]] = await pool.query(
        `SELECT EstoqueAtual FROM produto WHERE CodigoProduto = ?`,
        [produto_id]
    );

    if (!produto) throw new Error('Produto não encontrado');

    const estoqueAtual = toNumberSafe(produto.EstoqueAtual || 0, 3);

    if (estoqueAtual < quantidadeSolicitada) {
        throw new Error(`Quantidade insuficiente. Disponível: ${estoqueAtual}`);
    }

    return estoqueAtual;
}

export async function entradaEstoque({ produto_id, origem = 'compra', quantidade, custo_unitario, documento_id, observacao }) {
    if (!quantidade || quantidade <= 0) throw new Error("Quantidade inválida");
    if (!custo_unitario || custo_unitario <= 0) throw new Error("Custo não pode ser zero na entrada");

    const movimento_id = await registrarMovimentoEstoque({
        produto_id,
        tipo: 'entrada',
        origem,
        quantidade,
        custo_unitario,
        documento_id,
        observacao
    });

    await atualizarEstoqueECusto(produto_id, quantidade, custo_unitario);

    return { movimento_id };
}

export async function saidaEstoque({ produto_id, origem = 'venda', quantidade, documento_id, observacao }) {
    if (!quantidade || quantidade <= 0) throw new Error("Quantidade inválida");

    await validarEstoqueDisponivel(produto_id, quantidade);

    const movimento_id = await registrarMovimentoEstoque({
        produto_id,
        tipo: 'saida',
        origem,
        quantidade,
        custo_unitario: null,
        documento_id,
        observacao
    });

    await atualizarEstoque(produto_id, -quantidade);

    return { movimento_id };
}


export async function atualizarEstoque(produto_id, deltaQuantidade) {
    const [[produto]] = await pool.query(
        `SELECT EstoqueAtual FROM produto WHERE CodigoProduto = ?`,
        [produto_id]
    );

    if (!produto) throw new Error('Produto não encontrado');

    const estoqueAtual = toNumberSafe(produto.EstoqueAtual || 0, 3);
    const novoEstoque = toNumberSafe(estoqueAtual + deltaQuantidade, 3);

    if (novoEstoque < 0) throw new Error('Estoque resultante não pode ser negativo');

    await pool.query(
        `UPDATE produto SET EstoqueAtual = ?, atualizado_em = NOW() WHERE CodigoProduto = ?`,
        [novoEstoque, produto_id]
    );

    return { estoqueAnterior: estoqueAtual, estoqueAtual: novoEstoque };
}

