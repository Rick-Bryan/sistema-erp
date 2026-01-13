// src/backend/compras.ts
import pool from './connection';
import { registrarMovimentoEstoque } from './estoque_movimento';

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
  forma_pagamento,
  status,
  observacoes
}) {
  const [result] = await pool.query(
    `INSERT INTO compras 
      (fornecedor_id, usuario_id, valor_total, forma_pagamento, status, observacoes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fornecedor_id, usuario_id, valor_total, forma_pagamento, status, observacoes]
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
  empresa_id: number;
  valor_total: number;
  forma_pagamento: "à vista" | "a prazo";
  status?: string;
  observacoes?: string;
  itens: {
    produto_id: number;
    quantidade: number;
    custo_unitario: number;
  }[];
  vencimento?: string;
  parcelas?: number;

  // qtde de parcelas (se a prazo)
}) {
  const conn = await pool.getConnection();

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

    // 1️⃣ Criar compra
    const [compra]: any = await conn.query(
      `
      INSERT INTO compras
        (fornecedor_id, usuario_id, valor_total, forma_pagamento, status, observacoes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        dados.fornecedor_id,
        dados.usuario_id,
        dados.valor_total,
        dados.forma_pagamento,
        dados.status || "aberta",
        dados.observacoes || null
      ]
    );

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
        dados.empresa_id,
        compra_id,
        dados.fornecedor_id,
        `Compra #${compra_id}`,
        dados.valor_total
      ]
    );

    const conta_pagar_id = conta.insertId;

    // 4️⃣ Criar parcelas SOMENTE se for a prazo
    if (dados.forma_pagamento === "a prazo") {
      if (!dados.parcelas || dados.parcelas < 1) {
        throw new Error("Número de parcelas inválido.");
      }

      if (!dados.vencimento) {
        throw new Error("Data de vencimento não informada.");
      }

      const totalParcelas = dados.parcelas;
      const valorParcela = Number(
        (dados.valor_total / totalParcelas).toFixed(2)
      );

      const dataBase = new Date(dados.vencimento);

      if (isNaN(dataBase.getTime())) {
        throw new Error("Data de vencimento inválida.");
      }

      for (let i = 1; i <= totalParcelas; i++) {
        const vencimento = new Date(dataBase);
        vencimento.setMonth(dataBase.getMonth() + (i - 1));

        await conn.query(
          `
      INSERT INTO parcelas_pagar
        (conta_pagar_id, numero_parcela, valor, valor_pago, data_vencimento, status)
      VALUES (?, ?, ?, 0, ?, 'aberto')
      `,
          [
            conta_pagar_id,
            i,
            valorParcela,
            vencimento.toISOString().slice(0, 10)
          ]
        );
      }
    }
    if (dados.forma_pagamento === "à vista") {
      await conn.query(
        `
    UPDATE contas_pagar
    SET status = 'pago'
    WHERE id = ?
    `,
        [conta_pagar_id]
      );
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
  }

  // 3️⃣ Finalizar compra
  await pool.query(
    "UPDATE compras SET status = 'finalizada', atualizado_em = NOW() WHERE id = ?",
    [compraId]
  );


  return { success: true };
}
