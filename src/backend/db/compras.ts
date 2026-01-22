// src/backend/compras.ts
import pool from './connection';
import { registrarMovimentoEstoque } from './estoque_movimento';
import { fixMoney } from './financeiro';
import { atualizarSaldoConta } from './financeiro';
import { pagarCompraComCaixa } from './caixa';
// ------------------------
// LISTAR COMPRAS
// ------------------------
export async function listarCompras({ fornecedor_id, status, dataInicio, dataFim } = {}) {
  let sql = 'SELECT * FROM compras WHERE 1=1';
  const params: any[] = [];

  if (fornecedor_id) {
    sql += ' AND fornecedor_id = ?';
    params.push(fornecedor_id);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (dataInicio) {
    sql += ' AND criado_em >= ?';
    params.push(dataInicio);
  }
  if (dataFim) {
    sql += ' AND criado_em <= ?';
    params.push(dataFim);
  }

  sql += ' ORDER BY id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ------------------------
// CRIAR COMPRA
// ------------------------
export async function criarCompra({
  fornecedor_id,
  usuario_id,
  valor_total,
  tipo_pagamento,
  status,
  observacoes
}) {
  const [result] = await pool.query(
    `INSERT INTO compras 
      (fornecedor_id, usuario_id, valor_total, tipo_pagamento, status, observacoes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fornecedor_id, usuario_id, valor_total, tipo_pagamento, status, observacoes]
  );

  return result.insertId;
}

// ------------------------
// CRIAR ITENS DE COMPRA
// ------------------------
export async function criarItensCompra({ compra_id, produto_id, quantidade, custo_unitario }) {
  const [result] = await pool.query(
    'INSERT INTO itens_compra (compra_id, produto_id, quantidade, custo_unitario) VALUES (?, ?, ?, ?)',
    [compra_id, produto_id, quantidade, custo_unitario]
  );

  return result.insertId;
}

// ------------------------
// CRIAR CONTAS A PAGAR
// ------------------------
export async function criarContasPagar({
  compra_id,
  fornecedor_id,
  valor,
  vencimento,
  pago = 0,
  forma_pagamento,
}: {
  compra_id: number;
  fornecedor_id: number;
  valor: number;
  vencimento: string;
  pago?: number;
  forma_pagamento: string;
}) {
  const [result]: any = await pool.query(
    'INSERT INTO contas_pagar (compra_id, fornecedor_id, valor, vencimento, pago, forma_pagamento) VALUES (?,?,?,?,?,?)',
    [compra_id, fornecedor_id, valor, vencimento, pago, forma_pagamento]
  );
  return result.insertId;
}
export async function getCompraById(id: number) {
  console.log("📌 Buscar compra ID:", id);  // <--- LOG

  const [rows]: any = await pool.query(
    `SELECT c.*, 
            f.CodigoFornecedor AS fornecedor_id,
            f.Nome AS fornecedor_nome
     FROM compras c
     LEFT JOIN fornecedores f ON f.CodigoFornecedor = c.fornecedor_id
     WHERE c.id = ?`,
    [id]
  );

  console.log("📦 Compra encontrada:", rows); // <--- LOG

  const [itens]: any = await pool.query(
    `SELECT ic.*, 
            p.CodigoProduto AS produto_id,
            p.NomeProduto AS produto_nome
     FROM itens_compra ic
     LEFT JOIN produto p ON p.CodigoProduto = ic.produto_id
     WHERE ic.compra_id = ?`,
    [id]
  );

  console.log("📦 Itens encontrados:", itens); // <--- LOG

  const compra = rows[0];

  if (!compra) {
    console.log("⚠️ Nenhuma compra encontrada!");
    return { compra: null, itens: [] };
  }

  compra.fornecedor = {
    id: compra.fornecedor_id,
    Nome: compra.fornecedor_nome,
  };

  const itensMapeados = itens.map((item: any) => ({
    ...item,
    produto: {
      id: item.produto_id,
      nome: item.produto_nome,
    },
  }));

  return { compra, itens: itensMapeados };
}



// ------------------------
// SALVAR COMPRA COMPLETA
// ------------------------
export async function salvarCompraCompleta(dados: {
  fornecedor_id: number;
  usuario_id: number;

  valor_total: number;
  tipo_pagamento: "avista" | "parcelado";
  forma_pagamento: "dinheiro" | "pix" | "cartao" | "boleto";
  status?: string;
  observacoes?: string;
  itens: {
    produto_id: number;
    quantidade: number;
    custo_unitario: number;
  }[];
  vencimento?: string;
  parcelas?: number;
  conta_id?: number;
  origem_pagamento?: string;

  // qtde de parcelas (se a prazo)
}) {
  const conn = await pool.getConnection();
  const empresa_id = global.usuarioLogado.empresa_id
  try {
    await conn.beginTransaction();


    // 🔎 Validações
    if (!dados.itens || dados.itens.length === 0) {
      throw new Error("Nenhum item informado na compra.");
    }

    for (const item of dados.itens) {
      if (!item.produto_id) throw new Error("Produto inválido.");
      if (item.quantidade <= 0) throw new Error("Quantidade inválida.");
      if (item.custo_unitario <= 0) throw new Error("Custo inválido.");
    }
    if (!dados.usuario_id) {
      throw new Error("Usuário não identificado para o movimento financeiro");
    }
    if (dados.tipo_pagamento === "avista") {
      if (!dados.origem_pagamento) {
        throw new Error("Origem do pagamento não informada");
      }

      if (dados.origem_pagamento === "conta" && !dados.conta_id) {
        throw new Error("Conta financeira não informada.");
      }
    }

    if (!["avista", "parcelado"].includes(dados.tipo_pagamento)) {
      throw new Error("Tipo de pagamento inválido");
    }


    // 1️⃣ Criar compra
    const [compra]: any = await conn.query(`
  INSERT INTO compras
    (fornecedor_id, usuario_id, valor_total, tipo_pagamento, forma_pagamento, origem_pagamento, caixa_id, conta_id, status, observacoes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
      dados.fornecedor_id,
      dados.usuario_id,
      dados.valor_total,
      dados.tipo_pagamento,
      dados.forma_pagamento,
      dados.origem_pagamento,
      null, // caixa_id depois se for caixa
      dados.origem_pagamento === "conta" ? dados.conta_id : null,
      dados.status || "aberta",
      dados.observacoes || null
    ]);


    const compra_id = compra.insertId;

    // 2️⃣ Itens da compra
    for (const item of dados.itens) {
      await conn.query(
        `
        INSERT INTO itens_compra
          (compra_id, produto_id, quantidade, custo_unitario)
        VALUES (?, ?, ?, ?)
        `,
        [compra_id, item.produto_id, item.quantidade, item.custo_unitario]
      );
    }

    // 3️⃣ Criar conta a pagar
    const [conta]: any = await conn.query(
      `
      INSERT INTO contas_pagar
        (empresa_id, compra_id, fornecedor_id, descricao, valor_total, status, criado_em)
      VALUES (?, ?, ?, ?, ?, 'aberto', NOW())
      `,
      [
        empresa_id,
        compra_id,
        dados.fornecedor_id,
        `Compra #${compra_id}`,
        dados.valor_total
      ]
    );

    const conta_pagar_id = conta.insertId;

    // 4️⃣ Criar parcelas SOMENTE se for a prazo
    if (dados.tipo_pagamento === "parcelado") {
      if (!dados.parcelas || dados.parcelas < 1) {
        throw new Error("Número de parcelas inválido.");
      }

      if (!dados.vencimento) {
        throw new Error("Data de vencimento não informada.");
      }

      const totalParcelas = dados.parcelas;
      /*const valorParcela = Number(
        (dados.valor_total / totalParcelas).toFixed(2)
      );
    */
      const dataBase = new Date(dados.vencimento);

      if (isNaN(dataBase.getTime())) {
        throw new Error("Data de vencimento inválida.");
      }


      if (isNaN(dataBase.getTime())) {
        throw new Error("Data de vencimento inválida.");
      }

      const base = fixMoney(dados.valor_total / totalParcelas);
      let acumulado = 0;

      for (let i = 1; i <= totalParcelas; i++) {
        const vencimento = new Date(dataBase);
        vencimento.setMonth(dataBase.getMonth() + (i - 1));

        let valor = base;

        // ✅ última parcela ajusta diferença
        if (i === totalParcelas) {
          valor = fixMoney(dados.valor_total - acumulado);
        }

        acumulado = fixMoney(acumulado + valor);

        await conn.query(
          `
    INSERT INTO parcelas_pagar
      (conta_pagar_id, numero_parcela, valor, valor_pago, data_vencimento, status)
    VALUES (?, ?, ?, 0, ?, 'aberto')
    `,
          [
            conta_pagar_id,
            i,
            valor,
            vencimento.toISOString().slice(0, 10),
          ]
        );
      }

    }
    if (dados.tipo_pagamento === "avista") {

      if (!dados.origem_pagamento) {
        throw new Error("Origem do pagamento não informada");
      }

      // ✅ Marca conta a pagar como paga
      await conn.query(
        `UPDATE contas_pagar SET status = 'pago' WHERE id = ?`,
        [conta_pagar_id]
      );

      // =========================
      // ✅ PAGAMENTO PELO CAIXA
      // =========================
      if (dados.origem_pagamento === "caixa") {

        const [rows]: any = await conn.query(`
      SELECT id 
      FROM caixa_sessoes
      WHERE usuario_id = ?
        AND empresa_id = ?
        AND status = 'aberto'
      LIMIT 1
    `, [dados.usuario_id, empresa_id]);

        if (!rows.length) {
          throw new Error("Nenhum caixa aberto para este usuário.");
        }

        const caixa_id = rows[0].id;

        // ✅ atualiza compra com caixa
        await conn.query(`
      UPDATE compras 
      SET origem_pagamento = 'caixa', caixa_id = ?
      WHERE id = ?
    `, [caixa_id, compra_id]);

        await conn.query(`
      INSERT INTO caixa_movimentos
        (caixa_id, tipo, valor, descricao, origem, forma_pagamento, usuario_id, criado_em)
      VALUES (?, 'saida', ?, ?, 'compra', ?, ?, NOW())
    `, [
          caixa_id,
          dados.valor_total,
          `Compra #${compra_id}`,
          dados.forma_pagamento,
          dados.usuario_id
        ]);

      }

      // =========================
      // ✅ PAGAMENTO POR CONTA
      // =========================
      if (dados.origem_pagamento === "conta") {

        if (!dados.conta_id) {
          throw new Error("Conta financeira não informada.");
        }

        await conn.query(`
      UPDATE compras 
      SET origem_pagamento = 'conta', conta_id = ?
      WHERE id = ?
    `, [dados.conta_id, compra_id]);

        await conn.query(`
      INSERT INTO financeiro_movimentos
        (conta_id, tipo, valor, forma_pagamento, descricao, referencia_tipo, referencia_id, usuario_id)
      VALUES (?, 'saida', ?, ?, 'Compra', 'compra', ?, ?)
    `, [
          dados.conta_id,
          dados.valor_total,
          dados.forma_pagamento,
          compra_id,
          dados.usuario_id
        ]);

        await atualizarSaldoConta(
          conn,
          dados.conta_id,
          dados.valor_total,
          'saida'
        );
      }

    }



    await conn.commit();
    return { sucesso: true, compra_id };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function finalizarCompra(compraId: number) {
  // 1️⃣ Buscar itens da compra
  const [itens]: any = await pool.query(
    "SELECT produto_id, quantidade, custo_unitario FROM itens_compra WHERE compra_id = ?",
    [compraId]
  );

  // 2️⃣ Atualizar estoque e custo
  for (const item of itens) {
    await pool.query(
      `UPDATE produto 
       SET 
        EstoqueAtual = COALESCE(EstoqueAtual,0) + ?,
        CustoUltimaCompra = ?,
        CustoMedio = (
          ((COALESCE(EstoqueAtual,0) * COALESCE(CustoMedio,0)) + (? * ?))
          / (COALESCE(EstoqueAtual,0) + ?)
        )
      WHERE CodigoProduto = ?`,
      [
        item.quantidade,
        item.custo_unitario,
        item.quantidade,
        item.custo_unitario,
        item.quantidade,
        item.produto_id
      ]
    );
    await registrarMovimentoEstoque({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      custo_unitario: item.custo_unitario,
      documento_id: compraId,
      observacao: `Compra #${compraId}`,
      tipo: 'entrada',
      origem: 'compra'
    });
  }

  // 3️⃣ Finalizar compra
  await pool.query(
    "UPDATE compras SET status = 'finalizada', atualizado_em = NOW() WHERE id = ?",
    [compraId]
  );
  const [compra] = await pool.query(`SELECT * FROM compras WHERE id = ? `, [compraId]

  )
  registrarMovimentoEstoque
  return { success: true };
}
