import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import bcrypt from "bcryptjs";
import pool from "../db/connection"; // sua conexão MySQL
import { listarProdutos, criarProduto, salvarProduto } from '../db/produtos';
import { listarFabricantes, criarFabricante, salvarFabricante } from '../db/fabricantes'
//Falta fazer
//import { listarColaboradores,criarColaborador} from '../db/colaboradores'
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
    console.log("📡 Requisição recebida: get-produtos"); // debug
    const produtos = await listarProdutos();
    console.log("📦 Produtos retornados:", produtos); // debug
    return produtos;
  }
  catch (err) {
    console.error(err)
    return [];
  }
});

ipcMain.handle('add-produto', async (_, produto) => {
  console.log("📩 Inserindo produto:", produto); // debug
  await criarProduto(produto);
  const produtos = await listarProdutos();
  return produtos;
});
ipcMain.handle('salvar-produto', async (_, produto) => {
  console.log("📩 salvando produto:", produto); // debug
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
//Cadastro de colaboradores
ipcMain.handle('get-colaboradores', async () => {
  return await listarColaboradores();
});

// Handler para salvar um colaborador
ipcMain.handle('salvar-colaborador', async (_event, colaborador: Colaborador) => {
  await criarColaborador(colaborador);
  return true;
});
//Cadastro de Clientes
ipcMain.handle('get-clientes', async () => {
  return await listarClientes();
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

// Handler para salvar um colaborador
ipcMain.handle('salvar-cliente', async (_event, cliente: Cliente) => {
  await criarCliente(cliente);
  return true;
});
app.whenReady().then(createWindow)

// Exemplo de comunicação entre processos
