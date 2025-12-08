// VendaCadastro.tsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

declare global {
    interface Window {
        electronAPI: {
            addVenda: (venda: any) => Promise<void>;
            salvarVendaComleta: (venda: any) => Promise<void>;
        };
        ipcRenderer: any;
    }
}

type Venda = {
    id?: number;
    cliente_id?: number | null; //
    usuario_id?: number | "";
    data_venda?: string;
    valor_total?: number;
    forma_pagamento?: string;
    status?: "pendente" | "pago" | "cancelado";
    observacoes?: string;
    criado_em?: string;
};

type Produto = {
    CodigoProduto: number;
    NomeProduto: string;
    PrecoVenda?: number;
    EstoqueAtual?: number;
    [k: string]: any;
};

type ItemVenda = {
    produto_id: number;
    nome: string;
    quantidade: number;
    valor_unitario: number;
    subtotal: number;
};

export default function VendaCadastro({ voltar }: { voltar: () => void }) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const usuarioId = usuario?.id;
    const [venda, setVenda] = useState<Venda>({
        cliente_id: null,
        data_venda: new Date().toISOString().split("T")[0],
        status: "pendente",
        valor_total: 0,
        forma_pagamento: "",
        observacoes: "",
        usuario_id: usuarioId
    });


    const caixaId = Number(localStorage.getItem("caixa_id"));
    const [clientes, setClientes] = useState<any[]>([]);
    const [colaboradores, setColaboradores] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [buscaProduto, setBuscaProduto] = useState("");
    const [itens, setItens] = useState<ItemVenda[]>([]);
    const [quantidade, setQuantidade] = useState<number>(1);

    // Carrega dados iniciais
    useEffect(() => {
        carregarClientes();
        carregarColaboradores();
        carregarProdutos();
    }, []);

    // Recalcula total sempre que itens mudarem
    useEffect(() => {
        const total = itens.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
        setVenda((prev) => ({ ...prev, valor_total: parseFloat(total.toFixed(2)) }));
    }, [itens]);

    const carregarClientes = async () => {
        try {
            const lista = await window.ipcRenderer.invoke("get-clientes");
            setClientes(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar clientes");
        }
    };

    const carregarColaboradores = async () => {
        try {
            const lista = await window.ipcRenderer.invoke("get-colaboradores");
            setColaboradores(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar colaboradores");
        }
    };

    const carregarProdutos = async () => {
        try {
            // busca todos inicialmente: usamos termo "*" como em outras rotas
            const lista = await window.ipcRenderer.invoke("buscar-produtos", "*");
            setProdutos(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar produtos");
        }
    };

    const handleChangeVenda = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // para IDs, manter vazio ou number
        if (name === "cliente_id" || name === "usuario_id") {
            setVenda((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
        } else {
            setVenda((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Filtra produtos pela busca
    const produtosFiltrados = produtos.filter((p) =>
        String(p?.NomeProduto || "").toLowerCase().includes(buscaProduto.toLowerCase())
    );

    // Adiciona produto à lista (usa a quantidade atual)
    const handleAdicionarItem = (produto: Produto) => {
        const novoItem = {
            produto_id: produto.CodigoProduto,
            nome: produto.NomeProduto,
            quantidade,
            valor_unitario: Number(produto.PrecoVenda ?? 0),
            subtotal: Number(produto.PrecoVenda ?? 0) * quantidade,
        };

        const novosItens = [...itens, novoItem];
        setItens(novosItens);

        // 🔄 Atualiza o valor total da venda
        const total = novosItens.reduce((acc, item) => acc + item.subtotal, 0);
        setVenda((prev) => ({ ...prev, valor_total: total }));
    };

    // Atualiza quantidade de um item na tabela (input)
    const handleAtualizarQuantidade = (produto_id: number, novaQtd: number) => {
        const novosItens = itens.map((item) =>
            item.produto_id === produto_id
                ? { ...item, quantidade: novaQtd, subtotal: item.valor_unitario * novaQtd }
                : item
        );

        setItens(novosItens);

        const total = novosItens.reduce((acc, item) => acc + item.subtotal, 0);
        setVenda((prev) => ({ ...prev, valor_total: total }));
    };


    // Remove item
    const handleRemoverItem = (produto_id: number) => {
        const novosItens = itens.filter((item) => item.produto_id !== produto_id);
        setItens(novosItens);

        const total = novosItens.reduce((acc, item) => acc + item.subtotal, 0);
        setVenda((prev) => ({ ...prev, valor_total: total }));
    };

    // Salvar venda
    const handleSalvar = async () => {
        try {

            if (itens.length === 0) {
                toast.error("Adicione pelo menos um produto.");
                return;
            }

            const payload = {
                ...venda,
                itens,
            };

            const resposta = await window.electronAPI.salvarVendaCompleta(payload);

            if (venda.status === "pago") {
                await window.ipcRenderer.invoke("pagar-venda", {
                    venda_id: resposta.id,          // ID verdadeiro
                    forma_pagamento: venda.forma_pagamento,
                    usuario_id: usuarioId,
                    caixa_id: Number(caixaId)
                });
            }

            toast.success("Venda cadastrada com sucesso!");
            voltar();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao cadastrar venda.");
        }
    };
    console.log(venda)
    /* ========== RENDERS ========== */
    return (
        <div style={pageContainer}>
            <h2 style={titulo}>Cadastrar Venda</h2>

            <div style={formContainer}>
                {/* Cliente */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Cliente</label>
                    <select style={inputStyle} name="cliente_id" value={venda.cliente_id ?? ""} onChange={handleChangeVenda}>
                        <option value="">Selecione...</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                </div>



                {/* Bloco de busca / adicionar produto */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <div style={produtoBox}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <label style={{ ...labelStyle, marginBottom: 6 }}>Pesquisar Produto</label>
                                <input
                                    placeholder="Pesquisar produto..."
                                    value={buscaProduto}
                                    onChange={(e) => setBuscaProduto(e.target.value)}
                                    style={inputStyle}

                                />

                                {buscaProduto && (
                                    <div style={dropdown}>
                                        {produtosFiltrados.length > 0 ? (
                                            produtosFiltrados.map((p) => (
                                                <div
                                                    key={p.CodigoProduto}
                                                    onClick={() => handleAdicionarItem(p)}
                                                    style={dropdownItem}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f7faff")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                                                >
                                                    <div>{p.NomeProduto}</div>
                                                    <div style={{ fontWeight: 700 }}>R$ {Number(p.PrecoVenda ?? 0).toFixed(2)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={dropdownItem}>Nenhum produto encontrado</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ width: 120 }}>
                                <label style={{ ...labelStyle, marginBottom: 6 }}>Quantidade</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value || 1)))}
                                    style={{ ...inputStyle, padding: "8px 10px" }}
                                />
                            </div>

                            <div>
                                <button
                                    onClick={() => {
                                        const p = produtosFiltrados[0];
                                        if (p) handleAdicionarItem(p);
                                    }}
                                    style={buttonPrimary}
                                >
                                    ➕ Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Itens */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <div style={tableWrapper}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f7f9fc" }}>
                                    <th style={th}>Produto</th>
                                    <th style={thCenter}>Qtd</th>
                                    <th style={thRight}>Unitário (R$)</th>
                                    <th style={thRight}>Subtotal (R$)</th>
                                    <th style={thCenter}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 12 }}>
                                            Nenhum produto adicionado.
                                        </td>
                                    </tr>
                                )}
                                {itens.map((item) => (
                                    <tr key={item.produto_id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={td}>{item.nome}</td>
                                        <td style={tdCenter}>
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.quantidade}
                                                onChange={(e) => handleAtualizarQuantidade(item.produto_id, Math.max(1, Number(e.target.value || 1)))}
                                                style={{ width: 80, padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
                                            />
                                        </td>
                                        <td style={tdRight}>{Number(item.valor_unitario || 0).toFixed(2)}</td>
                                        <td style={tdRight}>{Number(item.subtotal || 0).toFixed(2)}</td>
                                        <td style={tdCenter}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoverItem(item.produto_id);
                                                }}
                                                style={btnRemover}
                                            >
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Valor total */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Valor Total</label>
                    <input style={inputStyle} readOnly value={Number(venda.valor_total || 0).toFixed(2)} />
                </div>

                {/* Forma de pagamento */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Forma de Pagamento</label>
                    <select style={inputStyle} name="forma_pagamento" value={venda.forma_pagamento ?? ""} onChange={handleChangeVenda}>
                        <option value="">Selecione...</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="pix">PIX</option>
                        <option value="boleto">Boleto</option>
                    </select>
                </div>
                <div style={inputGroup}>
                    <label style={labelStyle}>Status</label>
                    <select style={inputStyle} name="status" value={venda.status ?? ""} onChange={handleChangeVenda}>
                        <option value="">selecione</option>
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>

                    </select>
                </div>
                {/* Observações */}
                <div style={{ ...inputGroup, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Observações</label>
                    <textarea style={{ ...inputStyle, minHeight: 80 }} name="observacoes" value={venda.observacoes ?? ""} onChange={handleChangeVenda} />
                </div>

                {/* Ações */}
                <div style={botoesContainer}>
                    <button onClick={handleSalvar} style={buttonPrimary}>
                        Salvar
                    </button>
                    <button onClick={voltar} style={buttonSecondary}>
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ========== STYLES ========== */
const pageContainer: React.CSSProperties = { padding: 30, backgroundColor: "#f3f4f6", minHeight: "100vh", boxSizing: "border-box" };
const titulo: React.CSSProperties = { color: "#1e3a8a", fontWeight: 700, fontSize: 24, marginBottom: 20, textAlign: "center" };
const formContainer: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "18px 20px",
};
const inputGroup: React.CSSProperties = { display: "flex", flexDirection: "column" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontWeight: 600, color: "#1e3a8a" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" };
const botoesContainer: React.CSSProperties = { gridColumn: "1 / -1", display: "flex", justifyContent: "center", gap: 12, marginTop: 12 };
const buttonPrimary: React.CSSProperties = { padding: "10px 18px", borderRadius: 8, backgroundColor: "#1e3a8a", color: "#fff", border: "none", cursor: "pointer" };
const buttonSecondary: React.CSSProperties = { padding: "10px 18px", borderRadius: 8, backgroundColor: "#6b7280", color: "#fff", border: "none", cursor: "pointer" };

const produtoBox: React.CSSProperties = { background: "#ffffff00" };
const dropdown: React.CSSProperties = {
    position: "absolute",
    top: "105%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 8,
    zIndex: 999,
    maxHeight: 220,
    overflowY: "auto",
    boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
};
const dropdownItem: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" };

const tableWrapper: React.CSSProperties = { width: "100%", overflowX: "auto", borderRadius: 8 };
const th: React.CSSProperties = { padding: 10, textAlign: "left" };
const thCenter: React.CSSProperties = { padding: 10, textAlign: "center", width: 100 };
const thRight: React.CSSProperties = { padding: 10, textAlign: "right", width: 140 };
const td: React.CSSProperties = { padding: 10 };
const tdCenter: React.CSSProperties = { padding: 10, textAlign: "center" };
const tdRight: React.CSSProperties = { padding: 10, textAlign: "right" };

const btnRemover: React.CSSProperties = {
    background: "#dc3545",
    color: "#fff",

    textAlign: "center",
    cursor: "pointer",
    padding: '5px 10px'
};
