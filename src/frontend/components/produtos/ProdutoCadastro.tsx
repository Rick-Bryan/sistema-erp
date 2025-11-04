import React, { useState } from 'react';
import toast from 'react-hot-toast';
declare global {
    interface Window {
        electronAPI: {
            addProduto: (produto: any) => Promise<void>;
        };
    }
}

interface Produto {
    CodigoBarra?: string;
    NomeProduto?: string;
    CodigoGrupo?: number;
    CodigoSubGrupo?: number;
    CodigoFabricante?: number;
    DataCadastro?: string;
    UnidadeEmbalagem?: string;
    FracaoVenda?: number;
    NCM?: string;
    Eliminado?: number;
    IPI?: number;
    ReducaoIPI?: number;
    PisCofinsCST?: string;
    PisCofinsNatureza?: string;
    PisCofinsCSTEntrada?: string;
    CEST?: string;
    CodigoBeneficio?: string;
    EstoqueAtual?: number; // ✅ Novo campo
}
const maxLength: Record<string, number> = {
  CodigoBarra: 15,
  NomeProduto: 15,
  UnidadeEmbalagem: 5,
  NCM: 10,
  PisCofinsCST: 2,
  PisCofinsNatureza: 3,
  PisCofinsCSTEntrada: 2,
  CEST: 7,
  CodigoBeneficio: 8,
};

export default function ProdutoCadastro({ voltar }: { voltar: () => void }) {
    const [produto, setProduto] = useState<Produto>({
        DataCadastro: new Date().toISOString().split('T')[0], // valor padrão de hoje
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProduto((prev) => ({ ...prev, [name]: value }));
    };

    const handleSalvar = async () => {
        try {
            await window.electronAPI.addProduto(produto);
            toast.success('✅ Produto cadastrado com sucesso!');
            voltar();
        } catch (err) {
            console.error(err);
            toast.error('❌ Erro ao cadastrar produto.');
        }
    };

    return (
        <div style={pageContainer}>
            <h2 style={titulo}>🆕 Cadastrar Produto</h2>

            <div style={formContainer}>
                {Object.keys({
                    CodigoBarra: '',
                    NomeProduto: '',
                    EstoqueAtual: '', // ✅ Campo adicionado
                    CodigoGrupo: '',
                    CodigoSubGrupo: '',
                    CodigoFabricante: '',
                    DataCadastro: '',
                    UnidadeEmbalagem: '',
                    FracaoVenda: '',
                    NCM: '',
                    Eliminado: '',
                    IPI: '',
                    ReducaoIPI: '',
                    PisCofinsCST: '',
                    PisCofinsNatureza: '',
                    PisCofinsCSTEntrada: '',
                    CEST: '',
                    CodigoBeneficio: '',

                }).map((key) => (
                    <div key={key} style={inputGroup}>
                        <label style={labelStyle}>{key}</label>
                        <input
                            style={inputStyle}
                            name={key}
                            value={(produto as any)[key]?.slice(0, maxLength[key]) ?? ''}
                            onChange={handleChange}
                            type={key === 'DataCadastro' ? 'date' : key === 'EstoqueAtual' ? 'number' : 'text'}
                            min={key === 'EstoqueAtual' ? 0 : undefined}
                            step={key === 'EstoqueAtual' ? 0 : undefined}
                        />

                    </div>
                ))}

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

/* ======== ESTILOS ======== */

const pageContainer: React.CSSProperties = {
    padding: '30px',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    boxSizing: 'border-box',
};

const titulo: React.CSSProperties = {
    color: '#1e3a8a',
    fontWeight: 700,
    fontSize: '24px',
    marginBottom: '25px',
    textAlign: 'center',
};

const formContainer: React.CSSProperties = {
    maxWidth: '1100px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '25px 30px',
    boxSizing: 'border-box',
};

const inputGroup: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle: React.CSSProperties = {
    marginBottom: '6px',
    fontWeight: 600,
    color: '#1e3a8a',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    transition: '0.2s border-color',
    fontSize: '15px',
    boxSizing: 'border-box',
};

const botoesContainer: React.CSSProperties = {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
};

const buttonBase: React.CSSProperties = {
    padding: '10px 22px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px',
    transition: '0.2s all ease',
};

const buttonPrimary: React.CSSProperties = {
    ...buttonBase,
    backgroundColor: '#1e3a8a',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
};

const buttonSecondary: React.CSSProperties = {
    ...buttonBase,
    backgroundColor: '#6b7280',
    color: '#fff',
};
