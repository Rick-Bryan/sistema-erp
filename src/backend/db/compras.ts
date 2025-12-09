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
