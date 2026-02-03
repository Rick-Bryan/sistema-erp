import React, { useState, useEffect } from 'react';
import FornecedorDetalhes from './FornecedorDetalhes';
import SearchBar from "../../components/ui/SearchBar";
import toast from "react-hot-toast";

import FornecedorCadastro from './FornecedorCadastro';
import { toastErro } from '../helpers/toastErro';
declare global {
    interface Window {
        electronAPI: {
            getFornecedores: () => Promise<any[]>;
            deletarFornecedor: (CodigoFornecedor: number) => Promise<void>;
        };
    }
}

interface FornecedoresProps {

    abrirAba: (page: string, titulo: string, params?: any) => void;
    voltar: () => void
}

export default function Fornecedores({ abrirAba, voltar }: FornecedoresProps) {
    const [fornecedores, setFornecedores] = useState<any[]>([]);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState<any | null>(null);
    const [modoCadastro, setModoCadastro] = useState(false);
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
    const nivelUsuario = usuarioLogado?.nivel;
    const carregarFornecedores = async () => {
        const lista = await window.electronAPI.getFornecedores();
        setFornecedores(lista);
    };

    useEffect(() => {
        carregarFornecedores();
    }, []);

    if (fornecedorSelecionado) {
        return (
            <FornecedorDetalhes
                fornecedorSelecionado={fornecedorSelecionado}
                voltar={() => {
                    setFornecedorSelecionado(null);
                    carregarFornecedores();
                }}
            />
        );
    }
    const excluirFornecedor = async (CodigoFornecedor) => {
        try {
            const resposta = await window.ipcRenderer.invoke("delete-fornecedor", {
                CodigoFornecedor,
                usuario: usuarioLogado, // ✅ nome correto
            });

            if (resposta.sucesso) {
                toast.success("Fornecedor excluído com sucesso!");
                carregarFornecedores();
            } else {
                toast.error(resposta.mensagem || "Falha ao excluir fornecedor");
            }
        } catch (err) {
            console.error(err);
            toastErro(err)
        }
    };

    // 🔹 Exibe o formulário de cadastro
    if (modoCadastro) {
        return (
            <FornecedorCadastro
                voltar={() => {
                    setModoCadastro(false);
                    setTimeout(() => carregarFornecedores(), 150); // garante recarregar após desmontar
                }}
            />
        );
    }
    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            {/* 🔙 Botão de voltar */}
            <button
                onClick={voltar}
                style={{
                    backgroundColor: '#e5e7eb',
                    color: '#1e3a8a',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: '20px',
                }}
            >
                ← Voltar
            </button>

            {/* Cabeçalho */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h2 style={{ color: '#1e3a8a' }}>Fornecedores</h2>
                <button
                    onClick={() => setModoCadastro(true)}
                    style={{
                        backgroundColor: '#1e3a8a',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    ＋ Novo Fornecedor
                </button>
            </div>

            {/* Tabela */}
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '20px',
                }}
            >
                <SearchBar
                    canal="get-fornecedores"
                    placeholder="Pesquisar fornecedor por nome ou CNPJ..."
                    onResults={setFornecedores}
                />

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a', textAlign: 'left' }}>
                            <th style={thStyle}>Código</th>
                            <th style={thStyle}>Nome</th>
                            <th style={thStyle}>Nome Fantasia</th>
                            <th style={thStyle}>CNPJ</th>
                            <th style={thStyle}>Cidade</th>
                            <th style={thStyle}>Ativo</th>
                            <th style={thStyle}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fornecedores.map((f) => (
                            <tr key={f.CodigoFornecedor} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={tdStyle}>{f.CodigoFornecedor}</td>
                                <td style={tdStyle}>{f.Nome}</td>
                                <td style={tdStyle}>{f.NomeFantasia}</td>
                                <td style={tdStyle}>{f.CNPJ}</td>
                                <td style={tdStyle}>{f.Cidade}</td>
                                <td style={tdStyle}>{f.Ativo ? 'Sim' : 'Não'}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => setFornecedorSelecionado(f)}
                                        style={{
                                            backgroundColor: '#1e3a8a',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '5px',
                                        }}
                                    >
                                        Visualizar
                                    </button>
                                    {nivelUsuario === "administrador" && (

                                        <button
                                            onClick={() => excluirFornecedor(f.CodigoFornecedor)}
                                            style={{
                                                backgroundColor: "#1e3a8a",
                                                color: "#fff",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    )
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle: React.CSSProperties = {
    padding: '10px',
    fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
    padding: '10px',
};
