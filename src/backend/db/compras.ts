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
  status = 'aberta',
  observacoes,
}: {
  fornecedor_id: number;
  usuario_id: number;
  valor_total: number;
  forma_pagamento: string;
  status?: string;
  observacoes?: string;
}) {
  const [result]: any = await pool.query(
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
export async function criarItensCompra({
  compra_id,
  produto_id,
  quantidade,
  custo_unitario,
}: {
  compra_id: number;
  produto_id: number;
  quantidade: number;
  custo_unitario: number;
}) {
  const [result]: any = await pool.query(
    'INSERT INTO itens_compra (compra_id, produto_id, quantidade, custo_unitario) VALUES (?,?,?,?)',
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

    // 1️⃣ Criar compra
    const compra_id = await criarCompra({
      fornecedor_id: dados.fornecedor_id,
      usuario_id: dados.usuario_id,
      valor_total: dados.valor_total,
      forma_pagamento: dados.forma_pagamento,
      status: dados.status || 'aberta',
      observacoes: dados.observacoes,
    });

    // 2️⃣ Criar itens e registrar estoque
    for (const item of dados.itens || []) {
      await criarItensCompra({ compra_id, ...item });

      await registrarMovimentoEstoque(
        item.produto_id,
        item.quantidade,
        item.custo_unitario,
        'compra',
        compra_id,
        `Entrada por compra #${compra_id}`
      );
    }

    // 3️⃣ Criar contas a pagar
    await criarContasPagar({
      compra_id,
      fornecedor_id: dados.fornecedor_id,
      valor: dados.valor_total,
      vencimento: dados.vencimento,
      forma_pagamento: dados.forma_pagamento,
    });

    await conn.commit();
    return { sucesso: true, id: compra_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
