import { ipcRenderer, contextBridge } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  // 🧾 Produtos
  getProdutos: () => ipcRenderer.invoke('get-produtos'),
  addProduto: (produto) => ipcRenderer.invoke('add-produto', produto),
  salvarProduto: (produto) => ipcRenderer.invoke('salvar-produto', produto),

  // 🏭 Fabricantes
  getFabricantes: () => ipcRenderer.invoke('get-fabricantes'),
  salvarFabricante: (fabricante) => ipcRenderer.invoke('salvar-fabricante', fabricante),

  // 🚚 Fornecedores
  getFornecedores: () => ipcRenderer.invoke('get-fornecedores'),
  salvarFornecedor: (fornecedor) => ipcRenderer.invoke('update-fornecedor', fornecedor),
  deleteFornecedor: (CodigoFornecedor) => ipcRenderer.invoke('delete-fornecedor', CodigoFornecedor),
  addFornecedor: (fornecedor) => ipcRenderer.invoke('add-fornecedor', fornecedor),

  // 👥 Colaboradores (💡 ADICIONADOS AGORA)
  listarColaboradores: () => ipcRenderer.invoke('listar-colaboradores'),
  addColaborador: (colaborador) => ipcRenderer.invoke('add-colaborador', colaborador),
  salvarColaborador: (colaborador) => ipcRenderer.invoke('update-colaborador', colaborador),
  deletarColaborador: (id) => ipcRenderer.invoke('deletar-colaborador', id),

  // 🔍 Busca e login
  buscar: (canal, termo) => ipcRenderer.invoke(canal, termo),
  login: (dados) => ipcRenderer.invoke('login', dados),
});
