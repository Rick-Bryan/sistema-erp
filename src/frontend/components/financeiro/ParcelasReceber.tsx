import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Card } from "../ui/card";

interface Props {
  contaId: number;
  setPage: (page: string) => void;
}

export default function ParcelasReceber({ contaId, setPage }: Props) {
  const [parcelas, setParcelas] = useState<any[]>([]);

  useEffect(() => {
    window.ipcRenderer
      .invoke("financeiro:listar-parcelas-receber", contaId)
      .then(setParcelas);
  }, [contaId]);

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => setPage("financeiro/receber")}>
        ← Voltar
      </button>

      <h2>Parcelas</h2>

      {parcelas.map((p) => (
        <Card key={p.id} style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p>Parcela {p.numero_parcela}</p>
              <p>Vencimento: {p.data_vencimento}</p>
              <p>Status: {p.status}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong>R$ {Number(p.valor).toFixed(2)}</strong>

              {p.status === "aberto" && (
                <Button
                  color="success"
                  onClick={() =>
                    window.ipcRenderer.invoke(
                      "financeiro:baixar-parcela-receber",
                      p.id
                    )
                  }
                >
                  Baixar
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
