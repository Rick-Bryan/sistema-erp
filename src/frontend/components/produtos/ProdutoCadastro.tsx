import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { toastErro } from "../helpers/toastErro";

declare global {
    interface Window {
        electronAPI: {
            addProduto: (produto: any) => Promise<void>;
            getFabricantes: () => Promise<any[]>;
            getGrupos: () => Promise<any[]>;
            getSubGrupos: () => Promise<any[]>;
            getSubGruposByGrupo: (codigoGrupo: number) => Promise<any[]>;
            getFabricanteById: (CodigoFabricante: number) => Promise<any[]>
            getProdutos: () => Promise<any[]>;

            addGrupo: (nome: string) => Promise<void>;

            addSubGrupo: (nome: string) => Promise<void>;

            atualizarGrupo: () => Promise<any[]>;
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
        CodigoGrupo: undefined,
        CodigoSubGrupo: undefined,
    });

    const [produtos, setProdutos] = useState<any[]>([]);
    const [fabricantes, setFabricantes] = useState<any[]>([]);

    const [fabricanteSelecionado, setFabricanteSelecionado] = useState(null)
    const [modalGrupo, setModalGrupo] = useState(false);
    const [modalSubGrupo, setModalSubGrupo] = useState(false);
    const [comissaoGrupo, setComissaoGrupo] = useState("");

    // DADOS INTERNOS
    const [grupos, setGrupos] = useState<any[]>([]);
    const [grupoSelecionado, setGrupoSelecionado] = useState<number | "">("");
    const [subGrupos, setSubGrupos] = useState<any[]>([]);

    const [novoGrupo, setNovoGrupo] = useState("");
    const [novoSubGrupo, setNovoSubGrupo] = useState("");

    const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
    const [modoCadastro, setModoCadastro] = useState(false);
    const [grupoEditando, setGrupoEditando] = useState(null);
    const [subGrupoEditando, setSubGrupoEditando] = useState(null);


    const campos = [
        "CodigoBarra",
        "NomeProduto",
        "EstoqueAtual",
        "CodigoGrupo",
        "CodigoSubGrupo",
        "CodigoFabricante",
        "DataCadastro",
        "UnidadeEmbalagem",
        "FracaoVenda",
        "NCM",
        "Eliminado",
        "IPI",
        "ReducaoIPI",
        "PisCofinsCST",
        "PisCofinsNatureza",
        "PisCofinsCSTEntrada",
        "CEST",
        "CodigoBeneficio",
    ];


    // DADOS INTERNOS


    console.log("Grupos", grupos)
    console.log("SubGrupos", subGrupos)
    const carregarProdutos = async () => {
        setProdutos(await window.electronAPI.getProdutos());
    };

    const carregarGrupos = async () => {
        setGrupos(await window.electronAPI.getGrupos());
    };

    const carregarSubGrupos = async () => {
        setSubGrupos(await window.electronAPI.getSubGrupos());
    };

    const adicionarGrupo = async (novoGrupo, comissaoGrupo) => {
        try {
            const result = await window.electronAPI.addGrupo(novoGrupo, comissaoGrupo);
            setNovoGrupo("");
            setComissaoGrupo("");
            carregarGrupos();
            toast.success("grupo foi cadastrado com sucesso")
            return result;
        }
        catch (err) {
            toastErro(err)
        }


    }



    const atualizarGrupo = async () => {
        await window.electronAPI.atualizarGrupo(
            grupoEditando.id,
            novoGrupo,
            comissaoGrupo
        );

        toast.success("Grupo atualizado com sucesso!");
        setGrupoEditando(null);
        setNovoGrupo("");
        setComissaoGrupo("");
        setModalGrupo(false);
        carregarGrupos();
    };

    const excluirGrupo = async (id) => {

        try {
            await window.electronAPI.excluirGrupo(id);
            toast.success("Grupo excluído!");
            carregarGrupos();
        } catch (err) {
            toastErro(err)
        }
    };

    const adicionarSubGrupo = async () => {
        try {
            if (!novoSubGrupo.trim()) {
                toast.error("Informe o nome do subgrupo");
                return;
            }

            if (!grupoSelecionado) {
                toast.error("Selecione um grupo antes de cadastrar um subgrupo");
                return;
            }

            await window.electronAPI.addSubGrupo(novoSubGrupo, Number(grupoSelecionado));

            setNovoSubGrupo("");
            carregarSubGrupos();

            toast.success("Subgrupo cadastrado com sucesso!");
        } catch (err) {
            toastErro(err)
        }
    };
    const atualizarSubGrupo = async () => {
        try {
            await window.electronAPI.atualizarSubGrupo(
                subGrupoEditando.id,
                novoSubGrupo,
                grupoSelecionado
            );

            toast.success("Subgrupo atualizado!");

            setSubGrupoEditando(null);
            setNovoSubGrupo("");
            setGrupoSelecionado("");

            carregarSubGrupos();
        } catch (err) {
            toastErro(err)
        }
    };

    const excluirSubgrupo = async (id) => {

        try {
            await window.electronAPI.excluirSubGrupo(id);
            toast.success("Subgrupo excluído!");
            carregarSubGrupos();
        } catch (err) {
            toastErro(err)
        }
    };

    useEffect(() => {
        const carregarSubPorGrupo = async () => {
            if (!grupoSelecionado) {
                setSubGrupos([]);
                return;
            }

            const lista = await window.electronAPI.getSubGruposByGrupo(Number(grupoSelecionado));
            setSubGrupos(lista);
        };

        carregarSubPorGrupo();
    }, [grupoSelecionado]);


    useEffect(() => {
        carregarProdutos();
        carregarGrupos();
        carregarSubGrupos();
    }, []);

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
            toastErro(err)
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
            <h2 style={titulo}>Cadastrar Produto</h2>

            <div style={formContainer}>
                {campos.map((key) => (
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
                            <>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {/* Botão Grupo */}

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
                                    <button
                                        onClick={() => setModalGrupo(true)}
                                        style={btnAzul}
                                    >
                                        ＋
                                    </button>

                                </div>

                            </>
                        ) : key === "CodigoSubGrupo" ? (
                            < >
                                <div style={{ display: 'flex', gap: '10px' }}>
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
                                    <button
                                        onClick={() => setModalSubGrupo(true)}
                                        style={btnAzul}
                                    >
                                        ＋
                                    </button>
                                </div>
                            </>
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
            {modalGrupo && (
                <Modal>
                    <h3>Cadastrar Grupo</h3>

                    <input
                        style={inputModal}
                        placeholder="Nome do grupo"
                        value={novoGrupo}
                        onChange={(e) => setNovoGrupo(e.target.value)}
                    />
                    <input
                        style={inputModal}
                        placeholder="Comissao"
                        value={comissaoGrupo}
                        onChange={(e) => setComissaoGrupo(e.target.value)}
                    />



                    <h4>Grupos cadastrados:</h4>

                    <div style={boxTabelaModal}>
                        <table style={tabelaModal}>
                            <thead>
                                <tr>
                                    <th style={thModal}>Nome</th>
                                    <th style={thModal}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grupos.map((g, index) => (
                                    <tr key={g.id} style={index % 2 === 0 ? linhaPar : linhaImpar}>
                                        <td style={tdModal}>{g.nome}</td>
                                        <td style={tdModal}>
                                            <button
                                                onClick={() => {
                                                    setGrupoEditando(g);
                                                    setNovoGrupo(g.nome);
                                                    setComissaoGrupo(g.Comissao || "");
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button onClick={() => excluirGrupo(g.id)}>
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                    <button
                        style={btnSalvar}
                        onClick={() =>
                            grupoEditando
                                ? atualizarGrupo()
                                : adicionarGrupo(novoGrupo, comissaoGrupo)
                        }
                    >
                        {grupoEditando ? "Atualizar" : "Salvar"}
                    </button>
                    <button onClick={() => {
                        setModalGrupo(false)
                        setGrupoEditando(null);
                        setNovoGrupo("");
                        setComissaoGrupo("");
                    }} style={btnFechar}>Fechar</button>
                </Modal>
            )}

            {/* ------------------- MODAL SUBGRUPO ------------------- */}
            {modalSubGrupo && (
                <Modal>
                    <h3>Cadastrar Subgrupo</h3>
                    <select
                        style={inputModal}
                        value={grupoSelecionado ?? ""}
                        onChange={(e) => {
                            const valor = e.target.value;

                            setGrupoSelecionado(valor || null);

                            // Se voltou para "Selecione..."
                            if (!valor) {
                                setSubGrupoEditando(null);
                                setNovoSubGrupo("");
                            }
                        }}
                    >
                        <option value="">Selecione o Grupo</option>
                        {grupos.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.nome}
                            </option>
                        ))}
                    </select>
                    <input
                        style={inputModal}
                        placeholder="Nome do subgrupo"
                        value={novoSubGrupo}
                        onChange={(e) => {
                            const valor = e.target.value
                            setNovoSubGrupo(valor)
                            if (valor.trim() === '') {
                                setGrupoEditando(null)

                            }
                        }
                        }
                    />





                    {grupoSelecionado && (
                        <>
                            <h4>SubGrupos cadastrados:</h4>

                            <div style={boxTabelaModal}>
                                <table style={tabelaModal}>
                                    <thead>
                                        <tr>
                                            <th style={thModal}>Nome</th>
                                            <th style={thModal}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subGrupos.map((s, index) => (
                                            <tr key={s.id} style={index % 2 === 0 ? linhaPar : linhaImpar}>
                                                <td style={tdModal}>{s.nome}</td>
                                                <td style={tdModal}>
                                                    <button
                                                        onClick={() => {
                                                            setSubGrupoEditando(s);
                                                            setNovoSubGrupo(s.nome);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button onClick={() => excluirSubgrupo(s.id)}>
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        </>)}
                    <button
                        style={btnSalvar}
                        onClick={() =>
                            subGrupoEditando
                                ? atualizarSubGrupo()
                                : adicionarSubGrupo(novoSubGrupo, grupoSelecionado)
                        }
                    >
                        {subGrupoEditando ? "Atualizar" : "Salvar"}
                    </button>
                    <button onClick={() => {
                        setModalSubGrupo(false)
                        setSubGrupoEditando(null);
                        setNovoSubGrupo("");
                    }




                    } style={btnFechar}>Fechar</button>
                </Modal>
            )
            }
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



/* ------------ COMPONENTE MODAL GENERICO ------------- */
function Modal({ children }: { children: any }) {
    return (
        <div style={modalFundo}>
            <div style={modalBox}>
                {children}
            </div>
        </div>
    );
}


const btnAzul: React.CSSProperties = {
    backgroundColor: '#1e3a8a',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
};


const inputModal: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
};

const btnSalvar: React.CSSProperties = {
    ...btnAzul,
    width: '100%',
    marginBottom: '15px'
};

const btnFechar: React.CSSProperties = {
    backgroundColor: '#b91c1c',
    color: 'white',
    padding: '8px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%'
};

const modalFundo: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modalBox: React.CSSProperties = {
    background: "#fff",
    padding: "25px",
    borderRadius: "8px",
    width: "450px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
};


/* -------- MELHOR ESTILO DAS TABELAS DO MODAL -------- */

const boxTabelaModal: React.CSSProperties = {
    maxHeight: "200px",
    overflowY: "auto",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    marginTop: "10px",
    marginBottom: "10px"
};

const tabelaModal: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
};

const thModal: React.CSSProperties = {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "10px",
    textAlign: "left",
    fontWeight: 600,
    position: "sticky",
    top: 0,
};

const tdModal: React.CSSProperties = {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
};

const linhaPar: React.CSSProperties = {
    backgroundColor: "#ffffff",
};

const linhaImpar: React.CSSProperties = {
    backgroundColor: "#f3f4f6",
};
