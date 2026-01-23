import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface DefinicoesProps {
    setPage: (page: string) => void;
}

export default function DefinicoesDeAcesso({ setPage }: DefinicoesProps) {
    const [modulos, setModulos] = useState<any[]>([]);
    const [permissoes, setPermissoes] = useState<any>({});
    const [empresas, setEmpresas] = useState([]);
    const [lojas, setLojas] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);



    const [lojaId, setLojaId] = useState("");
    const [cargoId, setCargoId] = useState("");
    const [usuarioId, setUsuarioId] = useState("");





    useEffect(() => {

        setLojaId("");
        setCargoId("");
        setUsuarioId("");
        window.ipcRenderer.invoke("lojas:listarLojas").then(setLojas);
    }, []);

    useEffect(() => {
        if (!lojaId) return;
        setCargoId("");
        setUsuarioId("");
        window.ipcRenderer.invoke("cargos:listarCargos", Number(lojaId)).then(setCargos);
    }, [lojaId]);

    useEffect(() => {
        if (!cargoId) return;
        setUsuarioId("");
        window.ipcRenderer.invoke("usuarios:listarUsuariosPorCargo", Number(cargoId)).then(setUsuarios);
    }, [cargoId]);

    useEffect(() => {
        if (!usuarioId) return;

        window.ipcRenderer.invoke("modulos:listarComSub").then(setModulos);
        window.ipcRenderer.invoke("permissoes:listar", Number(usuarioId)).then(res => {
            const map = {};
            res.forEach(p => {
                map[p.submodulo_id] = {
                    consultar: !!p.pode_consultar,
                    usar: !!p.pode_usar
                };
            });
            setPermissoes(map);
        });
    }, [usuarioId]);

    const salvar = () => {
        console.log(permissoes);
        toast.success("Permissões salvas!");
    };
    const marcarTodosModulo = (modulo: any, tipo: "consultar" | "usar" | "ambos", valor: boolean) => {
        setPermissoes(prev => {
            const copia = { ...prev };

            modulo.submodulos.forEach((s: any) => {
                copia[s.id] = {
                    consultar: tipo === "usar" ? copia[s.id]?.consultar : valor,
                    usar: tipo === "consultar" ? copia[s.id]?.usar : valor,
                };
            });

            return copia;
        });
    };

    return (
        <div style={pageContainer}>
            <h2 style={titulo}>Definições de Acesso</h2>

            <div style={card}>
                {/* filtros */}
                <div style={gridFiltros}>
                    <select style={input} value={lojaId} onChange={e => setLojaId(e.target.value)}>
                        <option value="">Loja</option>
                        {lojas.map(l => (
                            <option key={l.id} value={l.id}>{l.nome}</option>
                        ))}
                    </select>

                    <select style={input} value={cargoId} onChange={e => setCargoId(e.target.value)} disabled={!lojaId}>
                        <option value="">Cargo</option>
                        {cargos.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>

                    <select style={input} value={usuarioId} onChange={e => setUsuarioId(e.target.value)} disabled={!cargoId}>
                        <option value="">Usuário</option>
                        {usuarios.map(u => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* módulos */}
                <div style={{ marginTop: 20 }}>
                    {modulos.map(m => (
                        <details key={m.id} style={accordion}>
                            <summary style={accordionHeader}>
                                <span>{m.nome}</span>

                                <div style={acoesHeader}>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            marcarTodosModulo(m, "ambos", true);
                                        }}
                                        style={btnMini}
                                    >
                                        Tudo
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            marcarTodosModulo(m, "ambos", false);
                                        }}
                                        style={btnMini}
                                    >
                                        Limpar
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            marcarTodosModulo(m, "consultar", true);
                                        }}
                                        style={btnMini}
                                    >
                                        Consultar
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            marcarTodosModulo(m, "usar", true);
                                        }}
                                        style={btnMini}
                                    >
                                        Usar
                                    </button>
                                </div>
                            </summary>


                            <div style={accordionBody}>
                                {m.submodulos.map(s => (
                                    <div key={s.id} style={linhaPermissao}>
                                        <span style={nomeSub}>{s.nome}</span>

                                        <label style={checkItem}>
                                            <input
                                                type="checkbox"
                                                checked={!!permissoes[s.id]?.consultar}
                                                onChange={() =>
                                                    setPermissoes(p => ({
                                                        ...p,
                                                        [s.id]: { ...p[s.id], consultar: !p[s.id]?.consultar }
                                                    }))
                                                }
                                            />
                                            Consultar
                                        </label>

                                        <label style={checkItem}>
                                            <input
                                                type="checkbox"
                                                checked={!!permissoes[s.id]?.usar}
                                                onChange={() =>
                                                    setPermissoes(p => ({
                                                        ...p,
                                                        [s.id]: { ...p[s.id], usar: !p[s.id]?.usar }
                                                    }))
                                                }
                                            />
                                            Usar
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>

                <button style={btnSalvarPadrao} onClick={salvar}>
                    Salvar permissões
                </button>
            </div>
        </div>
    );

}

const label: React.CSSProperties = { fontWeight: 600, marginBottom: 5, display: 'block' };
const input: React.CSSProperties = { padding: 8, borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 10, width: '100%' };
const itemRow: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 };
const btnRemover: React.CSSProperties = { background: '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' };
const btnNovo: React.CSSProperties = { background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' };
const pageContainer: React.CSSProperties = {
    padding: 20,
    backgroundColor: "#f5f7fa",
    minHeight: "100vh"
};

const titulo: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
    color: "#1e3a8a"
};
const acoesHeader: React.CSSProperties = {
    display: "flex",
    gap: 6,
    float:'right',
};

const btnMini: React.CSSProperties = {
    background: "#fff",
    color: "#1e3a8a",
    border: "none",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600
};

const card: React.CSSProperties = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const gridFiltros: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12
};

const accordion: React.CSSProperties = {
    background: "#f9fafb",
    borderRadius: 8,
    marginBottom: 10,
    border: "1px solid #e5e7eb",
    overflow: "hidden"
};

const accordionHeader: React.CSSProperties = {
    padding: "12px 14px",
    fontWeight: 600,
    cursor: "pointer",
    background: "#1e3a8a",
    color: "#fff"
};

const accordionBody: React.CSSProperties = {
    padding: "10px 14px"
};

const linhaPermissao: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 120px 120px",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb"
};

const nomeSub: React.CSSProperties = {
    fontWeight: 500
};

const checkItem: React.CSSProperties = {
    display: "flex",
    gap: 6,
    alignItems: "center",
    fontSize: 14
};

const btnSalvarPadrao: React.CSSProperties = {
    marginTop: 20,
    backgroundColor: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600
};
