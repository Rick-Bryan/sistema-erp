import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import { toastErro } from "../helpers/toastErro";
declare global {
  interface Window {
    electronAPI: {
      getFornecedores: () => Promise<any[]>;
      getProdutos: () => Promise<any[]>;
      salvarCompraCompleta: (dados: any) => Promise<any>;
    };
  }
}


interface NovaCompraModalProps {
  onClose: () => void;
  refresh: () => void;
}

export default function NovaCompraModal({ onClose, refresh }: NovaCompraModalProps) {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}')
  const [produtos, setProdutos] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [compra, setCompra] = useState({
    fornecedor_id: null as number | null, // ✅ CORRETO,
    usuario_id: usuario.id, // ID do usuário logado
    tipo_pagamento: "avista",
    forma_pagamento: "dinheiro",
    status: "aberta",
    observacoes: "",
    itens: [] as any[],
    valor_total: 0,
    parcelas: 1,
    vencimento: "",
    conta_id: null as number | null, // ✅ CORRETO
    origem_pagamento: ""

  });

  console.log(usuario)
  useEffect(() => {
    async function carregarContas() {
      const c = await window.ipcRenderer.invoke('financeiro:listar-contas')
      setContas(c)
    }
    carregarContas();
  }, [])
  // Carrega fornecedores e produtos
  useEffect(() => {
    async function carregarDados() {
      const f = await window.ipcRenderer.invoke('get-fornecedores');
      const p = await window.electronAPI.getProdutos();
      setFornecedores(f);
      setProdutos(p);
    }
    carregarDados();
  }, []);

  // Atualiza valor total automaticamente
  useEffect(() => {
    const total = compra.itens.reduce(
      (acc, item) => acc + item.quantidade * item.custo_unitario,
      0
    );
    setCompra((prev) => ({ ...prev, valor_total: total }));
  }, [compra.itens]);

  const adicionarItem = () => {
    setCompra((prev) => ({
      ...prev,
      itens: [...prev.itens, { produto_id: "", quantidade: 1, custo_unitario: 0 }]
    }));
  };

  const removerItem = (index: number) => {
    setCompra((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    setCompra((prev) => {
      const itensAtualizados = [...prev.itens];
      itensAtualizados[index] = { ...itensAtualizados[index], [campo]: valor };
      return { ...prev, itens: itensAtualizados };
    });
  };

  const salvarCompra = async () => {
    if (!compra.fornecedor_id) {
      toast.error("Selecione um fornecedor!");
      return;
    }
    if (compra.itens.length === 0) {
      toast.error("Adicione pelo menos um item!");
      return;
    }
    if (compra.itens.some(i => !i.produto_id)) {
      toast.error("Todos os itens precisam ter um produto selecionado!");
      return;
    }
    if (
      compra.tipo_pagamento === "parcelado" &&
      (!compra.parcelas || !compra.vencimento)
    ) {
      toast.error("Informe parcelas e data do primeiro vencimento!");
      return;
    }
    if (compra.tipo_pagamento === "avista" && !compra.forma_pagamento) {
      toast.error("Selecione a forma de pagamento");
      return;
    }

    try {
      await window.electronAPI.addCompraCompleta(compra);
      toast.success("Compra registrada com sucesso!");
      refresh();
      onClose();

    } catch (e) {
      console.error(e);
      toastErro(e);
    }
  };


  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ color: "#1e3a8a", marginBottom: 20 }}>Nova Compra</h2>

        <div style={{ marginBottom: 15 }}>
          <label style={label}>Fornecedor</label>
          <select
            value={compra.fornecedor_id}
            onChange={(e) => setCompra({ ...compra, fornecedor_id: Number(e.target.value) || null })}
            style={input}
          >
            <option value="">Selecione...</option>
            {fornecedores.map((f) => (
              <option key={f.CodigoFornecedor} value={f.CodigoFornecedor}>{f.Nome}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={label}>Tipo de pagamento</label>
          <select
            value={compra.tipo_pagamento}
            onChange={(e) => setCompra({ ...compra, tipo_pagamento: e.target.value })}
            style={input}
          >
            <option value="avista">À vista</option>
            <option value="parcelado">A prazo</option>
          </select>
        </div>




        {compra.tipo_pagamento === "parcelado" && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label style={label}>Quantidade de parcelas</label>
              <input
                type="number"
                min={1}
                value={compra.parcelas}
                onChange={(e) =>
                  setCompra({ ...compra, parcelas: Number(e.target.value) })
                }
                style={input}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={label}>Primeiro vencimento</label>
              <input
                type="date"
                value={compra.vencimento}
                onChange={(e) =>
                  setCompra({ ...compra, vencimento: e.target.value })
                }
                style={input}
              />
            </div>
          </>
        )}
        {compra.tipo_pagamento === "avista" && (
          <div style={{ marginBottom: 15 }}>

            <label style={label}>Origem do pagamento</label>
            <select
              value={compra.origem_pagamento}
              onChange={(e) =>
                setCompra({ ...compra, origem_pagamento: e.target.value as "caixa" | "conta" })
              }
              style={input}
            >
              <option value="">Selecione...</option>
              <option value="caixa">Caixa (PDV)</option>
              <option value="conta">Conta financeira</option>
            </select>
            <label style={label}>Forma de pagamento</label>
            {compra.origem_pagamento === "caixa" && (
              <select
                value={compra.forma_pagamento}
                onChange={(e) =>
                  setCompra({
                    ...compra,
                    forma_pagamento: e.target.value as "dinheiro" | "pix" | "cartao" | "boleto",
                  })
                }
                style={input}
              >
                <option value="">Selecione...</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>

              </select>)
            }
            {compra.origem_pagamento === "conta" && (
              <select
                value={compra.forma_pagamento}
                onChange={(e) =>
                  setCompra({
                    ...compra,
                    forma_pagamento: e.target.value as "dinheiro" | "pix" | "cartao" | "boleto",
                  })
                }
                style={input}
              >
                <option value="">Selecione...</option>
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
              </select>)
            }


          </div>



        )}
        {compra.origem_pagamento === "conta" && (
          <div style={{ marginBottom: 15 }}>
            <label style={label}>Conta de pagamento</label>
            <select
              value={compra.conta_id}
              onChange={(e) =>
                setCompra({ ...compra, conta_id: Number(e.target.value) || null })
              }

              style={input}
            >
              <option value="">Selecione...</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ marginBottom: 15 }}>
          <label style={label}>Observações</label>
          <textarea
            value={compra.observacoes}
            onChange={(e) => setCompra({ ...compra, observacoes: e.target.value })}
            style={{ ...input, minHeight: 60 }}
          />
        </div>

        <h3 style={{ color: "#1e3a8a", marginBottom: 10 }}>Itens</h3>
        {compra.itens.map((item, index) => (
          <div key={index} style={itemRow}>
            <select
              value={item.produto_id || 0}
              onChange={(e) => atualizarItem(index, "produto_id", Number(e.target.value))}
              style={{ ...input, flex: 2 }}
            >
              <option value={0}>Produto...</option>
              {produtos.map((p) => (
                <option key={p.CodigoProduto} value={p.CodigoProduto}>
                  {p.NomeProduto}
                </option>
              ))}
            </select>


            <input
              type="number"
              min={1}
              step={1}
              value={item.quantidade}
              onChange={(e) => atualizarItem(index, "quantidade", Number(e.target.value))}
              style={{ ...input, flex: 1 }}
            />
            <input
              type="number"
              min={0}
              step={0.01}
              value={item.custo_unitario}
              onChange={(e) => atualizarItem(index, "custo_unitario", Number(e.target.value))}
              style={{ ...input, flex: 1 }}
            />
            <button style={btnRemover} onClick={() => removerItem(index)}>X</button>
          </div>
        ))}

        <button style={btnNovo} onClick={adicionarItem}>Adicionar Item</button>

        <div style={{ marginTop: 20, fontWeight: 600 }}>
          Valor Total: R$ {compra.valor_total.toFixed(2)}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="contained" color="primary" style={{ flex: 1 }} onClick={salvarCompra}>Salvar</Button>
          <Button variant="outlined" color="inherit" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 999
};

const modal: React.CSSProperties = {
  background: '#fff', padding: 20, borderRadius: 8, width: '600px', maxHeight: '90vh',
  overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const label: React.CSSProperties = { fontWeight: 600, marginBottom: 5, display: 'block' };
const input: React.CSSProperties = { padding: 8, borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 10, width: '100%' };
const itemRow: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 };
const btnRemover: React.CSSProperties = { background: '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' };
const btnNovo: React.CSSProperties = { background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' };
