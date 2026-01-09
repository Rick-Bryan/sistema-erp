import { useEffect, useState, useRef } from "react";

interface Props {
  contaId: number;
  setPage: (page: string) => void;
}

export default function ParcelasPagar({ contaId, setPage }: Props) {
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (carregou.current) return;
    carregou.current = true;

    carregar();
  }, []);

  console.log(parcelas.map(p => p.id));


  async function pagarParcela(parcela: any) {
    const valor = prompt(
      `Valor a pagar (máx R$ ${Number(parcela.valor - parcela.valor_pago).toFixed(2)})`
    );

    if (!valor) return;

    const valorPago = Number(valor);
    if (valorPago <= 0) {
      alert("Valor inválido");
      return;
    }

    await window.ipcRenderer.invoke("financeiro:pagar-parcela", {
      parcela_id: parcela.id,
      valor_pago: valorPago,
      forma_pagamento: "dinheiro", // depois você pode abrir select
      usuario_id: 1,               // pegar do contexto/login
      caixa_id: 1                  // pegar do caixa aberto
    });

    carregar();
  }

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => setPage("financeiro/pagar")}
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
                      onClick={() => pagarParcela(p)}
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
