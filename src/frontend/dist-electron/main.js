import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, "..", "..", "..");
const RENDERER_DIST = path.join(APP_ROOT, "dist");
path.join(APP_ROOT, "dist-electron");
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(createWindow);
ipcMain.handle("get-clientes", async () => {
  return [
    { id: 1, nome: "Rick Bryan", email: "rick@empresa.com" },
    { id: 2, nome: "Maria Silva", email: "maria@empresa.com" }
  ];
});
