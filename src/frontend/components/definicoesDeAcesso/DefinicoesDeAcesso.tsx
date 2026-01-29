import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { setPermissoes as setPermissoesGlobais, verifyPerm } from '../../components/helpers/verifyPerm';
import { toastErro } from "../helpers/toastErro";


interface DefinicoesProps {

    abrirAba: (page: string, titulo: string, params?: any) => void;
    voltar: () => void
}

export default function DefinicoesDeAcesso({ abrirAba, voltar }: DefinicoesProps) {
    const [modulos, setModulos] = useState<any[]>([]);
    const [permissoes, setPermissoes] = useState<any>({});
    const [lojas, setLojas] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [lojaId, setLojaId] = useState("");
    const [cargoId, setCargoId] = useState("");
    const [usuarioId, setUsuarioId] = useState("");
    const user = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
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

    const salvar = async () => {
        try {
            if (!usuarioId || !lojaId) {
                toast.error("Selecione loja, cargo e usuário");
                return;
            }
            // 🛡 proteção contra auto-bloqueio
            const idLogado = user?.id;
            const submoduloDefAcesso = modulos
                .flatMap(m => m.submodulos)
                .find(s => s.slug === "definicoes-acesso");

            if (Number(usuarioId) === idLogado && submoduloDefAcesso) {
                const perm = permissoes[submoduloDefAcesso.id];

                if (!perm?.consultar) {
                    toast.error("Você não pode remover seu próprio acesso às Definições de Acesso.");
                    return;
                }
            }
            const payload: any[] = [];

            modulos.forEach(m => {
                m.submodulos.forEach((s: any) => {
                    const p = permissoes[s.id];
                    if (!p) return;

                    payload.push({
                        modulo_id: m.id,
                        submodulo_id: s.id,
                        pode_consultar: p.consultar ? 1 : 0,
                        pode_usar: p.usar ? 1 : 0,
                    });
                });
            });

            await window.ipcRenderer.invoke("permissoes:salvar", {
                empresa_id: 1, // depois você pode pegar do usuário logado
                loja_id: Number(lojaId),
                usuario_id: Number(usuarioId),
                permissoes: payload
            });
            // 🔄 recarrega permissões do usuário logado
            const novas = await window.ipcRenderer.invoke("permissoes:listar", Number(usuarioId));

            // atualiza tela
            const map = {};
            novas.forEach(p => {
                map[p.submodulo_id] = {
                    consultar: !!p.pode_consultar,
                    usar: !!p.pode_usar,
                };
            });

            console.log("NOVAS PERMS:", novas);
            console.log("verify:", verifyPerm("compras", "consultar"));

            // ✅ atualiza cache global usado pelo sistema
            // ✅ mantém os checkboxes
            setPermissoes(map);     // estado da tela
            setPermissoesGlobais(novas);    // 🔥 cache global do app





            toast.success("Permissões salvas!");
        } catch (err) {
            toastErro(err)
        }

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
            <h2 style={titulo}>Definições de Acesso</h2>
            
            <div style={card}>
                {/* filtros */}
                <div style={gridFiltros}>
                    <select style={input} value={lojaId} onChange={e => setLojaId(e.target.value)}>
                        <option value="">Selecione a loja...</option>
                        {lojas.map(l => (
                            <option key={l.id} value={l.id}>{l.nome}</option>
                        ))}
                    </select>

                    <select style={input} value={cargoId} onChange={e => setCargoId(e.target.value)} disabled={!lojaId}>
                        <option value="">Selecione o cargo...</option>
                        {cargos.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>

                    <select style={input} value={usuarioId} onChange={e => setUsuarioId(e.target.value)} disabled={!cargoId}>
                        <option value="">Selecione o usuario...</option>
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
                                {m.submodulos.map(s => {
                                    const bloqueado =
                                        Number(usuarioId) === user?.id && s.slug === "definicoes-acesso";

                                    return (
                                        <div key={s.id} style={linhaPermissao}>
                                            <span style={nomeSub}>{s.nome}</span>

                                            <label style={checkItem}>
                                                <input
                                                    type="checkbox"
                                                    disabled={bloqueado} // 🔒 não permite alterar
                                                    checked={bloqueado ? true : !!permissoes[s.id]?.consultar} // ✅ sempre marcado
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
                                                    disabled={bloqueado} // 🔒 não permite alterar
                                                    checked={bloqueado ? true : !!permissoes[s.id]?.usar} // ✅ sempre marcado
                                                    onChange={() =>
                                                        setPermissoes(p => ({
                                                            ...p,
                                                            [s.id]: { ...p[s.id], usar: !p[s.id]?.usar }
                                                        }))
                                                    }
                                                />
                                                Usar
                                            </label>


                                            {bloqueado && (
                                                <small style={{ color: "#999", marginLeft: 8 }}>
                                                    🔒 Obrigatório para administradores
                                                </small>
                                            )}
                                        </div>
                                    );
                                })}
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

const input: React.CSSProperties = { padding: 8, borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 10, width: '100%' };

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
    float: 'right',
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
