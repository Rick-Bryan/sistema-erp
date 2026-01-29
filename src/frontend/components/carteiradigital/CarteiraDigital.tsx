import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { toastErro } from "../helpers/toastErro";
interface Props {
abrirAba: (page: string, titulo: string, params?: any) => void;}

export default function CarteiraDigital({ abrirAba }: Props) {
    const [saldos, setSaldos] = useState<any>({});
    const [contas, setContas] = useState<any[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [nomeCofre, setNomeCofre] = useState("");
    const [saldoInicial, setSaldoInicial] = useState("0");
    const [modalTransferir, setModalTransferir] = useState(false);
    const [origem, setOrigem] = useState("");
    const [destino, setDestino] = useState("");
    const [valorTransferencia, setValorTransferencia] = useState("");
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
    console.log(usuarioLogado)
    const [novaConta, setNovaConta] = useState({
        empresa_id: usuarioLogado.empresa_id,
        nome: "",
        tipo: "cofre" as "cofre" | "banco",
        saldo: 0,
        ativo: 1,
        banco_nome: '',
        banco_codigo: '',
        agencia: '',
        conta: '',
        tipo_conta: "corrente" as "corrente" | "poupanca" | 'pagamento',
    });
    async function criarConta() {
        try {
            await window.ipcRenderer.invoke(
                "financeiro:cadastrar-conta",
                novaConta
            );
            if (!novaConta.empresa_id) {
                toastErro("Empresa nao identificada")
                return
            }

            setModalAberto(false);
            setNovaConta({ nome: "", tipo: "cofre", saldo: 0 });

            const dados = await window.ipcRenderer.invoke(
                "financeiro:listar-contas"
            );
            setContas(dados);
        } catch (err: any) {

            toastErro(err);
        }

    }
    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const res = await window.ipcRenderer.invoke("carteira-digital");
        setSaldos(res.saldos);
        setContas(res.contas);
    }

    return (
        <div style={{ padding: 20 }}>
            <button onClick={() => abrirAba("movimentacao","Movimentacao")} style={btnVoltar}>
                ← Voltar
            </button>

            <h2>Carteira Digital</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                <Card>
                    <h3>Caixas</h3>
                    <strong>R$ {Number(saldos.caixa || 0).toFixed(2)}</strong>
                </Card>

                <Card>
                    <h3>Contas bancarias</h3>
                    <strong>R$ {Number(saldos.banco || 0).toFixed(2)}</strong>
                </Card>

                <Card>
                    <h3>Cofres</h3>
                    <strong>R$ {Number(saldos.cofre || 0).toFixed(2)}</strong>
                </Card>

                <Card>
                    <h3>Total</h3>
                    <strong>
                        R$ {Number((saldos.caixa || 0) + (saldos.banco || 0) + (saldos.cofre || 0)).toFixed(2)}
                    </strong>
                </Card>
            </div>

            {/* CONTAS */}
            <div style={{ marginTop: 30 }}>
                <h3>Contas</h3>
                <button
                    onClick={() => setModalAberto(true)}
                    style={buttonPrimary}
                >
                    + Nova conta
                </button>
                <button
                    onClick={() => setModalTransferir(true)}
                    style={btnTransferir}
                >
                    ⇄ Transferir
                </button>

                <table width="100%">
                    <thead style={theadRow}>
                        <tr>
                            <th style={th}>Nome</th>
                            <th style={th}>Tipo</th>
                            <th style={th}>Saldo</th>
                            <th style={th}>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {contas.map(c => (
                            <tr key={c.id}>
                                <td style={td}>{c.nome}</td>
                                <td style={td}>{c.tipo}</td>
                                <td style={td}>R$ {Number(c.saldo).toFixed(2)}</td>
                                <td style={td}>
                                    <button onClick={() => abrirAba(`carteira/extrato/${c.id}`, `Carteira Extrato ${c.id}`)}>
                                        Extrato
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalAberto && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999,

                    }}
                >


                    <div style={pageContainer}>
                        <h3
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                borderBottom: "1px solid #e5e7eb",
                                paddingBottom: 12,
                            }}
                        >
                            Nova conta financeira
                        </h3>

                        <div
                            style={formContainer}
                        >
                            <div style={{ marginBottom: 12 }}>
                                <label style={label}>Nome</label>
                                <input
                                    type="text"
                                    value={novaConta.nome}
                                    onChange={(e) =>
                                        setNovaConta({ ...novaConta, nome: e.target.value })
                                    }
                                    style={input} />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <label style={label}>Tipo</label>
                                <select
                                    value={novaConta.tipo}
                                    onChange={(e) =>
                                        setNovaConta({
                                            ...novaConta,
                                            tipo: e.target.value as any,
                                        })
                                    }
                                    style={input}
                                >
                                    <option value="cofre">Cofre</option>
                                    <option value="banco">Banco</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={label}>Saldo inicial</label>
                                <input
                                    type="text"
                                    value={novaConta.saldo}
                                    onChange={(e) =>
                                        setNovaConta({
                                            ...novaConta,
                                            saldo: e.target.value,
                                        })
                                    }
                                    style={input}
                                />
                            </div>
                            {novaConta.tipo === 'banco' && (

                                <>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={label}>Nome banco</label>
                                        <input
                                            value={novaConta.banco_nome}
                                            onChange={(e) =>
                                                setNovaConta({
                                                    ...novaConta,
                                                    banco_nome: e.target.value,
                                                })
                                            }
                                            style={input}
                                        />
                                    </div>


                                    <div style={{ marginBottom: 20 }}>
                                        <label style={label}>Código</label>
                                        <input
                                            type="text"
                                            value={novaConta.banco_codigo}
                                            onChange={(e) =>
                                                setNovaConta({
                                                    ...novaConta,
                                                    banco_codigo: e.target.value,
                                                })
                                            }
                                            style={input}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={label}>Agencia</label>
                                        <input
                                            type="text"
                                            value={novaConta.agencia}
                                            onChange={(e) =>
                                                setNovaConta({
                                                    ...novaConta,
                                                    agencia: e.target.value,
                                                })
                                            }
                                            style={input}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={label}>Conta</label>
                                        <input
                                            type="text"
                                            value={novaConta.conta}
                                            onChange={(e) =>
                                                setNovaConta({
                                                    ...novaConta,
                                                    conta: e.target.value,
                                                })
                                            }
                                            style={input}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={label}>Tipo de conta</label>
                                        <select
                                            value={novaConta.tipo_conta}
                                            onChange={(e) =>
                                                setNovaConta({
                                                    ...novaConta,
                                                    tipo_conta: e.target.value as any,
                                                })
                                            }
                                            style={input}
                                        >
                                            <option value="corrente">Corrente</option>
                                            <option value="poupanca">Poupanca</option>
                                            <option value="pagamento">Pagamento</option>
                                        </select>
                                    </div>
                                </>
                            )}


                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                            }}
                        >
                            <button
                                onClick={() => setModalAberto(false)}
                                style={buttonSecondary}
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={criarConta}
                                style={buttonPrimary}
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {modalTransferir && (
                <div style={overlay}>
                    <div style={modal}>
                        <h3>Transferir</h3>

                        <select value={origem} onChange={e => setOrigem(e.target.value)} style={input}>
                            <option value="">Conta origem</option>
                            {contas.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nome} ({c.tipo})
                                </option>
                            ))}
                        </select>

                        <select value={destino} onChange={e => setDestino(e.target.value)} style={input}>
                            <option value="">Conta destino</option>
                            {contas.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nome} ({c.tipo})
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Valor"
                            value={valorTransferencia}
                            onChange={e => setValorTransferencia(e.target.value)}
                            style={input}
                        />

                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button onClick={() => setModalTransferir(false)} style={btnCancelar}>
                                Cancelar
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        await window.ipcRenderer.invoke("carteira-transferir", {
                                            origem,
                                            destino,
                                            valor: Number(valorTransferencia)
                                        });
                                        setModalTransferir(false);
                                        setOrigem("");
                                        setDestino("");
                                        setValorTransferencia("");
                                        carregar();
                                    }
                                    catch (err) {
                                        toastErro(err)
                                    }



                                }}
                                style={btnSalvar}
                            >
                                Transferir
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
const btnTransferir = {
    background: "#2563eb",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600
};


const overlay = {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const modal = {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    width: 300
};

const input = {
    width: "100%",
    padding: 8,
    marginTop: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
    boxSizing: 'border-box'
};

const btnCancelar = {
    background: "#e5e7eb",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer"
};

const btnSalvar = {
    background: "#2563eb",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600
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


const theadRow = {
    backgroundColor: "#e5e7eb",
    color: "#7c2d12",
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

const pageContainer: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "1100px",
    maxHeight: "90vh",
    overflowY: "auto",

    padding: "28px 32px",

    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
};

const formContainer: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px 24px",
    marginTop: 20,
};


const label: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
    color: "#374151",
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

const buttonSecondary: React.CSSProperties = {
    ...buttonBase,
    backgroundColor: '#6b7280',
    color: '#fff',
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
