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
    caixa_id
}) {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
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

        const novoValorPago = Number(parcela.valor_pago) + Number(valor_pago);


        if (novoValorPago > parcela.valor) {
            throw new Error('Valor pago excede o valor da parcela');
        }

        const status = novoValorPago >= parcela.valor ? "pago" : "parcial";

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
        await conn.query(`
  UPDATE contas_receber
  SET valor_pago = valor_pago + ?
  WHERE id = ?
`, [valor_pago, parcela.conta_receber_id]);

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