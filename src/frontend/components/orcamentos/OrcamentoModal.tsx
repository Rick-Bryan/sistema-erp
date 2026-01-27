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


interface OrcamentoModalProps {
    onClose: () => void;
    refresh: () => void;
}

export default function OrcamentoModal({ onClose, refresh }: OrcamentoModalProps) {
    const [clientes, setClientes] = useState<any[]>([]);
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}')
    const [produtos, setProdutos] = useState<any[]>([]);
    const [itensOrcamento, setItensOrcamento] = useState<any[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    //const [status, setStatus] = useState(null)
    const [orcamento, setOrcamento] = useState({
        cliente_id: null as number | null,
        status: 'pendente',
        valor_total: 0,
        descontos: 0,
        observacoes: "",
        itens: [] as any[],
    });
    const valorFinal = Math.max(
        orcamento.valor_total - (orcamento.descontos || 0),
        0
    );

    const statusOrcamento = Object.freeze([
        { id: 1, value: 'aprovado', nome: "Aprovado" },
        { id: 3, value: 'pendente', nome: "Pendente" }
    ]);

    console.log("ORCAMENTO MODAL", orcamento)

    // Carrega fornecedores e produtos
    useEffect(() => {
        async function carregarDados() {
            const c = await window.ipcRenderer.invoke('get-clientes');
            const p = await window.electronAPI.getProdutos();
            setClientes(c);
            setProdutos(p);
        }
        carregarDados();
    }, []);

    // Atualiza valor total automaticamente
    useEffect(() => {
        const total = orcamento.itens.reduce(
            (acc, item) => acc + item.quantidade * item.custo_unitario,
            0
        );
        setOrcamento((prev) => ({ ...prev, valor_total: total }));
    }, [orcamento.itens]);

    const adicionarItem = () => {
        setOrcamento((prev) => ({
            ...prev,
            itens: [...prev.itens, { produto_id: "", quantidade: 1, custo_unitario: 0 }]
        }));
    };

    const removerItem = (index: number) => {
        setOrcamento((prev) => ({
            ...prev,
            itens: prev.itens.filter((_, i) => i !== index)
        }));
    };

    const atualizarItem = (index: number, campo: string, valor: any) => {
        setOrcamento((prev) => {
            const itensAtualizados = [...prev.itens];
            itensAtualizados[index] = { ...itensAtualizados[index], [campo]: valor };
            return { ...prev, itens: itensAtualizados };
        });
    };

    const salvarCompra = async () => {

        if (orcamento.itens.length === 0) {
            toast.error("Adicione pelo menos um item!");
            return;
        }
        if (orcamento.itens.some(i => !i.produto_id)) {
            toast.error("Todos os itens precisam ter um produto selecionado!");
            return;
        }
     
        if (orcamento.valor_total < orcamento.descontos || 0) {
            toast.error("Desconto nao pode ser maior que o valor Total")
            return;
        }
        try {
            const payload = {
                ...orcamento,
                valor_final: Math.max(
                    orcamento.valor_total - (orcamento.descontos || 0),
                    0
                )
            };
            await window.ipcRenderer.invoke("orcamentos:criar", payload);
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
                <h2 style={{ color: "#1e3a8a", marginBottom: 20 }}>Novo Orçamento</h2>

                <div style={{ marginBottom: 15 }}>
                    <label style={label}>Cliente</label>
                    <select
                        value={orcamento.cliente_id}
                        onChange={(e) => setOrcamento({ ...orcamento, cliente_id: Number(e.target.value) || null })}
                        style={input}
                    >
                        <option value="">Selecione...</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                    <label style={label}>Status</label>
                    <select
                        value={orcamento.status || ""}
                        onChange={(e) =>
                            setOrcamento({ ...orcamento, status: e.target.value })
                        }
                        style={input}
                    >
                        <option value="">Selecione o status</option>

                        {statusOrcamento.map((s) => (
                            <option key={s.id} value={s.value}>
                                {s.nome}
                            </option>
                        ))}
                    </select>



                </div>








                <h3 style={{ color: "#1e3a8a", marginBottom: 10 }}>Itens</h3>
                {orcamento.itens.map((item, index) => (
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
                    <div style={{ width: "100%" }}>Valor Bruto: R$ {orcamento.valor_total.toFixed(2)}</div>
                    <label >Desconto: R$</label>
                    <input
                        style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', margin: 10 }}
                        type="number"
                        placeholder="R$0"
                        value={orcamento.descontos}
                        onChange={(e) =>
                            setOrcamento({ ...orcamento, descontos: Number(e.target.value) })
                        }

                    />
                    <div style={{ width: "100%" }}>Valor Final: R$ {orcamento.valor_total - orcamento.descontos}</div>
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
