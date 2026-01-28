import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import bcrypt from "bcryptjs";
import pool from "../db/connection"; // sua conexão MySQL
import { listarProdutos, criarProduto, salvarProduto, atualizarGrupo, excluirGrupo, atualizarSubGrupo, excluirSubGrupo } from '../db/produtos';
import { listarFabricantes, criarFabricante, salvarFabricante, getFabricanteById } from '../db/fabricantes'
import { listarColaboradores, criarColaborador, atualizarColaborador, deletarColaborador, getColaboradorById } from '../db/colaboradores';
import { listarClientes, criarCliente, atualizarCliente, deletarCliente } from '../db/clientes';
import { listarFornecedores, criarFornecedor, atualizarFornecedor, deletarFornecedor } from '../db/fornecedores';

import { listarVendas, criarVenda, atualizarVenda, deletarVenda, pagarVenda, salvarVendaCompleta, listarItensVenda } from '../db/vendas';
import { abrirCaixa, inserirMovimentoCaixa, listarMovimentosCaixa, listarSessoesCaixa, registrarCancelamentoVenda, resumoCaixa, fecharCaixa, resumoMovimentosCaixa } from '../db/caixa';
import { entradaEstoque, saidaEstoque, registrarMovimentoEstoque, atualizarEstoqueECusto, atualizarEstoque, listarMovimentosEstoque } from '../db/estoque_movimento';
import { listarCompras, criarCompra, criarItensCompra, criarContasPagar, salvarCompraCompleta, getCompraById, finalizarCompra } from '../db/compras';
import { baixarParcelaReceber, listarContasReceber, obterContasReceber, listarParcelasReceber, listarContasPagar, dashboardFinanceiro, dashboardPagar, listarParcelasPagar, baixarParcelaPagar } from "../db/financeiro";

//import { listarClientes,criarClientes} from '../db/clientes'
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Caminhos das pastas de build
const APP_ROOT = path.join(__dirname, '..', '..', '..')
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const MAIN_DIST = path.join(APP_ROOT, 'dist-electron')

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Mostra o console do DevTools automaticamente em modo dev
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('closed', () => {
    win = null
  })
}

// Eventos do Electron
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
//Produtos
ipcMain.handle('get-produtos', async () => {
  try {

    const produtos = await listarProdutos();

    return produtos;
  }
  catch (err) {
    console.error(err)
    return [];
  }
});

ipcMain.handle('add-produto', async (_, produto) => {

  await criarProduto(produto);
  const produtos = await listarProdutos();
  return produtos;
});
ipcMain.handle('salvar-produto', async (_, produto) => {

  await salvarProduto(produto);
  const produtos = await listarProdutos();
  return produtos;
});
//fabricantes
// Listar fabricantes
ipcMain.handle('get-fabricantes', async () => {
  return await listarFabricantes();
});
function withSession(handler) {
  return async (event, payload = {}) => {
    try {
      const usuario = global.usuarioLogado;

      if (!usuario) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      payload.usuario_id = usuario.id;
      payload.empresa_id = usuario.empresa_id;
      payload.nivel = usuario.nivel;

      return await handler(payload, event);
    } catch (err) {
      console.error("IPC Error:", err.message);
      throw new Error(err.message || "Erro interno");
    }
  };
}
ipcMain.handle("session:get", () => {
  return global.usuarioLogado || null;
});

//Login
ipcMain.handle("login", async (event, { email, senha }) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) {
      throw new Error("Senha incorreta");
    }

    const sessao = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuario.nivel,
      empresa_id: usuario.empresa_id,
      loja_id: usuario.loja_id
    };

    // ✅ SALVA A SESSÃO
    global.usuarioLogado = sessao;

    return {
      sucesso: true,
      usuario: sessao,
    };
  } catch (error) {
    console.error("Erro no login:", error);
    return {
      sucesso: false,
      mensagem: error.message,
    };
  }
});

ipcMain.handle("logout", async () => {
  global.usuarioLogado = null;
  return { sucesso: true };
});

// Handler para salvar um fabricante
ipcMain.handle('salvar-fabricante', async (_event, fabricante: Fabricante) => {
  await salvarFabricante(fabricante);
  return true;
});
ipcMain.handle('criar-fabricante', async (_event, fabricante: Fabricante) => {
  await criarFabricante(fabricante);
  return true;
});

//Clientes
// Listar clientes
ipcMain.handle("get-clientes", async () => {
  const clientes = await listarClientes();
  return clientes; // retorna o array direto
});

// Criar cliente
ipcMain.handle('add-cliente', async (_event, cliente) => {
  try {
    const novo = await criarCliente(cliente);
    return { sucesso: true, data: novo };
  } catch (err) {
    console.error(err);
    return { sucesso: false, mensagem: 'Erro ao criar cliente.' };
  }
});

// Atualizar cliente
ipcMain.handle('update-cliente', async (_event, cliente) => {
  try {
    await atualizarCliente(cliente);
    return { sucesso: true };
  } catch (err) {
    console.error(err);
    return { sucesso: false, mensagem: 'Erro ao atualizar cliente.' };
  }
});

// Deletar cliente
ipcMain.handle('delete-cliente', async (_event, dados) => {

  const { id, usuario } = dados;

  if (usuario.nivel === "administrador") {
    try {
      await deletarCliente(id);
      return { sucesso: true };
    } catch (err) {
      console.error(err);
      return { sucesso: false, mensagem: 'Erro ao excluir cliente.' };
    }
  } else {
    return { sucesso: false, mensagem: 'Usuario nao tem permissão' };

  }
});

//Pesquisa
ipcMain.handle("buscar-produtos", async (event, termo) => {
  let sql = "SELECT * FROM produto";
  let params = [];

  // 🔎 Só adiciona o filtro se tiver texto real
  if (termo && termo !== "*" && termo.trim() !== "") {
    sql += " WHERE NomeProduto LIKE ? OR CodigoBarra LIKE ?";
    params = [`%${termo}%`, `%${termo}%`];
  }

  sql += " ORDER BY NomeProduto LIMIT 100"; // evita travar o app com muitos registros

  const [rows] = await pool.query(sql, params);
  return rows;
});
ipcMain.handle("buscar-fabricantes", async (event, termo) => {
  let sql = "SELECT * FROM produto_fabricante";
  let params = [];

  // 🔎 Só adiciona o filtro se tiver texto real
  if (termo && termo !== "*" && termo.trim() !== "") {
    sql += " WHERE NomeFabricante LIKE ? ";
    params = [`%${termo}%`, `%${termo}%`];
  }

  sql += " ORDER BY CodigoFabricante LIMIT 100"; // evita travar o app com muitos registros

  const [rows] = await pool.query(sql, params);
  return rows;
});
ipcMain.handle("buscar-fabricante-id", async (event, CodigoFabricante) => {
  await getFabricanteById(CodigoFabricante);
});


ipcMain.handle('add-colaborador', async (_event, colaborador) => {
  try {
    const resultado = await criarColaborador(colaborador);
    return { sucesso: true, data: resultado };
  } catch (error) {
    console.error("❌ Erro ao adicionar colaborador:", error);

    if (error.message.includes("Duplicate entry")) {
      return { sucesso: false, mensagem: "Este e-mail já está em uso." };
    }

    return { sucesso: false, mensagem: "Erro ao cadastrar colaborador." };
  }
});

ipcMain.handle('update-colaborador', async (_event, colaborador) => {
  try {
    const resultado = await atualizarColaborador(colaborador);
    return { sucesso: true, data: resultado };
  } catch (error) {
    console.error("❌ Erro ao atualizar colaborador:", error);
    return { sucesso: false, mensagem: "Erro ao atualizar colaborador." };
  }
});

ipcMain.handle("get-colaboradores", async (event, termo) => {
  let sql = `
    SELECT 
      id, 
      nome, 
      email, 
      nivel, 
      setor,
      ativo,
      criado_em 
    FROM usuarios
  `;

  let params = [];

  // 🔎 Filtro de busca
  if (termo && termo !== "*" && termo.trim() !== "") {
    sql += " WHERE nome LIKE ? OR email LIKE ? OR setor LIKE ?";
    params = [`%${termo}%`, `%${termo}%`, `%${termo}%`];
  }

  sql += " ORDER BY nome LIMIT 100"; // limite de segurança

  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return [];
  }
});


ipcMain.handle('delete-colaborador', async (_event, { id, usuario }) => {

  if (usuario.nivel !== "administrador") {
    return { sucesso: false, mensagem: "Acesso negado." };
  }

  try {
    await deletarColaborador(id);
    return { sucesso: true };
  } catch (error) {
    console.error("❌ Erro ao deletar colaborador:", error);
    return { sucesso: false, mensagem: "Erro ao deletar colaborador." };
  }
});


ipcMain.handle('add-fornecedor', async (_event, fornecedor) => {
  try {
    console.log("📦 Dados recebidos no backend:", fornecedor);
    const resultado = await criarFornecedor(fornecedor);
    return { sucesso: true, data: resultado };
  } catch (error) {
    console.error("❌ Erro ao adicionar fornecedor:", error);

    if (error.message.includes("Duplicate entry")) {
      return { sucesso: false, mensagem: "Este CNPJ já está cadastrado." };
    }

    return { sucesso: false, mensagem: "Erro ao cadastrar fornecedor." };
  }
});
ipcMain.handle('update-fornecedor', async (_event, fornecedor) => {
  try {
    const resultado = await atualizarFornecedor(fornecedor);
    return { sucesso: true, data: resultado };
  } catch (error) {
    console.error("❌ Erro ao atualizar Fornecedor:", error);
    return { sucesso: false, mensagem: "Erro ao atualizar Fornecedor." };
  }
});


ipcMain.handle("get-fornecedores", async (_event, termo) => {
  let sql = `
    SELECT 
      CodigoFornecedor, 
      Nome, 
      NomeFantasia, 
      CNPJ, 
      Endereco, 
      Cidade, 
      Bairro, 
      Ativo, 
      Pessoa
    FROM fornecedores
  `;

  let params = [];

  // 🔍 Se o termo for válido, aplica filtro
  if (termo && termo.trim() !== "" && termo.trim() !== "*") {
    sql += " WHERE Nome LIKE ? OR NomeFantasia LIKE ? OR CNPJ LIKE ?";
    params = [`%${termo}%`, `%${termo}%`, `%${termo}%`];
  }

  sql += " ORDER BY CodigoFornecedor DESC LIMIT 100";

  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Erro ao buscar fornecedores:", error);
    return [];
  }
});



ipcMain.handle('delete-fornecedor', async (_event, { CodigoFornecedor, usuario }) => {
  if (usuario.nivel !== "administrador") {
    return { sucesso: false, mensagem: "Acesso negado." };
  }

  try {
    await deletarFornecedor(CodigoFornecedor);
    return { sucesso: true };
  } catch (error) {
    console.error("❌ Erro ao deletar fornecedor:", error);
    return { sucesso: false, mensagem: "Erro ao deletar fornecedor." };
  }
});

//VENDAS

// Listar
ipcMain.handle('get-vendas', async () => {
  return await listarVendas();
});

// Criar
ipcMain.handle('add-venda', async (_event, dados) => {
  return await criarVenda(dados);
});

// Atualizar
ipcMain.handle('update-venda', async (_event, dados) => {
  return await atualizarVenda(dados);
});

// Deletar

ipcMain.handle('delete-venda', async (_event, { id, usuario }) => {
  if (usuario.nivel !== "administrador") {
    return { sucesso: false, mensagem: "Acesso negado." };
  }

  try {
    await deletarVenda(id);
    return { sucesso: true };
  } catch (error) {
    console.error("❌ Erro ao deletar fornecedor:", error);
    return { sucesso: false, mensagem: "Erro ao deletar fornecedor." };
  }
});


//CAIXA

ipcMain.handle('get-sessoes-caixa', async () => {
  return await listarSessoesCaixa();
});
ipcMain.handle('add-sessoes-caixa', async (_event, dados) => {
  return await abrirCaixa(dados);
});

ipcMain.handle('get-movimentos-caixa', async () => {
  return await listarMovimentosCaixa();
});
ipcMain.handle('caixa:resumo-movimentos', async (_, caixa_id) => {
  return await resumoMovimentosCaixa(caixa_id)
})
ipcMain.handle('add-movimentos-caixa', async (_event, dados) => {
  return await inserirMovimentoCaixa(dados);
});
ipcMain.handle('caixa:registrar-venda', async (_, payload) => {
  return await registrarVendaNoCaixa(payload);
});


ipcMain.handle("getColaboradorById", async (event, usuarioId) => {
  try {
    const colaborador = await getColaboradorById(usuarioId);
    return colaborador;
  } catch (err) {
    console.error("Erro ao obter colaborador:", err);
    throw err;
  }
});
ipcMain.handle('caixa:cancelar-venda', async (_, payload) => {
  return await registrarCancelamentoVenda(payload);
});

ipcMain.handle('caixa:resumo', async (_, caixa_id) => {
  return await resumoCaixa(caixa_id);
});
ipcMain.handle("pagar-venda", async (event, { venda_id, forma_pagamento, usuario_id, caixa_id }) => {
  const resposta = await pagarVenda(venda_id, forma_pagamento, usuario_id, caixa_id);
  return resposta;
});
ipcMain.handle("salvar-venda-completa", async (event, dadosVenda) => {
  return await salvarVendaCompleta(dadosVenda);
});
ipcMain.handle('caixa:fechar', async (_, payload) => {
  return await fecharCaixa(payload);
});



//ESTOQUE
ipcMain.handle('estoque:entrada', async (event, payload) => {
  return await entradaEstoque(payload);
});
ipcMain.handle('estoque:saida', async (event, payload) => {
  return await saidaEstoque(payload);
});
ipcMain.handle('estoque:movimento', async (event, payload) => {
  return await registrarMovimentoEstoque(payload);
});
ipcMain.handle('estoque:atualizarEstoqueECusto', async (event, payload) => {
  return await atualizarEstoqueECusto(payload);
});
ipcMain.handle('estoque:atualizarEstoque', async (event, payload) => {
  return await atualizarEstoque(payload);
});
ipcMain.handle('estoque:listar-movimentos', async (event, payload) => {
  return await listarMovimentosEstoque();
});

// Handler para salvar um colaborador
//COMPRAS 

ipcMain.handle('compras:listar', async (event, payload) => {
  return await listarCompras();
})

ipcMain.handle('compras:criar', async (event, payload) => {
  return await criarCompra(payload);
})
ipcMain.handle('compras:criar-itens', async (event, payload) => {
  return await criarItensCompra(payload);
})
ipcMain.handle('compras:criar-contas-pagar', async (event, payload) => {
  return await criarContasPagar(payload);
})


ipcMain.handle("compras:salvar-compra-completa", async (event, dados) => {
  try {
    return await salvarCompraCompleta(dados);
  } catch (err) {
    console.error("Erro ao salvar compra:", err);
    throw err;
  }
});
ipcMain.handle("compras:get-compra-by-id", async (event, id) => {
  return await getCompraById(id);
});
ipcMain.handle("compras:finalizar", async (event, id) => {
  console.log("Finalizando compra ID:", id);
  return await finalizarCompra(id);
});
ipcMain.handle("getFabricantes", async () => {
  const [rows] = await pool.query(
    "SELECT CodigoFabricante AS id, NomeFabricante AS nome FROM produto_fabricante WHERE Ativo = 1"
  );
  return rows;
});
ipcMain.handle('listar-itens-venda', async (event, venda_id) => {
  try {
    return await listarItensVenda(venda_id);
  }
  catch (err) {
    console.log("erro ao listar itens da venda", err)
    throw err;
  }
});
ipcMain.handle("getGrupos", async () => {
  const [rows] = await pool.query(
    "SELECT CodigoGrupo AS id, NomeGrupo AS nome , Comissao FROM produto_grupo WHERE Ativo = 1"
  );
  return rows;
});

ipcMain.handle("getSubGrupos", async () => {
  const [rows] = await pool.query(
    "SELECT CodigoSubGrupo AS id, NomeSubGrupo AS nome FROM produto_sub_grupo WHERE Ativo = 1"
  );
  return rows;
});
ipcMain.handle("addGrupo", async (_, nome, comissao) => {
  try {
    await pool.query(`
            INSERT INTO produto_grupo (NomeGrupo,Comissao, Ativo)
            VALUES (?,?, 1)
        `, [nome, comissao]);

    return { success: true };
  } catch (error) {
    console.error("Erro addGrupo:", error);
    return { success: false, error };
  }
});
ipcMain.handle("addSubGrupo", async (_, nome, codigoGrupo) => {

  try {
    await pool.query(`
            INSERT INTO produto_sub_grupo (NomeSubGrupo,CodigoGrupo, Ativo)
            VALUES (?,?, 1)
        `, [nome, codigoGrupo]);

    return { success: true };
  } catch (error) {
    console.error("Erro addSubGrupo:", error);
    return { success: false, error };
  }
});
ipcMain.handle("getSubGruposByGrupo", async (event, codigoGrupo) => {
  const [rows] = await pool.query(
    "SELECT CodigoSubGrupo AS id, NomeSubGrupo AS nome FROM produto_sub_grupo WHERE Ativo = 1 AND CodigoGrupo = ?",
    [codigoGrupo]
  );
  return rows;
});
ipcMain.handle("atualizarGrupo", async (event, dados) => {
  return await atualizarGrupo(dados);
});

ipcMain.handle("atualizarSubGrupo", async (event, dados) => {
  return await atualizarSubGrupo(dados);
});

ipcMain.handle("excluirGrupo", async (event, id) => {
  return await excluirGrupo(id);
});

ipcMain.handle("excluirSubGrupo", async (event, id) => {
  return await excluirSubGrupo(id);
});


//Financeiro


ipcMain.handle("financeiro:listar-contas-receber", async (_e, filtros) => {
  return listarContasReceber(filtros);
});
ipcMain.handle("financeiro:listar-parcelas-receber", async (_e, conta_id) => {
  return listarParcelasReceber(conta_id);
});
ipcMain.handle("financeiro:baixar-parcela", async (_e, dados) => {
  await baixarParcelaReceber(dados);
  return { sucesso: true };
});
ipcMain.handle("financeiro:listar-contas-pagar", async () => {
  return listarContasPagar();
});
ipcMain.handle("financeiro:dashboard-pagar", async () => {
  return dashboardPagar();
})
ipcMain.handle("financeiro:listar-parcelas-pagar", async (_e, contaId) => {
  return listarParcelasPagar(contaId);
});
ipcMain.handle("financeiro:dashboard", async () => {
  return dashboardFinanceiro();
});
ipcMain.handle("financeiro:pagar-parcela-pagar", async (_, dados) => {
  return baixarParcelaPagar(dados);
}
);
ipcMain.handle("financeiro:resumo-anual", async () => {
  const [rows]: any = await pool.query(`
 SELECT
  YEAR(data_vencimento) AS ano,
  MONTH(data_vencimento) AS mes,

  -- CONTAS A RECEBER
  SUM(
    CASE
      WHEN origem = 'receber'
      THEN (valor - IFNULL(valor_pago, 0))
      ELSE 0
    END
  ) AS receber,

  -- CONTAS A PAGAR
  SUM(
    CASE
      WHEN origem = 'pagar'
      THEN (valor - IFNULL(valor_pago, 0))
      ELSE 0
    END
  ) AS pagar

FROM (
  -- PARCELAS A RECEBER
  SELECT
    valor,
    valor_pago,
    data_vencimento,
    'receber' AS origem
  FROM parcelas_receber
  WHERE status IN ('aberto', 'parcial', 'atrasado')

  UNION ALL

  -- PARCELAS A PAGAR
  SELECT
    valor,
    valor_pago,
    data_vencimento,
    'pagar' AS origem
  FROM parcelas_pagar
  WHERE status = 'aberto'
) t

GROUP BY ano, mes
ORDER BY ano, mes;


  `);

  return rows;
});
ipcMain.handle("financeiro:vencimentos-mes-atual", async () => {
  console.log("📊 IPC financeiro:vencimentos-mes-atual chamado");

  const [rows]: any = await pool.query(`
    SELECT
      SUM(
        CASE WHEN tipo = 'receber'
        THEN valor_restante
        ELSE 0 END
      ) AS receber,
      SUM(
        CASE WHEN tipo = 'pagar'
        THEN valor_restante
        ELSE 0 END
      ) AS pagar
    FROM (
      SELECT
        (pr.valor - IFNULL(pr.valor_pago, 0)) AS valor_restante,
        'receber' AS tipo
      FROM parcelas_receber pr
      WHERE pr.status <> 'pago'
        AND MONTH(pr.data_vencimento) = MONTH(CURDATE())
        AND YEAR(pr.data_vencimento) = YEAR(CURDATE())

      UNION ALL

      SELECT
        (pp.valor - IFNULL(pp.valor_pago, 0)) AS valor_restante,
        'pagar' AS tipo
      FROM parcelas_pagar pp
      WHERE pp.status <> 'pago'
        AND MONTH(pp.data_vencimento) = MONTH(CURDATE())
        AND YEAR(pp.data_vencimento) = YEAR(CURDATE())
    ) t
  `);

  console.log("📊 Resultado vencimentos mês:", rows[0]);
  return rows[0] || { receber: 0, pagar: 0 };
});
ipcMain.handle("financeiro:listar-contas", async () => {
  const [rows] = await pool.query(`
    SELECT 
      id,
      nome,
      tipo,
      saldo,
      ativo
    FROM financeiro_contas
    ORDER BY tipo, nome
  `);

  return rows;
});
ipcMain.handle("financeiro:cadastrar-conta", async (_event, dados) => {
  const {
    empresa_id,
    nome,
    tipo,
    saldo,
    banco_nome,
    banco_codigo,
    agencia,
    conta,
    tipo_conta
  } = dados;
  if (!nome) {
    throw new Error("Nome da conta obrigatório");
  }
  await pool.query(
    `
    INSERT INTO financeiro_contas
      (empresa_id,nome,tipo,saldo,banco_nome,banco_codigo,agencia,conta,tipo_conta)
    VALUES (?, ?, ?, ?, ? ,? , ?, ?,?)
    `,
    [empresa_id, nome, tipo, saldo, banco_nome, banco_codigo, agencia, conta, tipo_conta]
  );

  return { success: true };
});
ipcMain.handle("carteira-digital", async () => {
  const [caixa] = await pool.query(`
    SELECT 
      cs.id,
      cs.valor_abertura
      + IFNULL(SUM(CASE WHEN cm.tipo='entrada' THEN cm.valor ELSE 0 END),0)
      - IFNULL(SUM(CASE WHEN cm.tipo='saida' THEN cm.valor ELSE 0 END),0) AS saldo
    FROM caixa_sessoes cs
    LEFT JOIN caixa_movimentos cm ON cm.caixa_id = cs.id
    WHERE cs.status='aberto'
    GROUP BY cs.id
  `);

  const [contas] = await pool.query(`
    SELECT id, nome, tipo, saldo FROM financeiro_contas
  `);

  const [cofre] = await pool.query(`
    SELECT IFNULL(SUM(saldo),0) saldo 
    FROM financeiro_contas 
    WHERE tipo ='cofre'
  `);

  const saldoCaixa = caixa.length ? Number(caixa[0].saldo) : 0;

  const totalBanco = (Array.isArray(contas) ? contas : [])
    .filter(c => c.tipo === 'banco')
    .reduce((s, c) => s + Number(c.saldo || 0), 0);

  const saldoCofre = cofre.length ? Number(cofre[0].saldo) : 0;

  return {
    saldos: {
      caixa: saldoCaixa,
      banco: totalBanco,
      cofre: saldoCofre
    },
    contas
  };
});
ipcMain.handle("carteira-transferir", async (e, dados) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    if (!dados.origem || !dados.destino) {
      throw new Error("Informe origem e destino");
    }

    if (dados.origem == dados.destino) {
      throw new Error("Origem e destino não podem ser iguais");
    }

    if (dados.valor <= 0) {
      throw new Error("Valor inválido");
    }

    const [[origemConta]] = await conn.query(
      `SELECT * FROM financeiro_contas WHERE id = ?`,
      [dados.origem]
    );

    const [[destinoConta]] = await conn.query(
      `SELECT * FROM financeiro_contas WHERE id = ?`,
      [dados.destino]
    );

    if (!origemConta) throw new Error("Conta origem não existe");
    if (!destinoConta) throw new Error("Conta destino não existe");

    if (Number(origemConta.saldo) < dados.valor) {
      throw new Error("Saldo insuficiente");
    }

    // 👉 SAÍDA
    await conn.query(`
      INSERT INTO financeiro_movimentos
        (origem, conta_id, tipo, valor, descricao, forma_pagamento, referencia_tipo, criado_em)
      VALUES (?, ?, 'saida', ?, 'Transferência', 'transferencia', 'transferencia', NOW())
    `, [
      origemConta.tipo,   // AQUI
      dados.origem,
      dados.valor
    ]);

    await conn.query(`
      UPDATE financeiro_contas SET saldo = saldo - ? WHERE id = ?
    `, [dados.valor, dados.origem]);

    // 👉 ENTRADA
    await conn.query(`
      INSERT INTO financeiro_movimentos
        (origem, conta_id, tipo, valor, descricao, forma_pagamento, referencia_tipo, criado_em)
      VALUES (?, ?, 'entrada', ?, 'Transferência', 'transferencia', 'transferencia', NOW())
    `, [
      destinoConta.tipo,  // AQUI
      dados.destino,
      dados.valor
    ]);

    await conn.query(`
      UPDATE financeiro_contas SET saldo = saldo + ? WHERE id = ?
    `, [dados.valor, dados.destino]);

    await conn.commit();
    return { ok: true };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});


ipcMain.handle("carteira-extrato", async (e, { conta_id, inicio, fim }) => {
  // 1️⃣ Buscar saldo atual da conta
  const [[conta]] = await pool.query(
    `
    SELECT saldo 
    FROM financeiro_contas 
    WHERE id = ?
    `,
    [conta_id]
  );

  if (!conta) {
    throw new Error("Conta não encontrada");
  }

  // 2️⃣ Montar filtros
  let where = `WHERE conta_id = ?`;
  const params = [conta_id];

  if (inicio) {
    where += ` AND DATE(criado_em) >= ?`;
    params.push(inicio);
  }

  if (fim) {
    where += ` AND DATE(criado_em) <= ?`;
    params.push(fim);
  }

  // 3️⃣ Buscar movimentos
  const [movs] = await pool.query(
    `
    SELECT 
      id,
      tipo,
      valor,
      descricao,
      criado_em
    FROM financeiro_movimentos
    ${where}
    ORDER BY criado_em ASC
    `,
    params
  );

  // 4️⃣ Calcular saldo inicial (antes do período)
  let saldoInicial = Number(conta.saldo || 0);

  for (let i = movs.length - 1; i >= 0; i--) {
    const m = movs[i];
    if (m.tipo === "entrada") saldoInicial -= Number(m.valor);
    else saldoInicial += Number(m.valor);
  }

  return {
    saldoInicial,
    movimentos: movs,
  };
});
ipcMain.handle("financeiro:dashboard-movimentacao", async () => {
  const [rows] = await pool.query(`
    SELECT
      SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) AS total_entradas,
      SUM(CASE WHEN tipo='saida' THEN valor ELSE 0 END) AS total_saidas,
      SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END) AS saldo
    FROM financeiro_movimentos
  `);

  return rows[0];
});

ipcMain.handle("financeiro:listar-movimentacao", async () => {
  const [rows] = await pool.query(`
    SELECT 
      id,
      origem,
      tipo,
      descricao,
      valor,
      forma_pagamento,
      tipo_pagamento,
      criado_em
    FROM financeiro_movimentos
    ORDER BY criado_em DESC
  `);

  return rows;
});

ipcMain.handle("permissoes:listar", async (_, usuario_id) => {
  const [rows] = await pool.query(
    `SELECT 
  p.submodulo_id,
  s.slug,
  p.pode_consultar,
  p.pode_usar
FROM permissoes_usuario p
JOIN submodulos s ON s.id = p.submodulo_id
WHERE p.usuario_id = ?
`,
    [usuario_id]
  );

  return rows;
});
ipcMain.handle("lojas:listarLojas", async () => {

  const empresa_id = global.usuarioLogado.empresa_id
  const [rows] = await pool.query(
    "SELECT id, nome FROM lojas WHERE empresa_id = ? ORDER BY nome",
    [empresa_id]
  );
  return rows;
});
ipcMain.handle("cargos:listarCargos", async (_, loja_id) => {
  const [rows] = await pool.query(
    "SELECT id, nome FROM cargos WHERE loja_id = ? ORDER BY nome",
    [loja_id]
  );
  return rows;
});
ipcMain.handle("usuarios:listarUsuariosPorCargo", async (_, cargo_id) => {
  const [rows] = await pool.query(
    "SELECT id, nome FROM usuarios WHERE cargo_id = ? ORDER BY nome",
    [cargo_id]
  );
  return rows;
});
ipcMain.handle("modulos:listarComSub", async () => {
  const [rows] = await pool.query(`
    SELECT 
      m.id AS modulo_id,
      m.nome AS modulo_nome,
      s.id AS sub_id,
      s.nome AS sub_nome
    FROM modulos m
    LEFT JOIN submodulos s ON s.modulo_id = m.id
    ORDER BY m.ordem, s.ordem
  `);

  const map = {};

  rows.forEach(r => {
    if (!map[r.modulo_id]) {
      map[r.modulo_id] = {
        id: r.modulo_id,
        nome: r.modulo_nome,
        submodulos: []
      };
    }

    if (r.sub_id) {
      map[r.modulo_id].submodulos.push({
        id: r.sub_id,
        nome: r.sub_nome
      });
    }
  });

  return Object.values(map);
});
const SUBMODULO_DEFINICOES_ACESSO_ID = 20; // ajuste com o ID real do submódulo


ipcMain.handle("permissoes:salvar", async (e, dados) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const { empresa_id, loja_id, usuario_id, permissoes } = dados;

    const usuarioLogado = global.usuarioLogado; // ou outro jeito de pegar o user logado

    // 🔒 Proteção contra auto-bloqueio
    const verificaBloquearProprioAcesso = permissoes.some(p =>
      Number(usuario_id) === Number(usuarioLogado.id) &&
      p.submodulo_id === SUBMODULO_DEFINICOES_ACESSO_ID &&
      p.pode_consultar === 0
    );

    if (verificaBloquearProprioAcesso) {
      throw new Error("Definições de Acesso é obrigatorio para administrador.");
    }

    // DELETE + INSERT
    await conn.query(`
      DELETE FROM permissoes_usuario
      WHERE usuario_id = ? AND loja_id = ?
    `, [usuario_id, loja_id]);

    for (const p of permissoes) {
      await conn.query(`
        INSERT INTO permissoes_usuario
          (empresa_id, loja_id, usuario_id, modulo_id, submodulo_id, pode_consultar, pode_usar, criado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        empresa_id,
        loja_id,
        usuario_id,
        p.modulo_id,
        p.submodulo_id,
        p.pode_consultar,
        p.pode_usar
      ]);
    }

    await conn.commit();
    return { ok: true };

  } catch (err) {
    await conn.rollback();
    throw err; // 🔥 Aqui o frontend recebe o erro
  } finally {
    conn.release();
  }
});
ipcMain.handle("orcamentos:listar", async () => {
  const usuarioLogado = global.usuarioLogado;

  console.log("USUARIO GLOBAL:", usuarioLogado);

  if (!usuarioLogado || !usuarioLogado.loja_id) {
    console.log("❌ Usuário ou loja_id não definido");
    return [];
  }

  const [result] = await pool.query(
    `SELECT o.*,c.nome AS cliente_nome,u.nome AS usuario_nome FROM orcamentos o

JOIN clientes c ON c.id = o.cliente_id
JOIN usuarios u ON u.id = o.usuario_id
 WHERE o.loja_id = ?`,
    [usuarioLogado.loja_id]
  );

  return result;
});
ipcMain.handle("orcamentos:listar-orcamento-selecionado", async (e, orcamento_id) => {

  const usuarioLogado = global.usuarioLogado;

  console.log("USUARIO GLOBAL:", usuarioLogado);

  if (!usuarioLogado || !usuarioLogado.loja_id) {
    console.log("❌ Usuário ou loja_id não definido");
    return [];
  }

  const [rows] = await pool.query(
    `SELECT o.*,c.nome AS cliente_nome,u.nome AS usuario_nome FROM orcamentos o

JOIN clientes c ON c.id = o.cliente_id
JOIN usuarios u ON u.id = o.usuario_id

 WHERE o.id = ?`,
    [orcamento_id]
  );
  const [itens] = await pool.query(
    `
  SELECT 
    oi.*,
    p.NomeProduto
  FROM orcamento_itens oi
  JOIN produto p ON p.CodigoProduto = oi.produto_id
  WHERE oi.orcamentos_id = ?`, [orcamento_id]);




  console.log("ORCAMENTOS DB:", rows);

  if (!rows.length) return null;
  const payload = {
    ...rows[0], itens
  }

  return payload;

})
ipcMain.handle("orcamentos:criar", async (e, dados: {
  cliente_id: Number,
  status: String,
  valor_total: Number,
  descontos: Number,
  observacoes: String,
  valor_final: Number,
  itens: {
    produto_id: number;
    quantidade: number;
    custo_unitario: number;
    preco_unitario: number; // ✅
  }[];

}) => {
  const usuarioLogado = global.usuarioLogado
  const [result] = await pool.query(`INSERT INTO orcamentos (loja_id,cliente_id,usuario_id,valor_total,descontos,valor_final,status) VALUES(?,?,?,?,?,?,?)`, [usuarioLogado.loja_id, dados.cliente_id, usuarioLogado.id, dados.valor_total, dados.descontos, dados.valor_final, dados.status])

  
 for (const item of dados.itens) {
  const quantidade = Number(item.quantidade);
  const preco = Number(item.preco_unitario); // ✅ usa preço
  const subtotal = quantidade * preco;

  await pool.query(
    `INSERT INTO orcamento_itens
     (orcamentos_id, produto_id, quantidade, preco_unitario, subtotal)
     VALUES (?, ?, ?, ?, ?)`,
    [
      result.insertId,
      item.produto_id,
      quantidade,
      preco,
      subtotal
    ]
  );
}



  return result
})

app.whenReady().then(createWindow)

// Exemplo de comunicação entre processos
