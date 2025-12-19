import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

declare global {
    interface Window {
        electronAPI: {
            addProduto: (produto: any) => Promise<void>;
            getFabricantes: () => Promise<any[]>;
            getGrupos: () => Promise<any[]>;
            getSubGrupos: () => Promise<any[]>;
            getSubGruposByGrupo: (codigoGrupo: number) => Promise<any[]>;
            getFabricanteById: (CodigoFabricante: number) => Promise<any[]>

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
    EstoqueAtual?: number;
}

const maxLength: Record<string, number> = {
    CodigoBarra: 15,
    NomeProduto: 150,
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
        DataCadastro: new Date().toISOString().split("T")[0],
    });

    const [fabricantes, setFabricantes] = useState<any[]>([]);
    const [grupos, setGrupos] = useState<any[]>([]);
    const [subGrupos, setSubGrupos] = useState<any[]>([]);
    const [fabricanteSelecionado, setFabricanteSelecionado] = useState(null)

    // 📌 Buscar dados do banco ao abrir o formulário
    useEffect(() => {
        const carregarSelects = async () => {
            setFabricantes(await window.electronAPI.getFabricantes());
            setGrupos(await window.electronAPI.getGrupos());
            setSubGrupos(await window.electronAPI.getSubGrupos());
        };
        carregarSelects();
    }, []);
    useEffect(() => {
        const carregarSubPorGrupo = async () => {
            if (!produto.CodigoGrupo) {
                setSubGrupos([]);
                return;
            }

            const lista = await window.electronAPI.getSubGruposByGrupo(Number(produto.CodigoGrupo));
            setSubGrupos(lista);
        };

        carregarSubPorGrupo();
    }, [produto.CodigoGrupo]);
    /*
    useEffect(() => {
        const carregarFabricanteId = async () => {
            try {
                const fabricante = await getFabricanteById(produto.CodigoFabricante);

                setFabricanteSelecionado(fabricante)
            }
            catch (err) {
                console.error("Erro ao carregar fabricante", err)
            }
        }
        carregarFabricanteId();
    }, [produto.CodigoFabricante]);*/

    useEffect(() => {
        const carregarSubPorGrupo = async () => {
            if (!produto.CodigoGrupo) {
                setSubGrupos([]);
                return;
            }

            const lista = await window.electronAPI.getSubGruposByGrupo(Number(produto.CodigoGrupo));
            setSubGrupos(lista);
        };

        carregarSubPorGrupo();
    }, [produto.CodigoGrupo]);
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setProduto((prev) => ({ ...prev, [name]: value }));
    };

    const handleSalvar = async () => {
        try {
            await window.electronAPI.addProduto(produto);
            toast.success("✅ Produto cadastrado com sucesso!");
            voltar();
        } catch (err) {
            console.error(err);
            toast.error("❌ Erro ao cadastrar produto.");
        }
    };


    const labels: Record<string, string> = {
        CodigoBarra: "Código de Barras",
        NomeProduto: "Nome do Produto",
        EstoqueAtual: "Estoque Atual",
        CodigoGrupo: "Grupo",
        CodigoSubGrupo: "Subgrupo",
        CodigoFabricante: "Fabricante",
        DataCadastro: "Data de Cadastro",
        UnidadeEmbalagem: "Unidade",
        FracaoVenda: "Fração de Venda",
        NCM: "NCM",
        Eliminado: "Eliminado",
        IPI: "IPI",
        ReducaoIPI: "Redução IPI",
        PisCofinsCST: "CST PIS/COFINS",
        PisCofinsNatureza: "Natureza PIS/COFINS",
        PisCofinsCSTEntrada: "CST Entrada",
        CEST: "CEST",
        CodigoBeneficio: "Código Benefício",
    };


    return (
        <div style={pageContainer}>
            <button
                onClick={() => voltar()}
                style={{
                    backgroundColor: '#e5e7eb',
                    color: '#1e3a8a',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: '20px'
                }}
            >
                ← Voltar
            </button>
            <h2 style={titulo}>🆕 Cadastrar Produto</h2>

            <div style={formContainer}>
                {Object.keys({
                    CodigoBarra: "",
                    NomeProduto: "",
                    EstoqueAtual: "",
                    CodigoGrupo: "",
                    CodigoSubGrupo: "",
                    CodigoFabricante: "",
                    DataCadastro: "",
                    UnidadeEmbalagem: "",
                    FracaoVenda: "",
                    NCM: "",
                    Eliminado: "",
                    IPI: "",
                    ReducaoIPI: "",
                    PisCofinsCST: "",
                    PisCofinsNatureza: "",
                    PisCofinsCSTEntrada: "",
                    CEST: "",
                    CodigoBeneficio: "",
                }).map((key) => (
                    <div key={key} style={inputGroup}>
                        <label style={labelStyle}>{labels[key] ?? key}</label>


                        {/* 🔽 SELECTs para os 3 campos */}
                        {key === "CodigoFabricante" ? (
                            <select
                                style={inputStyle}
                                name={key}
                                value={produto[key] ?? ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecione...</option>
                                {fabricantes.map((f) => (
                                    <option key={f.CodigoFabricante} value={f.CodigoFabricante}>
                                        {f.NomeFabricante}
                                    </option>
                                ))}
                            </select>
                        ) : key === "CodigoGrupo" ? (
                            <select
                                style={inputStyle}
                                name={key}
                                value={produto[key] ?? ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecione...</option>
                                {grupos.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.nome}
                                    </option>
                                ))}
                            </select>
                        ) : key === "CodigoSubGrupo" ? (
                            <select
                                style={inputStyle}
                                name={key}
                                value={produto[key] ?? ""}
                                onChange={handleChange}
                                disabled={!produto.CodigoGrupo} // evita subgrupo sem grupo
                            >
                                <option value="">
                                    {produto.CodigoGrupo ? "Selecione..." : "Selecione um grupo primeiro"}
                                </option>
                                {subGrupos.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nome}
                                    </option>
                                ))}
                            </select>
                        ) : (

                            // 🔁 Inputs normais
                            <input
                                style={inputStyle}
                                name={key}
                                value={maxLength[key]
                                    ? (produto as any)[key]?.toString().slice(0, maxLength[key]) ?? ""
                                    : (produto as any)[key] ?? ""}
                                onChange={handleChange}
                                type={
                                    key === "DataCadastro"
                                        ? "date"
                                        : key === "EstoqueAtual"
                                            ? "number"
                                            : "text"
                                }
                                min={key === "EstoqueAtual" ? 0 : undefined}
                            />
                        )}
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

/* ======== ESTILOS (mantidos) ======== */


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
