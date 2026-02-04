import pool from "./connection"
import { checkPermissaoPorSlug } from "./perms";
import { pagarVenda } from "./vendas";
export function fixMoney(v: number) {
  return Number(Number(v).toFixed(2));
}

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
      vencimento: new Date()
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
  forma_pagamento,
  usuario_id,
  caixa_id,
  conta_id
}) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {

    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "financeiro",
      acao: "ediitar"
    });


    const [[parcela]] = await conn.query(`
  SELECT p.*, c.venda_id
  FROM parcelas_receber p
  JOIN contas_receber c ON c.id = p.conta_receber_id
  WHERE p.id = ?
`, [parcela_id]);


    if (!parcela) throw new Error("Parcela não encontrada");
    if (parcela.status === 'pago') {
      throw new Error('Parcela já está quitada');
    }


    const novoValorPago = Number(
      (Number(parcela.valor_pago || 0) + Number(valor_pago)).toFixed(2)
    );


    if (novoValorPago > parcela.valor) {
      throw new Error('Valor pago excede o valor da parcela');
    }

    let status = 'aberto';

    if (novoValorPago >= parcela.valor) {
      status = 'pago';
    } else if (novoValorPago > 0) {
      status = 'parcial';
    }


    // Atualiza parcela

    await conn.query(
      `UPDATE parcelas_receber
   SET valor_pago = ?,
       status = ?,
       data_pagamento = ?
   WHERE id = ?`,
      [
        novoValorPago,
        status,
        status === 'pago' ? new Date() : null,
        parcela_id
      ]
    );

    // Atualiza conta (SOMANDO)
    // Atualiza apenas valor_pago


    await atualizarStatusContaReceber(parcela.conta_receber_id, conn);


    // Registra no caixa
    await conn.query(
      `INSERT INTO caixa_movimentos
       (caixa_id, tipo, origem, descricao, valor, forma_pagamento, usuario_id, venda_id, criado_em)
       VALUES (?, 'entrada', 'conta_receber', ?, ?, ?, ?, ?, NOW())`,
      [
        caixa_id,
        `Recebimento parcela ${parcela.numero_parcela}`,
        valor_pago,
        forma_pagamento,
        usuario_id,
        parcela.venda_id ?? null
      ]
    );


    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function dashboardFinanceiro() {
  const [rows] = await pool.query(`
    SELECT
      SUM(p.valor - p.valor_pago) AS total_receber,
      SUM(
        CASE
          WHEN p.data_vencimento < CURDATE()
           AND p.status <> 'pago'
          THEN (p.valor - p.valor_pago)
          ELSE 0
        END
      ) AS total_atraso
    FROM parcelas_receber p
  `);

  return rows[0];
}

async function atualizarStatusContaReceber(contaId, conn = pool) {
  const [[res]] = await conn.query(`
    SELECT 
      ROUND(SUM(pr.valor),2) AS total,
      ROUND(SUM(COALESCE(pr.valor_pago,0)),2) AS pago,
      cr.venda_id
    FROM parcelas_receber pr
    JOIN contas_receber cr ON cr.id = pr.conta_receber_id
    WHERE pr.conta_receber_id = ?
  `, [contaId]);

  let total = Number(res.total || 0);
  let pago = Number(res.pago || 0);

  // 🛡 blindagem financeira
  total = Number(total.toFixed(2));
  pago = Number(pago.toFixed(2));

  if (pago > total) pago = total;

  let status = "aberto";

  if (pago === total) status = "pago";
  else if (pago > 0) status = "parcial";

  await conn.query(
    `UPDATE contas_receber SET valor_pago = ?, status = ? WHERE id = ?`,
    [pago, status, contaId]
  );

  if (status === 'pago' && res.venda_id) {
    await conn.query(
      `UPDATE vendas SET status = 'pago' WHERE id = ?`,
      [res.venda_id]
    );
  }
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
    SELECT
      cp.id,
      cp.compra_id,
      f.nome AS fornecedor_nome,

      cp.valor_total,

      COALESCE(SUM(pp.valor_pago), 0) AS valor_pago,

      cp.valor_total - COALESCE(SUM(pp.valor_pago), 0) AS valor_restante,

      cp.status
    FROM contas_pagar cp
    LEFT JOIN fornecedores f 
      ON f.CodigoFornecedor = cp.fornecedor_id
    LEFT JOIN parcelas_pagar pp 
      ON pp.conta_pagar_id = cp.id
    GROUP BY cp.id
    ORDER BY cp.id DESC
  `);

  return rows;
}

export async function dashboardPagar() {
  const [[rows]] = await pool.query(`
    SELECT
      SUM(p.valor - IFNULL(p.valor_pago, 0)) AS total_pagar,
      SUM(
        CASE
          WHEN p.data_vencimento < CURDATE()
           AND p.status <> 'pago'
          THEN (p.valor - IFNULL(p.valor_pago, 0))
          ELSE 0
        END
      ) AS total_atraso
    FROM parcelas_pagar p
  `);

  return {
    total_pagar: rows.total_pagar || 0,
    total_atraso: rows.total_atraso || 0,
  };
}
export async function baixarParcelaPagar({
  parcela_id,
  valor_pago,
  forma_pagamento,
  usuario_id,
  caixa_id,
  origemPagamento,
  conta_id

}) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "financeiro",
      acao: "editar"
    });
    // 1️⃣ Busca parcela + conta
    const [[parcela]] = await conn.query(`
  SELECT 
    pp.*,
    cp.id AS conta_pagar_id,
    cp.compra_id
  FROM parcelas_pagar pp
  JOIN contas_pagar cp ON cp.id = pp.conta_pagar_id
  WHERE pp.id = ?
`, [parcela_id]);

    if (!Number.isInteger(parcela_id)) {
      throw new Error('Parcela inválida');
    }

    if (!Number.isInteger(usuario_id)) {
      throw new Error('Usuário inválido');
    }

    if (!valor_pago || valor_pago <= 0) {
      throw new Error('Valor pago inválido');
    }

    if (!forma_pagamento) {
      throw new Error('Forma de pagamento não informada');
    }

    if (!origemPagamento) {
      throw new Error('Origem do pagamento não informada');
    }

    if (origemPagamento === 'caixa') {
      if (!Number.isInteger(caixa_id)) {
        throw new Error('Caixa não informado');
      }
    }

    if (origemPagamento === 'banco' || origemPagamento === 'cofre') {
      if (!Number.isInteger(conta_id)) {
        throw new Error('Conta financeira não informada');
      }
    }


    if (!parcela) {
      throw new Error("Parcela não encontrada");
    }

    if (parcela.status === 'pago') {
      throw new Error("Parcela já está quitada");
    }
    let novoValorPago = fixMoney(
      Number(parcela.valor_pago || 0) + Number(valor_pago)
    );

    const valorParcela = fixMoney(parcela.valor);

    // trava para nunca passar
    if (novoValorPago > valorParcela) {
      novoValorPago = valorParcela;
    }
    ;
    const pagoFinal = fixMoney(novoValorPago);

    const novoStatus =
      pagoFinal >= valorParcela ? "pago" : "aberto";


    await conn.query(`
  UPDATE parcelas_pagar
SET
  valor_pago = ROUND(?,2),
  status = ?,
  data_pagamento = ?
WHERE id = ?

`, [
      pagoFinal,
      novoStatus,
      novoStatus === 'pago' ? new Date() : null,
      parcela_id
    ]);


    // 3️⃣ Atualiza status da conta (somando parcelas)
    await atualizarStatusContaPagar(parcela.conta_pagar_id, conn);

    // 4️⃣ Lança SAÍDA no caixa
    if (origemPagamento === 'caixa') {
      await conn.query(`
  INSERT INTO caixa_movimentos
    (caixa_id, tipo, origem, descricao, valor, forma_pagamento, usuario_id, criado_em)
  VALUES
    (?, 'saida', 'conta_pagar', ?, ?, ?, ?, NOW())
`, [
        caixa_id,
        `Pagamento parcela ${parcela.numero_parcela}`,
        pagoFinal,
        forma_pagamento,
        usuario_id
      ]);

    }

    if (origemPagamento !== 'caixa') {
      await conn.query(`
  INSERT INTO financeiro_movimentos
    (origem, tipo, descricao, valor, forma_pagamento, usuario_id, referencia_tipo)
  VALUES
    (?, 'saida', ?, ?, ?, ?, ?)
`, [
        origemPagamento,
        'Pagamento de parcela',
        pagoFinal,
        forma_pagamento,
        usuario_id,
        'Parcela pagar'
      ]);


      await atualizarSaldoConta(
        conn,
        conta_id,
        pagoFinal,
        'saida'
      );
    }

    if (pagoFinal <= 0) {
      throw new Error('Valor aplicado inválido');
    }

    console.log(
      conta_id,
      pagoFinal,
      valor_pago,
      'saida')
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function atualizarStatusContaPagar(contaId, conn = pool) {
  const [[res]] = await conn.query(`
    SELECT
      ROUND(SUM(valor),2) AS total,
      ROUND(SUM(valor_pago),2) AS pago
    FROM parcelas_pagar
    WHERE conta_pagar_id = ?
  `, [contaId]);

  const total = fixMoney(res.total || 0);
  const pago = fixMoney(res.pago || 0);

  let status = "aberto";
  if (pago >= total) status = "pago";
  else if (pago > 0) status = "parcial";

  await conn.query(`
    UPDATE contas_pagar
    SET 
      status = ?,
      valor_pago = ?
    WHERE id = ?
  `, [status, pago, contaId]);
}



export async function listarParcelasPagar(contaId, conn = pool) {
  const [rows] = await conn.query(`
      SELECT *
      FROM parcelas_pagar
      WHERE conta_pagar_id = ?
      ORDER BY numero_parcela
    `, [contaId]);

  return rows;
}
export async function registrarMovimentoFinanceiro({
  origem,
  conta_id,
  tipo,
  valor,
  descricao,
  forma_pagamento = null,
  usuario_id,
  referencia_tipo = null,
  referencia_id = null,
  tipo_pagamento = "avista",
}) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `
      INSERT INTO financeiro_movimentos
        (origem, conta_id, tipo, descricao, valor, forma_pagamento, usuario_id, referencia_tipo, referencia_id, criado_em, tipo_pagamento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        origem,
        conta_id,
        tipo,
        descricao,
        valor,
        forma_pagamento,
        usuario_id,
        referencia_tipo,
        referencia_id,
        tipo_pagamento,
      ]
    );

    const operador = tipo === "entrada" ? "+" : "-";

    await conn.query(
      `
      UPDATE financeiro_contas
      SET saldo = saldo ${operador} ?
      WHERE id = ?
      `,
      [valor, conta_id]
    );

    await conn.commit();
    return true;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function atualizarSaldoConta(
  conn: any,
  conta_id: number,
  valor: number,
  tipo: 'entrada' | 'saida'
) {
  const operador = tipo === 'entrada' ? '+' : '-';

  await conn.query(
    `
    UPDATE financeiro_contas
    SET saldo = saldo ${operador} ?
    WHERE id = ?
    `,
    [valor, conta_id]
  );
}
