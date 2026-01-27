import React from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { setPermissoes as setPermissoesGlobais, verifyPerm } from '../../components/helpers/verifyPerm';
import { toastErro } from "../helpers/toastErro";
import OrcamentoModal from "./OrcamentoModal";


interface OrcamentosProps {
    setPage: (page: string) => void;
}

export default function Orcamentos({ setPage }: OrcamentosProps) {
    const [orcamentos, setOrcamentos] = useState<any[]>([]);
    const [abrirModal, setAbrirModal] = useState(false)
    const carregarOrcamentos = async () => {
        try {
            const lista = await window.ipcRenderer.invoke('orcamentos:listar');
            setOrcamentos(lista)
        }
        catch (err) {
            toastErro(err)
        }
    }
    useEffect(() => {
        carregarOrcamentos()
    }, [])
    console.log(orcamentos)
    return (
        <div style={pageContainer}>
            <button
                onClick={() => setPage("movimentacao")}
                style={btnVoltar}
            >
                ← Voltar
            </button>

            <div style={header}>
                <h2 style={{ color: '#1e3a8a' }}>Orcamentos</h2>
                <button style={btnNovo} onClick={() => setAbrirModal(true)}>Novo Orçamento</button>
            </div>
            <div style={card}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={theadRow}>
                        <tr >
                            <th style={th}>Cliente</th>
                            <th style={th}>Usuario</th>
                            <th style={th}>Valor total</th>
                            <th style={th}>Descontos</th>
                            <th style={th}>Valor Final</th>
                            <th style={th}>Status</th>
                            <th style={th}>Data</th>
                            <th style={th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orcamentos.map((o) => {
                            const data = new Date();
                            return (
                                <tr key={o.id} style={{ borderBottom: "1px solid #e5e7eb" }}>

                                    <td style={td}>{o.cliente_nome}</td>
                                    <td style={td}>{o.usuario_nome} </td>
                                    <td style={td}>R${o.valor_total}</td>
                                    <td style={td}>R${o.descontos}</td>
                                    <td style={td}>R${o.valor_final}</td>
                                    <td style={td}>{o.status}</td>
                                    <td style={td}> {data.toLocaleDateString(o.criado_em)}</td>
                                    <td style={td}>

                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {abrirModal && (
                <OrcamentoModal onClose={() => setAbrirModal(false)} refresh={carregarOrcamentos} />
            )}
        </div>
    )
}
const input: React.CSSProperties = { padding: 8, borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 10, width: '100%' };

const pageContainer: React.CSSProperties = {
    padding: 20,
    backgroundColor: "#f5f7fa",
    minHeight: "100vh"
};

const btnVoltar = {
    background: "#e5e7eb",
    color: "#7c2d12",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    marginBottom: "20px",
};

const btnParcelas = {
    background: "#e5e7eb",
    color: "#7c2d12",
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
};

const card = {
    background: "#fff",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
};

const theadRow = {
    backgroundColor: "#e5e7eb",
    color: "#7c2d12",
    width: '100%'
};

const th: React.CSSProperties = {
    padding: 10,
    fontWeight: 600,
    textAlign: "center",
};

const td = {
    padding: "12px 8px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
    textAlign: "center",
    color: "#374151",
};
const btnNovo = { background: '#1e3a8a', color: '#fff', padding: '10px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 };
