import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import VendaDetalhes from "./VendaDetalhes";
import VendaCadastro from "./VendaCadastro";
import SearchBar from "../../components/ui/SearchBar";

interface Venda {
    id: number;
    cliente_id: number;
    cliente_nome?: string;
    usuario_id: number;
    data_venda: string;
    valor_total: number;
    forma_pagamento?: string;
    status: "pendente" | "pago" | "cancelado";
    observacoes?: string;
}

interface VendasProps {
    setPage: (page: string) => void;
}

export default function Vendas({ setPage }: VendasProps) {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
    const [modoCadastro, setModoCadastro] = useState(false);

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
    const nivelUsuario = usuarioLogado?.nivel;

    const carregarVendas = async () => {
        try {
            const lista = await window.ipcRenderer.invoke("get-vendas");
            if (Array.isArray(lista)) {
                setVendas(lista);
            } else {
                console.warn("Resposta inesperada:", lista);
                setVendas([]);
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar vendas");
            setVendas([]);
        }
    };

    const excluirVenda = async (id: number) => {
        try {
            const resposta = await window.ipcRenderer.invoke("delete-venda", {
                id,
                usuario: usuarioLogado,
            });

            if (resposta.sucesso) {
                toast.success("Venda excluída com sucesso!");
                carregarVendas();
            } else {
                toast.error(resposta.mensagem || "Falha ao excluir venda");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir venda");
        }
    };

    useEffect(() => {
        carregarVendas();
    }, []);

    // 🔁 Tela de cadastro
    if (modoCadastro) {
        return (
            <VendaCadastro
                voltar={() => {
                    setModoCadastro(false);
                    carregarVendas();
                }}
            />
        );
    }

    // 🔁 Tela de detalhes
    if (vendaSelecionada) {
        return (
            <VendaDetalhes
                vendaSelecionada={vendaSelecionada}
                voltar={() => {
                    setVendaSelecionada(null);
                    carregarVendas();
                }}
            />
        );
    }

    // 📋 Tela de listagem
    return (
        <div style={{ padding: "20px", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
            <button
                onClick={() => setPage("movimentacao")}
                style={{
                    backgroundColor: "#e5e7eb",
                    color: "#1e3a8a",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                    marginBottom: "20px",
                }}
            >
                ← Voltar
            </button>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <h2 style={{ color: "#1e3a8a" }}>Vendas</h2>
                <button
                    onClick={() => setModoCadastro(true)}
                    style={{
                        backgroundColor: "#1e3a8a",
                        color: "#fff",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    ＋ Nova Venda
                </button>
            </div>

            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: "20px",
                }}
            >
                <SearchBar
                    canal="get-vendas"
                    placeholder="Pesquisar vendas por cliente"
                    onResults={setVendas}
                />
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#e5e7eb", color: "#1e3a8a", textAlign: "left" }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Cliente</th>
                            <th style={thStyle}>Data</th>
                            <th style={thStyle}>Total</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendas.map((v) => (
                            <tr key={v.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={tdStyle}>{v.id}</td>
                                <td style={tdStyle}>{v.cliente_nome || `Cliente ${v.cliente_id}`}</td>
                                <td style={tdStyle}>
                                    {new Date(v.data_venda).toLocaleDateString("pt-BR")}
                                </td>
                                <td style={tdStyle}>
                                    {Number(v.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>

                                <td style={tdStyle}>
                                    {v.status === "pago"
                                        ? "✅ Pago"
                                        : v.status === "pendente"
                                            ? "🕓 Pendente"
                                            : "❌ Cancelado"}
                                </td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => setVendaSelecionada(v)}
                                        style={{
                                            backgroundColor: "#1e3a8a",
                                            color: "#fff",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            marginRight: 8,
                                        }}
                                    >
                                        Visualizar
                                    </button>

                                    {nivelUsuario === "administrador" && (
                                        <button
                                            onClick={() => excluirVenda(v.id)}
                                            style={{
                                                backgroundColor: "#c53030",
                                                color: "#fff",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle: React.CSSProperties = { padding: 10, textAlign: "left" };
const tdStyle: React.CSSProperties = { padding: 10, borderBottom: "1px solid #ccc" };
