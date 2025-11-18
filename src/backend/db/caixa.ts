import pool from './connection';

export async function listarSessoesCaixa() {

  const [rows] = await pool.query('SELECT * FROM caixa_sessoes ORDER BY id DESC');
  return rows;
};

export async function listarMovimentosCaixa() {
  const [rows] = await pool.query('SELECT * FROM caixa_movimentos ORDER BY id DESC');
  return rows;
};
export async function resumoMovimentosCaixa(caixaId: number) {
  const [rows] = await pool.query(
    'SELECT * FROM caixa_movimentos WHERE caixa_id = ? ORDER BY id DESC',
    [caixaId]
  );
  return rows;
}
export async function abrirCaixa({ usuario_id, valor_abertura, observacoes }) {

  const [verify] = await pool.query('SELECT * FROM caixa_sessoes WHERE usuario_id = ? AND status = "Aberto"',[usuario_id])

  if(verify.length > 0){
    throw new Error("O Colaborador ja possui um caixa em aberto");
  }
  const [result] = await pool.query(
    'INSERT INTO caixa_sessoes (usuario_id, valor_abertura, observacoes) VALUES (?, ?, ?)',
    [usuario_id, valor_abertura, observacoes]
  );
  return { id: result.insertId };
};
export async function inserirMovimentoCaixa({ usuario_id, caixa_id, observacoes, tipo, descricao, valor, origem, venda_id }) {
  const [result] = await pool.query(
    'INSERT INTO caixa_movimentos(usuario_id,caixa_id,observacoes,tipo,descricao,valor,origem,venda_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuario_id, caixa_id, observacoes, tipo, descricao, valor, origem, venda_id]
  );
  return { id: result.insertId };
};

export async function registrarVendaNoCaixa({ caixa_id, venda_id }) {
  // Busca venda
  const [vendas] = await pool.query(
    'SELECT valor_total, forma_pagamento FROM vendas WHERE id = ?',
    [venda_id]
  );

  if (!vendas.length) throw new Error("Venda não encontrada");

  const venda = vendas[0];

  const [result] = await pool.query(
    `
      INSERT INTO caixa_movimentos
      (caixa_id, venda_id, tipo, valor, forma_pagamento, descricao, data_movimento)
      VALUES (?, ?, 'entrada', ?, ?, ?, NOW())
    `,
    [
      caixa_id,
      venda_id,
      venda.valor_total,
      venda.forma_pagamento,
      `Venda #${venda_id}`
    ]
  );

  return { id: result.insertId };
}
export async function registrarCancelamentoVenda({
  caixa_id,
  venda_id
}) {
  // Consulta a venda
  const [vendas] = await pool.query(
    'SELECT valor_total, forma_pagamento FROM vendas WHERE id = ?',
    [venda_id]
  );

  if (!vendas.length) throw new Error("Venda não encontrada");

  const venda = vendas[0];

  const [result] = await pool.query(
    `
      INSERT INTO caixa_movimentos
      (caixa_id, venda_id, tipo, valor, forma_pagamento, descricao, data_movimento)
      VALUES (?, ?, 'saída', ?, ?, ?, NOW())
    `,
    [
      caixa_id,
      venda_id,
      venda.valor_total,
      venda.forma_pagamento,
      `Cancelamento da venda #${venda_id}`
    ]
  );

  return { id: result.insertId };
}

export async function resumoCaixa(caixa_id) {
  const [entradasRow] = await pool.query(
    `SELECT IFNULL(SUM(valor),0) AS total FROM caixa_movimentos WHERE caixa_id = ? AND tipo = 'entrada'`,
    [caixa_id]
  );
  const [saidasRow] = await pool.query(
    `SELECT IFNULL(SUM(valor),0) AS total FROM caixa_movimentos WHERE caixa_id = ? AND tipo = 'saida'`,
    [caixa_id]
  );
  const [sessRows] = await pool.query('SELECT * FROM caixa_sessoes WHERE id = ?', [caixa_id]);
  if (!sessRows.length) throw new Error('Sessão de caixa não encontrada');
  const sessao = sessRows[0];

  const valor_abertura = Number(sessao.valor_abertura || 0);
  const entradas = Number(entradasRow[0].total || 0);
  const saidas = Number(saidasRow[0].total || 0);
  const saldo_esperado = valor_abertura + entradas - saidas;

  return {
    valor_abertura,
    total_entradas: entradas,
    total_saidas: saidas,
    saldo_esperado,
  };
}

export async function fecharCaixa({ caixa_id, valor_fechamento = null }) {
  // calcula total automaticamente se valor_fechamento não fornecido
  const resumo = await resumoCaixa(caixa_id);
  const totalFinal = valor_fechamento !== null ? Number(valor_fechamento) : resumo.saldo_esperado;

  const [result] = await pool.query(
    `UPDATE caixa_sessoes SET fechado_em = NOW(), valor_fechamento = ?, status = 'fechado' WHERE id = ?`,
    [totalFinal, caixa_id]
  );
  return { changes: result.affectedRows, valor_fechamento: totalFinal };
}