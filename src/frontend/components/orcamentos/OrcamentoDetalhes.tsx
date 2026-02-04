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


interface OrcamentoDetalhesProps {
    onClose: () => void;
    refresh: () => void;
    orcamento: any;
}

export default function OrcamentoDetalhes({ onClose, refresh, orcamento }: OrcamentoDetalhesProps) {

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}')


    const [orcamentoDetalhado, setOrcamentoDetalhado] = useState<any>({});
    //const [status, setStatus] = useState(null)


    console.log("ORCAMENTO DETALHES", orcamento)

    const carregarOrcamentoSelecionado = async () => {
        try {
            const lista = await window.ipcRenderer.invoke("orcamentos:listar-orcamento-selecionado", orcamento.id)
            setOrcamentoDetalhado(lista)
        } catch (error) {
            toastErro(error)
        }
    }

    useEffect(() => {
        carregarOrcamentoSelecionado()
    }, [])
    console.log(orcamentoDetalhado)
    return (
        <div style={overlay}>
            <div style={modal}>
                {orcamentoDetalhado && (
                    <>
                        {/* DADOS PRINCIPAIS */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <b>Cliente:</b> {orcamentoDetalhado.cliente_nome}
                                </div>
                                <div>
                                    <b>Status:</b>{" "}
                                    <span style={{
                                        color: orcamentoDetalhado.status === "aprovado" ? "#16a34a" : "#ca8a04",
                                        fontWeight: 600
                                    }}>
                                        {orcamentoDetalhado.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                                <div><b>Usuário:</b> {orcamentoDetalhado.usuario_nome}</div>
                                <div><b>Data:</b> {new Date(orcamentoDetalhado.criado_em).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* HEADER ITENS */}
                        <div style={{ ...itemRow, fontWeight: 600, marginTop: 10 }}>
                            <div>Produto</div>
                            <div>Qtd</div>
                            <div>Preço</div>
                            <div>Total</div>
                        </div>

                        {/* ITENS */}
                        {orcamentoDetalhado.itens?.map((item: any, index: number) => (
                            <div key={index} style={itemRow}>
                                <div style={col}>
                                    <span style={smallLabel}>Produto</span>
                                    <input
                                        style={input}
                                        readOnly
                                        value={item.NomeProduto}
                                    />
                                </div>

                                <div style={col}>
                                    <span style={smallLabel}>Qtd</span>
                                    <input
                                        style={input}
                                        readOnly
                                        value={Number(item.quantidade)}
                                    />
                                </div>

                                <div style={col}>
                                    <span style={smallLabel}>Unitário</span>
                                    <input
                                        style={input}
                                        readOnly
                                        value={`R$ ${Number(item.preco_unitario).toFixed(2)}`}
                                    />
                                </div>

                                <div style={col}>
                                    <span style={smallLabel}>Subtotal</span>
                                    <input
                                        style={input}
                                        readOnly
                                        value={`R$ ${Number(item.subtotal).toFixed(2)}`}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* TOTAIS */}
                        <div style={{ marginTop: 16 }}>
                            <div><b>Valor bruto:</b> R$ {Number(orcamentoDetalhado.valor_total).toFixed(2)}</div>
                            <div><b>Desconto:</b> R$ {Number(orcamentoDetalhado.descontos).toFixed(2)}</div>
                            <div style={{ fontSize: 16, marginTop: 4 }}>
                                <b>Valor final:</b> R$ {Number(orcamentoDetalhado.valor_final).toFixed(2)}
                            </div>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <Button variant="contained" color="primary" style={{ flex: 1 }} >Salvar</Button>
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
    background: '#fff', padding: 20, borderRadius: 8, width: '800px', maxHeight: '90vh',
    overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const label: React.CSSProperties = { fontWeight: 600, marginBottom: 5, display: 'block' };
const input: React.CSSProperties = {
    padding: 8,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    width: '100%',
    boxSizing: 'border-box'
};
const itemRow: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2.2fr 0.8fr 1.2fr 1.2fr 36px',
    gap: 12,
    alignItems: 'end',
    marginBottom: 12
};


const col: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0
};


const smallLabel: React.CSSProperties = {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600
};

const btnRemover: React.CSSProperties = {
    background: '#f87171',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    width: 32,
    height: 32,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

};


const btnNovo: React.CSSProperties = { background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', margin: "10px 0px" };
