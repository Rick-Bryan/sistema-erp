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
  valor_total: number;
  forma_pagamento: string;
  status?: string;
  observacoes?: string;
  itens: {
    produto_id: number;
    quantidade: number;
    custo_unitario: number;
  }[];
  vencimento: string;
}) {

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 🔎 VALIDAR ITENS ANTES DE QUALQUER INSERT
    if (!dados.itens || dados.itens.length === 0) {
      throw new Error("Nenhum item informado na compra.");
    }

    for (const item of dados.itens) {
      if (!item.produto_id || item.produto_id === 0) {
        throw new Error("Item de compra inválido: produto não selecionado.");
      }
      if (!item.quantidade || item.quantidade <= 0) {
        throw new Error("Item de compra inválido: quantidade inválida.");
      }
      if (!item.custo_unitario || item.custo_unitario <= 0) {
        throw new Error("Item de compra inválido: custo unitário inválido.");
      }
    }

    // 1️⃣ Criar compra (agora usando conn)
    const [compra] = await conn.query(
      `INSERT INTO compras (fornecedor_id, usuario_id, valor_total, forma_pagamento, status, observacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.fornecedor_id,
        dados.usuario_id,
        dados.valor_total,
        dados.forma_pagamento,
        dados.status || "aberta",
        dados.observacoes || null,
      ]
    );

    const compra_id = (compra as any).insertId;

    // 2️⃣ Criar itens + registrar estoque
    for (const item of dados.itens) {
      await conn.query(
        `INSERT INTO itens_compra (compra_id, produto_id, quantidade, custo_unitario)
         VALUES (?, ?, ?, ?)`,
        [compra_id, item.produto_id, item.quantidade, item.custo_unitario]
      );

      // 💾 Registrar estoque
      await registrarMovimentoEstoque({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        custo_unitario: item.custo_unitario,
        documento_id: compra_id,
        observacao: `Entrada por compra #${compra_id}`,
        tipo: 'entrada',
        origem: 'compra'
      });



    }

    // 3️⃣ Criar contas a pagar (com correção)
    await conn.query(
      `INSERT INTO contas_pagar (compra_id, fornecedor_id, valor, vencimento, forma_pagamento, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        compra_id,
        dados.fornecedor_id,
        dados.valor_total,
        dados.vencimento,
        dados.forma_pagamento,
        "pendente",
      ]
    );

    await conn.commit();
    return { sucesso: true, id: compra_id };

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
          ( (COALESCE(EstoqueAtual,0) * COALESCE(CustoMedio,0)) + (? * ?) )
          / (COALESCE(EstoqueAtual,0) + ?)
        )
      WHERE CodigoProduto = ?
      `,
      [
        item.quantidade,             // + quantidade
        item.custo_unitario,         // custo última compra
        item.quantidade,             // para custo médio: quantidade
        item.custo_unitario,         // valor unitário
        item.quantidade,             // nova quantidade total
        item.produto_id              // produto
      ]
    );
  }

  // 3️⃣ Finalizar compra
  await pool.query(
    "UPDATE compras SET status = 'paga', atualizado_em = NOW() WHERE id = ?",
    [compraId]
  );

  return { success: true };
}
