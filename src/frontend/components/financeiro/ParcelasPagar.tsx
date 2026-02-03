import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

interface Props {
  contaId: number;
  voltar: () => void

}

export default function ParcelasPagar({ contaId, voltar }: Props) {
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const caixaAtual = Number(localStorage.getItem("caixa_id"));
console.log("LIDO caixa_id:", caixaAtual);

  const [parcelaSelecionada, setParcelaSelecionada] = useState<any>(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [origemPagamento, setOrigemPagamento] = useState<
    'caixa' | 'banco' | 'cofre'>('caixa');

  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [contaSelecionada, setContaSelecionada] = useState<number | null>(null);
  const [contas, setContas] = useState<any[]>([]);

  async function carregar() {
    setLoading(true);
    const res = await window.ipcRenderer.invoke(
      "financeiro:listar-parcelas-pagar",
      contaId
    );
    setParcelas(res);
    setLoading(false);
  }
  const carregou = useRef(false);
  useEffect(() => {
    async function carregarContas() {
      const c = await window.ipcRenderer.invoke('financeiro:listar-contas')
      setContas(c)
    }
    carregarContas();
  }, [])
  useEffect(() => {
    if (carregou.current) return;
    carregou.current = true;

    carregar();
  }, []);


  console.log(
    "localStorage caixa_id:",
    localStorage.getItem("caixa_id")
  );

  async function pagarParcela(parcela: any) {
    const valor = valorPagamento

    if (!valor) return;

    const valorPago = Number(valor);
    if (valorPago <= 0) {
      toast.error("Valor inválido");
      return;
    }

    if (origemPagamento === 'banco' && !contaSelecionada) {
      toast.error("Selecione uma conta digital");
      return;
    }

    if (origemPagamento === 'caixa' && (!caixaAtual || isNaN(caixaAtual))) {
      toast.error("Nenhum caixa aberto");
      return;
    }


    console.log(
      `Origem ${origemPagamento}`,
      `Caixa ${caixaAtual}`,
      contaSelecionada,

    );

    await window.ipcRenderer.invoke("financeiro:pagar-parcela-pagar", {
      parcela_id: parcela.id,
      valor_pago: valorPago,
      forma_pagamento: formaPagamento,
      usuario_id: usuarioLogado.id,
      origemPagamento,

      caixa_id: origemPagamento === 'caixa'
        ? caixaAtual
        : null,

      conta_id: origemPagamento === 'banco'
        ? contaSelecionada
        : null
    });




    carregar();
  }


  const formasPagamento = [
    { id: 'dinheiro', label: 'Dinheiro' },
    { id: 'cartao', label: 'Cartão' },
    { id: 'pix', label: 'Pix' },
  ];
  const listaOrigem = [
    { id: 'caixa', label: 'Caixa' },
    { id: 'cofre', label: 'Cofre' },
    { id: 'banco', label: 'Banco' }
  ];
  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={voltar}
        style={btnVoltar}
      >
        ← Voltar
      </button>

      <h2 style={{ margin: "20px 0" }}>
        Parcelas a Pagar — Conta #{contaId}
      </h2>

      {loading && <p>Carregando...</p>}

      <table style={table}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>Parcela</th>
            <th style={th}>Vencimento</th>
            <th style={th}>Valor</th>
            <th style={th}>Pago</th>
            <th style={th}>Saldo</th>
            <th style={th}>Status</th>
            <th style={th}>Ação</th>
          </tr>
        </thead>

        <tbody>
          {parcelas.map((p) => {
            const saldo = Number(p.valor) - Number(p.valor_pago || 0);

            return (
              <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={td}>{p.numero_parcela}</td>
                <td style={td}>
                  {new Date(p.data_vencimento).toLocaleDateString()}
                </td>
                <td style={td}>R$ {Number(p.valor).toFixed(2)}</td>
                <td style={td}>R$ {Number(p.valor_pago || 0).toFixed(2)}</td>
                <td style={td}>R$ {saldo.toFixed(2)}</td>
                <td style={td}>{p.status}</td>
                <td style={td}>
                  {p.status !== "pago" && (
                    <button
                      style={btnPagar}
                      onClick={() => {
                        setParcelaSelecionada(p);
                        setValorPagamento("");
                      }}
                    >
                      Pagar
                    </button>

                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {parcelaSelecionada && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>Pagar parcela #{parcelaSelecionada.numero_parcela}</h3>

            <select style={input} onChange={(e) => setOrigemPagamento(e.target.value)} value={origemPagamento}>

              {listaOrigem.map((item, index) => (
                <option value={item.id}>{item.label}</option>
              ))}

            </select>
            <select style={input} onChange={(e) => setFormaPagamento(e.target.value)} value={formaPagamento}>

              {formasPagamento.map((item, index) => (
                <option value={item.id}>{item.label}</option>
              ))}

            </select>
            {origemPagamento === 'banco' && (

              <select
                style={input}
                value={contaSelecionada ?? ''}
                onChange={(e) =>
                  setContaSelecionada(e.target.value ? Number(e.target.value) : null)
                }
              >

                <option value="">Selecione a conta</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>


            )}

            <input
              type="number"
              placeholder="Valor a pagar"
              value={valorPagamento}
              onChange={(e) => setValorPagamento(e.target.value)}
              style={input}

            />

            <div style={{ marginTop: 10 }}>
              <button
                style={btnConfirmar}
                onClick={async () => {
                  const valorPago = Number(valorPagamento);
                  const saldo =
                    parcelaSelecionada.valor -
                    (parcelaSelecionada.valor_pago || 0);

                  if (valorPago <= 0 || valorPago > saldo) {
                    toast.error("Valor inválido");
                    return;
                  }


                  pagarParcela(parcelaSelecionada)
                  setParcelaSelecionada(null);
                  carregar();
                }}
              >
                Confirmar
              </button>

              <button
                style={btnCancelar}
                onClick={() => setParcelaSelecionada(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
const btnVoltar = {
  background: "#e5e7eb",
  color: "#1e3a8a",
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const btnPagar = {
  background: "#dc2626",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const theadRow = {
  backgroundColor: "#e5e7eb",
  color: "#1e3a8a",
};

const th = {
  padding: 10,
  textAlign: "center" as const,
};

const td = {
  padding: "10px",
  textAlign: "center" as const,
  fontSize: "14px",
};
const modalOverlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 300,

};

const input = {
  width: "100%",
  padding: 8,
  marginTop: 10,
  boxSizing: 'border-box',
  borderRadius: '8px',

};

const btnConfirmar = {
  backgroundColor: '#1e3a8a',
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  marginRight: 5,
  cursor: "pointer",
  color: '#fff',
};

const btnCancelar = {
  backgroundColor: '#6b7280',
  color: '#fff',
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
