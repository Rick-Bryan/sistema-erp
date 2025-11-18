import pool from './connection.js';

/** Lista todas as vendas */
export async function listarVendas() {
  const [rows] = await pool.query(`
    SELECT 
      v.id,
      c.nome AS cliente_nome,
      u.nome AS usuario_nome,
      v.data_venda,
      v.valor_total,
      v.forma_pagamento,
      v.status,
      v.observacoes,
      v.criado_em,
      v.atualizado_em
    FROM vendas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN usuarios u ON v.usuario_id = u.id
    ORDER BY v.id DESC
  `);
  return rows;
}

/** Cria uma nova venda */
export async function criarVenda({ cliente_id, usuario_id, valor_total, forma_pagamento, status, observacoes }) {
  const [result] = await pool.query(
    `INSERT INTO vendas (cliente_id, usuario_id, valor_total, forma_pagamento, status, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cliente_id, usuario_id, valor_total, forma_pagamento, status, observacoes]
  );
  return { id: result.insertId };
}

/** Atualiza uma venda existente */
export async function atualizarVenda({ id, cliente_id, valor_total, forma_pagamento, status, observacoes }) {
  await pool.query(
    `UPDATE vendas SET cliente_id=?, valor_total=?, forma_pagamento=?, status=?, observacoes=? WHERE id=?`,
    [cliente_id, valor_total, forma_pagamento, status, observacoes, id]
  );
  return true;
}

/** Exclui uma venda */
export async function deletarVenda(id) {
  await pool.query(`DELETE FROM vendas WHERE id=?`, [id]);
  return true;
}
export async function pagarVenda(id, forma_pagamento, usuarioId, caixaId) {
  const [result] = await pool.query(`
        UPDATE vendas
        SET status = 'pago', forma_pagamento = ?, atualizado_em = NOW()
        WHERE id = ?
    `, [forma_pagamento, id]);

  if (result.affectedRows === 0) {
    return { sucesso: false, mensagem: "Venda não encontrada" };
  }

  // cria movimento no caixa
  await pool.query(`
    INSERT INTO caixa_movimentos
    (caixa_id, venda_id, tipo, descricao, valor, origem, criado_em, usuario_id)
    SELECT 
        ?,                -- caixa_id
        id,               -- venda_id
        'entrada',        -- tipo
        CONCAT('Venda #', id, ' paga'),
        valor_total,      -- valor
        'venda',          -- origem
        NOW(),            -- criado_em
        ?
    FROM vendas
    WHERE id = ?
  `, [caixaId, usuarioId, id]);

  return { sucesso: true };
}
