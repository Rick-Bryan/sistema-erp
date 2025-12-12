import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import bcrypt from "bcryptjs";
import pool from "../db/connection"; // sua conexão MySQL
import { listarProdutos, criarProduto, salvarProduto, atualizarGrupo, excluirGrupo, atualizarSubGrupo, excluirSubGrupo } from '../db/produtos';
import { listarFabricantes, criarFabricante, salvarFabricante } from '../db/fabricantes'
import { listarColaboradores, criarColaborador, atualizarColaborador, deletarColaborador, getColaboradorById } from '../db/colaboradores';
import { listarClientes, criarCliente, atualizarCliente, deletarCliente } from '../db/clientes';
import { listarFornecedores, criarFornecedor, atualizarFornecedor, deletarFornecedor } from '../db/fornecedores';
//Falta fazer
import { listarVendas, criarVenda, atualizarVenda, deletarVenda, pagarVenda, salvarVendaCompleta } from '../db/vendas';
import { abrirCaixa, inserirMovimentoCaixa, listarMovimentosCaixa, listarSessoesCaixa, registrarCancelamentoVenda, resumoCaixa, fecharCaixa, resumoMovimentosCaixa } from '../db/caixa';
import { entradaEstoque, saidaEstoque, registrarMovimentoEstoque, atualizarEstoqueECusto, atualizarEstoque, listarMovimentosEstoque } from '../db/estoque_movimento';
import { listarCompras, criarCompra, criarItensCompra, criarContasPagar, salvarCompraCompleta, getCompraById, finalizarCompra } from '../db/compras';

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
//Cadastro de produtos
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
//Cadastro de fabricantes
// Listar fabricantes
ipcMain.handle('get-fabricantes', async () => {
  return await listarFabricantes();
});

//Login
ipcMain.handle("login", async (event, { email, senha }) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) {
      throw new Error("Senha incorreta");
    }

    // Retorna os dados necessários da sessão
    return {
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel,
      },
    };
  } catch (error) {
    console.error("Erro no login:", error);
    return { sucesso: false, mensagem: error.message };
  }
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

//Cadastro de Clientes
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

ipcMain.handle("getGrupos", async () => {
  const [rows] = await pool.query(
    "SELECT CodigoGrupo AS id, NomeGrupo AS nome FROM produto_grupo WHERE Ativo = 1"
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

app.whenReady().then(createWindow)

// Exemplo de comunicação entre processos
