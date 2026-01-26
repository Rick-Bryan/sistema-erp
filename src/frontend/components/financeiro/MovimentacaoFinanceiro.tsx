import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { boxTabela } from "../styles/styles";

interface Props {
  setPage: (page: string) => void;
}

export default function MovimentacaoFinanceiro({ setPage }: Props) {
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>({});

  async function carregar() {
    setLoading(true);
    const res = await window.ipcRenderer.invoke(
      "financeiro:listar-movimentacao"
    );
    setMovimentos(res);
    setLoading(false);
  }

  const carregarDashboard = async () => {
    const result = await window.ipcRenderer.invoke(
      "financeiro:dashboard-movimentacao"
    );
    setDashboard(result);
  };

  useEffect(() => {
    carregar();
    carregarDashboard();
  }, []);

  return (
    <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
      <button
        onClick={() => setPage("financeiro")}
        style={btnVoltar}
      >
        ← Voltar
      </button>

      <div style={header}>
        <h2 style={{ color: "#1e3a8a" }}>Movimentação Financeira</h2>
      </div>

      {/* DASHBOARD */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          margin: "20px",
        }}
      >
        <Card>
          <h3>Total Entradas</h3>
          <strong style={{ color: "green" }}>
            R$ {Number(dashboard.total_entradas || 0).toFixed(2)}
          </strong>
        </Card>

        <Card>
          <h3>Total Saídas</h3>
          <strong style={{ color: "red" }}>
            R$ {Number(dashboard.total_saidas || 0).toFixed(2)}
          </strong>
        </Card>

        <Card>
          <h3>Saldo</h3>
          <strong>
            R$ {Number(dashboard.saldo || 0).toFixed(2)}
          </strong>
        </Card>
      </div>

      {loading && <p>Carregando...</p>}

      <div style={boxTabela}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={theadRow}>
            <tr>
              <th style={th}>Data</th>
              <th style={th}>Origem</th>
              <th style={th}>Tipo</th>
              <th style={th}>Descrição</th>
              <th style={th}>Forma</th>
              <th style={th}>Valor</th>
            </tr>
          </thead>

          <tbody>
            {movimentos.map((m) => (
              <tr key={m.id}>
                <td style={td}>
                  {new Date(m.criado_em).toLocaleDateString()}
                </td>
                <td style={td}>{m.origem}</td>
                <td
                  style={{
                    ...td,
                    color: m.tipo === "entrada" ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
                  {m.tipo}
                </td>
                <td style={td}>{m.descricao}</td>
                <td style={td}>{m.forma_pagamento}</td>
                <td
                  style={{
                    ...td,
                    fontWeight: 600,
                  }}
                >
                  R$ {Number(m.valor).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const btnVoltar = {
  background: "#e5e7eb",
  color: "#1e3a8a",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: 600,
  marginBottom: "20px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const theadRow = {
  backgroundColor: "#e5e7eb",
  color: "#1e3a8a",
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
