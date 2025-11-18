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
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 🧾 Produtos
  getProdutos: () => electron.ipcRenderer.invoke("get-produtos"),
  addProduto: (produto) => electron.ipcRenderer.invoke("add-produto", produto),
  salvarProduto: (produto) => electron.ipcRenderer.invoke("salvar-produto", produto),
  // 🏭 Fabricantes
  getFabricantes: () => electron.ipcRenderer.invoke("get-fabricantes"),
  salvarFabricante: (fabricante) => electron.ipcRenderer.invoke("salvar-fabricante", fabricante),
  // 🚚 Fornecedores
  getFornecedores: () => electron.ipcRenderer.invoke("get-fornecedores"),
  salvarFornecedor: (fornecedor) => electron.ipcRenderer.invoke("update-fornecedor", fornecedor),
  deleteFornecedor: (CodigoFornecedor) => electron.ipcRenderer.invoke("delete-fornecedor", CodigoFornecedor),
  addFornecedor: (fornecedor) => electron.ipcRenderer.invoke("add-fornecedor", fornecedor),
  // 👥 Colaboradores (💡 ADICIONADOS AGORA)
  listarColaboradores: () => electron.ipcRenderer.invoke("listar-colaboradores"),
  addColaborador: (colaborador) => electron.ipcRenderer.invoke("add-colaborador", colaborador),
  salvarColaborador: (colaborador) => electron.ipcRenderer.invoke("update-colaborador", colaborador),
  deletarColaborador: (id) => electron.ipcRenderer.invoke("deletar-colaborador", id),
  // 👥 Clientes (💡 ADICIONADOS AGORA)
  listarClientes: () => electron.ipcRenderer.invoke("listar-clientes"),
  addCliente: (cliente) => electron.ipcRenderer.invoke("add-cliente", cliente),
  salvarCliente: (cliente) => electron.ipcRenderer.invoke("update-cliente", cliente),
  deletarCliente: (id) => electron.ipcRenderer.invoke("deletar-cliente", id),
  //Vendas
  getVendas: () => electron.ipcRenderer.invoke("get-vendas"),
  addVenda: (dados) => electron.ipcRenderer.invoke("add-venda", dados),
  updateVenda: (dados) => electron.ipcRenderer.invoke("update-venda", dados),
  deleteVenda: (id) => electron.ipcRenderer.invoke("delete-venda", id),
  //Caixa
  getSessoesCaixa: () => electron.ipcRenderer.invoke("get-sessoes-caixa"),
  addSessoesCaixa: (dados) => electron.ipcRenderer.invoke("add-sessoes-caixa", dados),
  getMovimentosCaixa: () => electron.ipcRenderer.invoke("get-movimentos-caixa"),
  addMovimentosCaixa: (dados) => electron.ipcRenderer.invoke("add-movimentos-caixa", dados),
  registrarVendaNoCaixa: (payload) => electron.ipcRenderer.invoke("caixa:registrar-venda", payload),
  registrarCancelamentoVenda: (payload) => electron.ipcRenderer.invoke("caixa:cancelar-venda", payload),
  resumoCaixa: (caixa_id) => electron.ipcRenderer.invoke("caixa:resumo", caixa_id),
  fecharCaixa: (payload) => electron.ipcRenderer.invoke("caixa:fechar", payload),
  pagarVenda: (payload) => electron.ipcRenderer.invoke("pagar-venda", payload),
  resumoMovimentosCaixa: (caixa_id) => electron.ipcRenderer.invoke("caixa:resumo-movimentos", caixa_id),
  // 🔍 Busca e login
  buscar: (canal, termo) => electron.ipcRenderer.invoke(canal, termo),
  login: (dados) => electron.ipcRenderer.invoke("login", dados)
});
