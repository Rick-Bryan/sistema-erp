import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Card } from "../ui/card";
interface Props {
    setPage: (page: string) => void;
}
export default function ContasReceber({ setPage }: Props) {
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    const res = await window.ipcRenderer.invoke(
      "financeiro:listar-contas-receber",
    );
    setContas(res);
    setLoading(false);
  }
  console.log(contas)
  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ padding: 24 }}>
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
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>
        Contas a Receber
      </h1>

      {loading && <p>Carregando...</p>}

      {contas.map((c) => (
        <Card key={c.id} style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{c.cliente_nome}</strong>
              <p>Venda #{c.venda_id}</p>
              <p>Status: {c.status}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p>
                <strong>R$ {Number(c.valor_total).toFixed(2)}</strong>
              </p>

              <Button
                
                onClick={() =>
                  
                  setPage(`financeiro/receber/parcelas/${c.id}`)
                }
              >
                Parcelas
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
