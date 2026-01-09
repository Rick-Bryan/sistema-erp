import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
interface Props {
  setPage: (page: string) => void;
}
export default function ContasReceber({ setPage }: Props) {
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any[]>([]);
  async function carregar() {
    setLoading(true);
    const res = await window.ipcRenderer.invoke(
      "financeiro:listar-contas-receber",
    );
    setContas(res);
    setLoading(false);
  }
  useEffect(() => {
    carregar();
    carregarDashboard();
  }, []);
  const carregarDashboard = async () => {
    const result = await window.ipcRenderer.invoke("financeiro:dashboard");
    setDashboard(result);
  }



  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
      <button
        onClick={() => setPage('financeiro')}
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
      <div style={header}>
        <h2 style={{ color: '#1e3a8a' }}>Contas a receber</h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          margin:'20px',
        }}
      >
        <Card>
          <h3>Total a Receber</h3>
          <strong>
            R$ {Number(dashboard.total_receber).toFixed(2)}
          </strong>
        </Card>

        <Card>
          <h3>Em Atraso</h3>
          <strong style={{ color: "red" }}>
            R$ {Number(dashboard.total_atraso).toFixed(2)}
          </strong>
        </Card>
      </div>

      {loading && <p>Carregando...</p>}
      <div style={card}>


        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={theadRow}>
            <tr>
              <th style={th}>Cliente</th>
              <th style={th}>Venda</th>
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
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={td}>{c.cliente_nome}</td>
                  <td style={td}>#{c.venda_id}</td>
                  <td style={td}>R$ {total.toFixed(2)}</td>
                  <td style={td}>R$ {pago.toFixed(2)}</td>
                  <td style={td}>R$ {saldo.toFixed(2)}</td>
                  <td style={td}>{c.status}</td>
                  <td style={td}>
                    <button
                      style={btnVoltar}
                      onClick={() =>
                        setPage(`financeiro/receber/parcelas/${c.id}`)
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
const btnVoltar = { background: '#e5e7eb', color: '#1e3a8a', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 };
const btnNovo = { background: '#1e3a8a', color: '#fff', padding: '10px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 };
const card = { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 };
const theadRow = { backgroundColor: '#e5e7eb', color: '#1e3a8a' };
const th: React.CSSProperties = { padding: 10, fontWeight: 600, textAlign: 'center' };
const td = { padding: '12px 8px', borderBottom: '1px solid #e5e7eb', fontSize: '14px', textAlign: 'center', color: '#374151' };

const cardsDashboard: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "24px",
};

const cardDashboard: React.CSSProperties = {
 
  width: "300px",
  
  padding: "16px",
};
