import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { listarProdutos, criarProduto } from '../db/produtos';

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

app.whenReady().then(createWindow)

// Exemplo de comunicação entre processos
ipcMain.handle('get-clientes', async () => {
  return [
    { id: 1, nome: 'Rick Bryan', email: 'rick@empresa.com' },
    { id: 2, nome: 'Maria Silva', email: 'maria@empresa.com' }
  ]
})
