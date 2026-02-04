// caixa.service.js
// Módulo otimizado para operações de Caixa / Fluxo
// Requisitos: pool exportado de ./connection (mysql2/promise)
import { registrarMovimentoFinanceiro } from './financeiro';
import pool from './connection';
import { checkPermissaoPorSlug } from './perms';

/**
 * Valida se um valor é inteiro positivo
 * @param {any} v
 * @returns {boolean}
 */
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

/**
 * Listar sessões de caixa (todas)
 * @returns {Promise<Array>}
 */
export async function listarSessoesCaixa() {
  const [rows] = await pool.query('SELECT * FROM caixa_sessoes ORDER BY id DESC');
  return rows;
};

/**
 * Listar movimentos de caixa (todas)
 * @returns {Promise<Array>}
 */
export async function listarMovimentosCaixa() {
  const [rows] = await pool.query('SELECT * FROM caixa_movimentos ORDER BY id DESC');
  return rows;
};

/**
 * Resumo dos movimentos de um caixa específico
 * @param {number} caixaId
 * @returns {Promise<Array>}
 */
export async function resumoMovimentosCaixa(caixaId) {
  if (!isPositiveInt(caixaId)) throw new Error('caixaId inválido');
  const [rows] = await pool.query(
    'SELECT * FROM caixa_movimentos WHERE caixa_id = ? ORDER BY id DESC',
    [caixaId]
  );
  return rows;
}

/**
 * Retorna sessão de caixa aberta para usuário/empresa/pdv.
 * Se não existir cria automaticamente e retorna o id.
 *
 * @param {number} usuario_id
 * @param {number|null} empresa_id
 * @param {number|null} pdv_id
 * @returns {Promise<number>} id da sessão aberta
 */
export async function getCaixaAberto(usuario_id, empresa_id = null, pdv_id = null) {
  if (!isPositiveInt(usuario_id)) throw new Error('usuario_id inválido');

  const sqlSelect = `
    SELECT id 
    FROM caixa_sessoes 
    WHERE usuario_id = ? 
      AND (? IS NULL OR empresa_id = ?)
      AND (? IS NULL OR pdv_id = ?)
      AND status = 'aberto'
    ORDER BY id DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(sqlSelect, [usuario_id, empresa_id, empresa_id, pdv_id, pdv_id]);

  if (rows.length > 0) {
    return rows[0].id;
  }

  // Se não existir, criar em transação para evitar race condition
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const insertSql = `
      INSERT INTO caixa_sessoes (usuario_id, empresa_id, pdv_id, valor_abertura, observacoes, status, criado_em)
      VALUES (?, ?, ?, 0, 'Abertura automática', 'aberto', NOW())
    `;
    const [result] = await conn.query(insertSql, [usuario_id, empresa_id, pdv_id]);

    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Abrir caixa explicitamente (não cria automaticamente se já houver aberto)
 * @param {{usuario_id:number, valor_abertura:number, observacoes:string, empresa_id?:number, pdv_id?:number}} param0
 * @returns {Promise<{id:number}>}
 */
export async function abrirCaixa({
  usuario_id,
  valor_abertura = 0,
  observacoes = '',
  pdv_id = null
}) {
  if (!isPositiveInt(usuario_id)) throw new Error('usuario_id inválido');

  if (!global.usuarioLogado) {
    throw new Error("Sessão expirada");
  }

  const empresa_id = global.usuarioLogado.empresa_id;

  if (!empresa_id) {
    throw new Error("Empresa não identificada");
  }

  await checkPermissaoPorSlug({
    usuario_id,
    slug: "caixa-fluxo",
    acao: "criar"
  });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [verify] = await conn.query(
      `
      SELECT id 
      FROM caixa_sessoes 
      WHERE usuario_id = ?
        AND empresa_id = ?
        AND (? IS NULL OR pdv_id = ?)
        AND status = 'aberto'
      `,
      [usuario_id, empresa_id, pdv_id, pdv_id]
    );

    if (verify.length > 0) {
      throw new Error('O colaborador já possui um caixa aberto nesta empresa/PDV');
    }

    const valor = Number(valor_abertura) || 0;

    if (valor < 0) {
      throw new Error("Valor de abertura inválido");
    }

    let cofre = null; // ✅ fora do if

    // 🔥 Retira do cofre
    if (valor > 0) {
      const [rows] = await conn.query(
        `
        SELECT id, saldo 
        FROM financeiro_contas 
        WHERE empresa_id = ? AND tipo = 'cofre'
        LIMIT 1
        `,
        [empresa_id]
      );

      if (!rows.length) {
        throw new Error("Cofre não encontrado");
      }

      cofre = rows[0]; // ✅ salva

      if (Number(cofre.saldo) < valor) {
        throw new Error("Saldo insuficiente no cofre");
      }


    }

    const [result] = await conn.query(
      `
      INSERT INTO caixa_sessoes 
        (usuario_id, empresa_id, pdv_id, valor_abertura, observacoes, status, criado_em) 
      VALUES (?, ?, ?, ?, ?, 'aberto', NOW())
      `,
      [usuario_id, empresa_id, pdv_id, valor, observacoes || '']
    );

    const caixaSessaoId = result.insertId; // ✅ guarda id

    // ✅ REGISTRA MOVIMENTO FINANCEIRO
    if (valor > 0) {

      // depois do INSERT do caixa_sessoes

      if (valor > 0) {
        await registrarMovimentoFinanceiro({
          origem: "cofre",
          conta_id: cofre.id,
          tipo: "saida",
          valor: valor,
          descricao: "Abertura de caixa",
          forma_pagamento: "dinheiro",
          usuario_id,
          referencia_tipo: "caixa_sessao",
          referencia_id: caixaSessaoId,
          tipo_pagamento: "avista",
        });
      }

    }

    await conn.commit(); // ✅ só depois de tudo

    return { id: caixaSessaoId };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


/**
 * Insere um movimento no caixa. Garante caixa aberto e usa transação para consistência.
 *
 * @param {{usuario_id:number, empresa_id?:number, pdv_id?:number, caixa_id?:number, observacoes?:string, tipo:string, descricao?:string, valor:number, origem?:string, venda_id?:number, forma_pagamento?:string}} params
 * @returns {Promise<{id:number}>}
 */
export async function inserirMovimentoCaixa({
  usuario_id,
  empresa_id = null,
  pdv_id = null,
  caixa_id = null,
  observacoes = '',
  tipo = 'entrada',
  descricao = '',
  valor = 0,
  origem = null,
  venda_id = null,
  forma_pagamento = null
}) {
  if (!isPositiveInt(usuario_id)) throw new Error('usuario_id inválido');
  if (typeof valor !== 'number') valor = Number(valor) || 0;
  if (!['entrada', 'saida'].includes(tipo)) throw new Error('tipo deve ser "entrada" ou "saida"');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // se caixa_id não informado, busca o caixa aberto
    let caixaIdFinal = caixa_id;
    if (!isPositiveInt(caixaIdFinal)) {
      caixaIdFinal = await getCaixaAberto(usuario_id, empresa_id, pdv_id);
    }

    // 🔍 BUSCA SALDOS DO CAIXA
    const [[saldos]] = await conn.query(
      `
      SELECT 
        cs.valor_abertura,
        IFNULL((SELECT SUM(valor) FROM caixa_movimentos WHERE caixa_id = cs.id AND tipo='entrada'),0) AS entradas,
        IFNULL((SELECT SUM(valor) FROM caixa_movimentos WHERE caixa_id = cs.id AND tipo='saida'),0) AS saidas
      FROM caixa_sessoes cs
      WHERE cs.id = ?
      `,
      [caixaIdFinal]
    );

    if (!saldos) throw new Error('Caixa não encontrado');

    const saldoAtual = Number(saldos.valor_abertura) + Number(saldos.entradas) - Number(saldos.saidas);

    // 🚫 VALIDA SAÍDA MAIOR QUE SALDO
    if (tipo === 'saida' && valor > saldoAtual) {
      throw new Error(`Saldo insuficiente no caixa. Disponível: R$ ${saldoAtual.toFixed(2)}`);
    }

    // INSERE O MOVIMENTO
    const insertSql = `
      INSERT INTO caixa_movimentos
      (usuario_id, caixa_id, observacoes, tipo, descricao, valor, origem, venda_id, forma_pagamento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await conn.query(insertSql, [
      usuario_id,
      caixaIdFinal,
      observacoes || '',
      tipo,
      descricao || '',
      valor,
      origem || null,
      venda_id || null,
      forma_pagamento || null
    ]);

    await conn.commit();
    return { id: result.insertId };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


/**
 * Registra uma venda (entrada) no caixa.
 * @param {{caixa_id:number, venda_id:number}} param0
 */
export async function registrarVendaNoCaixa({ caixa_id, venda_id }) {
  if (!isPositiveInt(caixa_id)) throw new Error('caixa_id inválido');
  if (!isPositiveInt(venda_id)) throw new Error('venda_id inválido');

  const [vendas] = await pool.query(
    'SELECT valor_total, forma_pagamento FROM vendas WHERE id = ?',
    [venda_id]
  );

  if (!vendas.length) throw new Error('Venda não encontrada');

  const venda = vendas[0];

  const [result] = await pool.query(
    `
      INSERT INTO caixa_movimentos
      (caixa_id, venda_id, tipo, valor, forma_pagamento, descricao, data_movimento)
      VALUES (?, ?, 'entrada', ?, ?, ?, NOW())
    `,
    [caixa_id, venda_id, venda.valor_total, venda.forma_pagamento || null, `Venda #${venda_id}`]
  );

  return { id: result.insertId };
}

/**
 * Registrar cancelamento (saída)
 * @param {{caixa_id:number, venda_id:number}} param0
 */
export async function registrarCancelamentoVenda({ caixa_id, venda_id }) {
  if (!isPositiveInt(caixa_id)) throw new Error('caixa_id inválido');
  if (!isPositiveInt(venda_id)) throw new Error('venda_id inválido');

  const [vendas] = await pool.query(
    'SELECT valor_total, forma_pagamento FROM vendas WHERE id = ?',
    [venda_id]
  );

  if (!vendas.length) throw new Error('Venda não encontrada');

  const venda = vendas[0];

  const [result] = await pool.query(
    `
      INSERT INTO caixa_movimentos
      (caixa_id, venda_id, tipo, valor, forma_pagamento, descricao, data_movimento)
      VALUES (?, ?, 'saida', ?, ?, ?, NOW())
    `,
    [caixa_id, venda_id, venda.valor_total, venda.forma_pagamento || null, `Cancelamento da venda #${venda_id}`]
  );

  return { id: result.insertId };
}

/**
 * Resumo do caixa: entradas, saídas, saldo esperado
 * @param {number} caixa_id
 * @returns {Promise<{valor_abertura:number, total_entradas:number, total_saidas:number, saldo_esperado:number}>}
 */
export async function resumoCaixa(caixa_id) {
  if (!isPositiveInt(caixa_id)) throw new Error('caixa_id inválido');

  // BUSCA DOS VALORES DE MOVIMENTO
  const [[entradasRow]] = await pool.query(
    `SELECT IFNULL(SUM(valor),0) AS total
     FROM caixa_movimentos
     WHERE caixa_id = ? AND tipo = 'entrada'`,
    [caixa_id]
  );

  const [[saidasRow]] = await pool.query(
    `SELECT IFNULL(SUM(valor),0) AS total
     FROM caixa_movimentos
     WHERE caixa_id = ? AND tipo = 'saida'`,
    [caixa_id]
  );

  // BUSCA DA SESSÃO DO CAIXA
  const [sessRows] = await pool.query(
    `SELECT valor_abertura, valor_fechamento_informado
     FROM caixa_sessoes
     WHERE id = ?`,
    [caixa_id]
  );

  if (!sessRows.length) throw new Error('Sessão de caixa não encontrada');

  const sessao = sessRows[0];

  // NORMALIZAÇÃO DOS VALORES
  const valor_abertura = Number(sessao.valor_abertura || 0);
  const entradas = Number(entradasRow.total || 0);
  const saidas = Number(saidasRow.total || 0);
  const valorInformado = Number(sessao.valor_fechamento_informado || 0);

  if (saidas > valor_abertura + entradas) {
    throw new Error(
      'O valor de saída não pode exceder o saldo disponível do caixa'
    );
  }

  if (valor_abertura === 0 && entradas === 0 && saidas > 0) {
    throw new Error('Existe saída no caixa sem valor de abertura definido');
  }

  // CÁLCULO DO SALDO ESPERADO
  const saldo_esperado = valor_abertura + entradas - saidas;

  // DIFERENÇA ENTRE O QUE O SISTEMA ESPERA E O QUE FOI INFORMADO
  const diferenca = Number((valorInformado - saldo_esperado).toFixed(2));



  return {
    valor_abertura,
    total_entradas: entradas,
    total_saidas: saidas,
    saldo_esperado,
    valor_informado: valorInformado,
    diferenca: diferenca
  };

}
export async function pagarCompraComCaixa({
  usuario_id,
  empresa_id,
  valor,
  descricao,
  referencia_id
}) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(`
      SELECT id 
      FROM caixa_sessoes
      WHERE usuario_id = ?
        AND empresa_id = ?
        AND status = 'aberto'
      LIMIT 1
    `, [usuario_id, empresa_id]);

    if (!rows.length) {
      throw new Error("Nenhum caixa aberto");
    }

    const caixa = rows[0];

    // registra saída no caixa
    await conn.query(`
      INSERT INTO caixa_movimentos
        (caixa_id, tipo, valor, descricao, criado_em)
      VALUES (?, 'saida', ?, ?, NOW())
    `, [caixa.id, valor, descricao]);

    await conn.commit();

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Fecha o caixa. Se valor_fechamento não informado, usa cálculo automático.
 * @param {{caixa_id:number, valor_fechamento?:number}} param0
 * @returns {Promise<{changes:number, valor_fechamento:number}>}
 */
// src/main/caixa/fecharCaixa.ts


export async function fecharCaixa({
  caixa_id,
  valor_fechamento_informado = null,
  motivo_diferenca = null,

}) {
  if (!caixa_id || isNaN(Number(caixa_id))) {
    throw new Error("ID do caixa inválido!");
  }
  if (!global.usuarioLogado) {
    throw new Error("Sessão expirada");
  }
  const usuario_id = global.usuarioLogado.id
  const empresa_id = global.usuarioLogado.empresa_id;

  if (!empresa_id) {
    throw new Error("Empresa não identificada");
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "caixa-fluxo",
      acao: "criar",
    });
    const resumo = await resumoCaixa(caixa_id);
    if (!resumo) throw new Error("Caixa não encontrado!");

    const valorEsperado = Number(resumo.saldo_esperado);

    const valorFinal = valor_fechamento_informado !== null
      ? Number(valor_fechamento_informado)
      : valorEsperado;

    const diferenca = valorFinal - valorEsperado;

    if (diferenca !== 0 && (!motivo_diferenca || motivo_diferenca.trim() === "")) {
      throw new Error("É obrigatório informar o motivo da diferença!");
    }

    if (valorFinal < 0) {
      throw new Error("Valor de fechamento não pode ser negativo!");
    }

    const [result] = await conn.query(
      `
        UPDATE caixa_sessoes
        SET
          fechado_em = NOW(),
          valor_fechamento = ?,
          valor_fechamento_informado = ?,
          diferenca = ?,
          motivo_diferenca = ?,
          status = 'fechado',
          atualizado_em = NOW()
        WHERE id = ?
      `,
      [
        valorFinal,
        valor_fechamento_informado,
        diferenca,
        motivo_diferenca,
        caixa_id,
      ]
    );
    const caixaSessaoId = result.insertId; // ✅ guarda id
    const [rows] = await conn.query(
      `SELECT id, saldo FROM financeiro_contas 
       WHERE empresa_id = ? AND tipo = 'cofre' 
       LIMIT 1`,
      [empresa_id]
    );

    if (!rows.length) {
      throw new Error("Cofre não encontrado para esta empresa!");
    }

    const cofre = rows[0];

    await registrarMovimentoFinanceiro({
      origem: "cofre",
      conta_id: cofre.id,
      tipo: "entrada",
      valor: valorFinal,
      descricao: "Fechamento de caixa",
      forma_pagamento: "dinheiro",
      usuario_id,
      referencia_tipo: "caixa_sessao",
      referencia_id: caixaSessaoId,
      tipo_pagamento: "avista",
    });

    await conn.commit();

    return {
      alterados: result.affectedRows,
      valor_fechamento: valorFinal,
      esperado: valorEsperado,
      diferenca,
      motivo_diferenca,
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
