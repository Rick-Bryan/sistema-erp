"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getProdutos: () => electron.ipcRenderer.invoke("get-produtos"),
  addProduto: (produto) => electron.ipcRenderer.invoke("add-produto", produto),
  salvarProduto: (produto) => electron.ipcRenderer.invoke("salvar-produto", produto),
  getFabricantes: () => electron.ipcRenderer.invoke("get-fabricantes"),
  salvarFabricante: (fabricante) => electron.ipcRenderer.invoke("salvar-fabricante", fabricante),
  buscar: (canal, termo) => electron.ipcRenderer.invoke(canal, termo)
});
