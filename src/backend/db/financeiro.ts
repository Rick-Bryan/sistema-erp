import pool from "./connection"
export async function criarContasReceberVenda({ empresa_id, cliente_id, venda_id, valor_total, parcelas }) {

    const status = 'aberto'
    const [conta] = await pool.query(`INSERT INTO contas_receber(empresa_id,cliente_id,venda_id,descricao,valor_total,status) VALUES (?,?,?,?,?,?)`
        , [empresa_id, cliente_id, venda_id, `Venda #${venda_id}`, valor_total, status])



    const contaId = conta.insertId;
    const parcelasGeradas = Array.isArray(parcelas) && parcelas.length > 0
        ? parcelas
        : [{
            numero: 1,
            valor: valor_total,
            vencimento:  new Date()
        }];

    for (const p of parcelasGeradas) {
        await pool.query(
            `INSERT INTO parcelas_receber
       (conta_receber_id, numero_parcela, valor, data_vencimento)
       VALUES (?, ?, ?, ?)`,
            [
                contaId,
                p.numero,
                p.valor,
                p.vencimento
            ]
        );
    }

    return contaId;
}
export async function baixarParcelaReceber({
    parcela_id,
    valor_pago,
    forma_pagamento_id,
    usuario_id,
    caixa_id
}) {


    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {

        // 1️⃣ Busca parcela
        const [[parcela]] = await conn.query(
            `SELECT * FROM parcelas_receber WHERE id = ?`,
            [parcela_id]
        );

        if (!parcela) throw new Error("Parcela não encontrada");

        const novoValorPago = Number(parcela.valor_pago) + Number(valor_pago);

        // 2️⃣ Atualiza parcela
        let status = "parcial";
        if (novoValorPago >= parcela.valor) status = "pago";

        await conn.query(
            `UPDATE parcelas_receber
     SET valor_pago = ?, status = ?
     WHERE id = ?`,
            [novoValorPago, status, parcela_id]
        );

        // 3️⃣ Cria movimentação no caixa
        await conn.query(
            `INSERT INTO caixa_movimentos
     (caixa_id, tipo, origem, descricao, valor, forma_pagamento_id, usuario_id)
     VALUES (?, 'entrada', 'conta_receber', ?, ?, ?, ?)`,
            [
                caixa_id,
                `Recebimento parcela ${parcela.numero_parcela}`,
                valor_pago,
                forma_pagamento_id,
                usuario_id
            ]
        );


        await atualizarStatusContaReceber(parcela.conta_receber_id, conn);
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }


}
async function atualizarStatusContaReceber(contaId, conn = pool) {
    const [[res]] = await conn.query(
        `SELECT 
       SUM(valor) total,
       SUM(valor_pago) pago
     FROM parcelas_receber
     WHERE conta_receber_id = ?`,
        [contaId]
    );

    let status = "aberto";
    if (res.pago >= res.total) status = "pago";
    else if (res.pago > 0) status = "parcial";

    await conn.query(
        `UPDATE contas_receber SET status = ? WHERE id = ?`,
        [status, contaId]
    );
}
export async function listarContasReceber(filtros: any = {}) {
    const { cliente_id, status } = filtros;

    let sql = `
    SELECT cr.*, c.nome AS cliente_nome
    FROM contas_receber cr
    LEFT JOIN clientes c ON c.id = cr.cliente_id
    WHERE 1=1
  `;
    const params: any[] = [];

    if (cliente_id) {
        sql += " AND cr.cliente_id = ?";
        params.push(cliente_id);
    }

    if (status) {
        sql += " AND cr.status = ?";
        params.push(status);
    }

    sql += " ORDER BY cr.id DESC";

    const [rows] = await pool.query(sql, params);
    return rows;
}
export async function obterContasReceber(filtros: any) {
    // Aqui você pode validar, tratar permissão, empresa, etc
    return listarContasReceber(filtros);
}
export async function listarParcelasReceber(conta_id) {
    const [rows] = await pool.query(
        `SELECT *
     FROM parcelas_receber
     WHERE conta_receber_id = ?
     ORDER BY numero_parcela`,
        [conta_id]
    );

    return rows;
}

export async function listarContasPagar() {
    const [rows] = await pool.query(`
    SELECT cp.*, f.nome AS fornecedor_nome
    FROM contas_pagar cp
    LEFT JOIN fornecedores f ON f.id = cp.fornecedor_id
    ORDER BY cp.id DESC
  `);

    return rows;
}