import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Modal } from "../ui/Modal";
import { boxTabela } from '../styles/styles'
interface Props {
  contaId: number;

  voltar: () => void
}

export default function ParcelasReceber({ contaId, voltar }: Props) {
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [parcelaSelecionada, setParcelaSelecionada] = useState<any>(null);
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");



  function formatarData(data: any) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  if (!usuario?.id) {
    alert("Usuário não identificado");
    return;
  }

  useEffect(() => {
    window.ipcRenderer
      .invoke("financeiro:listar-parcelas-receber", contaId)
      .then(setParcelas);
  }, [contaId]);
  console.log(parcelas)
  return (
    <div style={{ padding: 24 }}>
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
        }}>



        ← Voltar
      </button>

      <h2>Parcelas</h2>

      {parcelas.map((p) => (
        <div key={p.id} style={boxTabela}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p>ID {p.id}</p>
              <p>Parcela {p.numero_parcela}</p>
              <p>Vencimento: {formatarData(p.data_vencimento)}</p>
              <p>Status: {p.status}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong>
                R$ {(Number(p.valor) - Number(p.valor_pago)).toFixed(2)}
              </strong>


              {(p.status === "aberto" || p.status === "parcial") && (

                <Button
                  color="success"
                  onClick={() => {
                    setParcelaSelecionada(p);
                    setValorPago(String(p.valor - p.valor_pago));
                  }}
                >
                  Baixar
                </Button>

              )}
            </div>
          </div>
        </div>
      ))}

      {parcelaSelecionada && (
        <Modal>
          <h3>Baixar Parcela</h3>

          <input
            style={inputModal}
            type="number"
            max={parcelaSelecionada.valor - parcelaSelecionada.valor_pago}
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
          />


          <select
            style={inputStyle}
            value={formaPagamento ?? ""}
            onChange={(e) => setFormaPagamento(e.target.value)}
          >
            <option value="">Forma de pagamento</option>
            <option value={1}>Dinheiro</option>
            <option value={2}>PIX</option>
            <option value={3}>Cartão</option>
            <option value={4}>Boleto</option>
          </select>

          <button
            style={btnAzul}
            disabled={!valorPago || !formaPagamento}
            onClick={async () => {
              await window.ipcRenderer.invoke("financeiro:baixar-parcela", {
                parcela_id: parcelaSelecionada.id,
                valor_pago: Number(valorPago),
                forma_pagamento: formaPagamento,
                usuario_id: usuario.id,
                caixa_id: caixaId
              });

              // Recarrega parcelas
              const atualizadas = await window.ipcRenderer.invoke(
                "financeiro:listar-parcelas-receber",
                contaId
              );
              setParcelas(atualizadas);

              // Fecha modal
              setParcelaSelecionada(null);
              setValorPago("");
              setFormaPagamento(null);
            }}
          >
            Confirmar
          </button>


          <button style={btnFechar} onClick={() => setParcelaSelecionada(null)}>
            Cancelar
          </button>
        </Modal>
      )}

    </div>
  );
}

const btnAzul: React.CSSProperties = {
  backgroundColor: '#1e3a8a',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
};



const inputModal: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const btnSalvar: React.CSSProperties = {
  ...btnAzul,
  width: '100%',
  marginBottom: '15px'
};

const btnFechar: React.CSSProperties = {
  backgroundColor: '#b91c1c',
  color: 'white',
  padding: '8px 14px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',

};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  marginBottom: '10px',
  outline: 'none',
  transition: '0.2s border-color',
  fontSize: '15px',
  boxSizing: 'border-box',
};
/* -------- MELHOR ESTILO DAS TABELAS DO MODAL -------- */



