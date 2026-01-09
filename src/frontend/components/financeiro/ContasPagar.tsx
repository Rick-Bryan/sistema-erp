import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";

interface Props {
  setPage: (page: string) => void;
}

export default function ContasPagar({ setPage }: Props) {
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>({});

  async function carregar() {
    setLoading(true);
    const res = await window.ipcRenderer.invoke(
      "financeiro:listar-contas-pagar"
    );
    setContas(res);
    setLoading(false);
  }

  const carregarDashboard = async () => {
    const result = await window.ipcRenderer.invoke("financeiro:dashboard-pagar");
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
        <h2 style={{ color: "#7c2d12" }}>Contas a pagar</h2>
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
          <h3>Total a Pagar</h3>
          <strong>
            R$ {Number(dashboard.total_pagar || 0).toFixed(2)}
          </strong>
        </Card>

        <Card>
          <h3>Em Atraso</h3>
          <strong style={{ color: "red" }}>
            R$ {Number(dashboard.total_atraso || 0).toFixed(2)}
          </strong>
        </Card>
      </div>

      {loading && <p>Carregando...</p>}

      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={theadRow}>
            <tr>
              <th style={th}>Fornecedor</th>
              <th style={th}>Compra</th>
              <th style={th}>Total</th>
              <th style={th}>Pago</th>
              <th style={th}>Restante</th>
              <th style={th}>Status</th>
              <th style={th}>Parcelas</th>
            </tr>
          </thead>

          <tbody>
            {contas.map((c) => {
              const pago = Number(c.valor_pago || 0);
              const total = Number(c.valor_total);
              const saldo = total - pago;

              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={td}>{c.fornecedor_nome}</td>
                  <td style={td}>#{c.compra_id}</td>
                  <td style={td}>R$ {total.toFixed(2)}</td>
                  <td style={td}>R$ {pago.toFixed(2)}</td>
                  <td style={td}>R$ {saldo.toFixed(2)}</td>
                  <td style={td}>{c.status}</td>
                  <td style={td}>
                    <button
                      style={btnParcelas}
                      onClick={() =>
                    
                        setPage(`financeiro/pagar/parcelas/${c.id}`)

                      }
                    >
                      Parcelas
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== estilos (iguais ao receber) ===== */

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

const btnParcelas = {
  background: "#e5e7eb",
  color: "#7c2d12",
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const card = {
  background: "#fff",
  borderRadius: 8,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
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
