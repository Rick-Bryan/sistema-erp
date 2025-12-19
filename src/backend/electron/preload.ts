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
  getFabricanteById: (CodigoFabricante) => ipcRenderer.invoke('buscar-fabricante-id',CodigoFabricante),
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
  getColaboradorById: (id) => ipcRenderer.invoke("getColaboradorById", id),


  // 👥 Clientes (💡 ADICIONADOS AGORA)
  listarClientes: () => ipcRenderer.invoke('listar-clientes'),
  addCliente: (cliente) => ipcRenderer.invoke('add-cliente', cliente),
  salvarCliente: (cliente) => ipcRenderer.invoke('update-cliente', cliente),
  deletarCliente: (id) => ipcRenderer.invoke('deletar-cliente', id),

  //Vendas
  getVendas: () => ipcRenderer.invoke('get-vendas'),
  addVenda: (dados) => ipcRenderer.invoke('add-venda', dados),
  updateVenda: (dados) => ipcRenderer.invoke('update-venda', dados),
  deleteVenda: (id) => ipcRenderer.invoke('delete-venda', id),
  listarItensVenda:(venda_id) => ipcRenderer.invoke('listar-itens-venda',venda_id),
  //Caixa

  getSessoesCaixa: () => ipcRenderer.invoke('get-sessoes-caixa'),
  addSessoesCaixa: (dados) => ipcRenderer.invoke('add-sessoes-caixa', dados),

  getMovimentosCaixa: () => ipcRenderer.invoke('get-movimentos-caixa'),
  addMovimentosCaixa: (dados) => ipcRenderer.invoke('add-movimentos-caixa', dados),
  registrarVendaNoCaixa: (payload) => ipcRenderer.invoke('caixa:registrar-venda', payload),
  registrarCancelamentoVenda: (payload) => ipcRenderer.invoke('caixa:cancelar-venda', payload),
  resumoCaixa: (caixa_id) => ipcRenderer.invoke('caixa:resumo', caixa_id),
  fecharCaixa: (payload) => ipcRenderer.invoke('caixa:fechar', payload),
  pagarVenda: (payload) => ipcRenderer.invoke('pagar-venda', payload),
  salvarVendaCompleta: (payload) => ipcRenderer.invoke('salvar-venda-completa', payload),
  resumoMovimentosCaixa: (caixa_id) => ipcRenderer.invoke('caixa:resumo-movimentos', caixa_id),
  // 🔍 Busca e login


  //ESTOQUE

  getMovimentosEstoque: () => ipcRenderer.invoke("estoque:listar-movimentos"),


  addEntradaEstoque: () => ipcRenderer.invoke('estoque:entrada', payload),
  addSaidaEstoque: () => ipcRenderer.invoke('estoque:saida', payload),

  // Compras
  getCompras: () => ipcRenderer.invoke('compras:listar'),
  addCompra: (payload) => ipcRenderer.invoke('compras:criar', payload),
  addItensCompra: (payload) => ipcRenderer.invoke('compras:criar-itens', payload),
  addContasPagar: (payload) => ipcRenderer.invoke('compras:criar-contas-pagar', payload),




  addCompraCompleta: (dados) => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return ipcRenderer.invoke("compras:salvar-compra-completa", {
      ...dados,
      usuario_id: usuario.id,
    });
  },
  addSubGrupo: (nome, codigoGrupo) => ipcRenderer.invoke('addSubGrupo', nome, codigoGrupo),
  addGrupo: (nome, comissao) => ipcRenderer.invoke('addGrupo', nome, comissao),
  getGrupos: () => ipcRenderer.invoke("getGrupos"),
  getSubGrupos: () => ipcRenderer.invoke("getSubGrupos"),
  getSubGruposByGrupo: (codigoGrupo) => ipcRenderer.invoke('getSubGruposByGrupo', codigoGrupo),
  finalizarCompra: (id) => ipcRenderer.invoke("compras:finalizar", id),
  getCompraById: (id: number) => ipcRenderer.invoke("compras:get-compra-by-id", id),
  buscar: (canal, termo) => ipcRenderer.invoke(canal, termo),
  login: (dados) => ipcRenderer.invoke('login', dados),


  atualizarGrupo: (id, nome, comissao, ativo) => ipcRenderer.invoke("atualizarGrupo", { id, nome, comissao, ativo }),
  excluirGrupo: (id) => ipcRenderer.invoke("excluirGrupo", id),
  atualizarSubGrupo: (id, nome, CodigoGrupo) => ipcRenderer.invoke("atualizarSubGrupo", { id, nome, CodigoGrupo }),
  excluirSubGrupo: (id) => ipcRenderer.invoke("excluirSubGrupo", id),

});
