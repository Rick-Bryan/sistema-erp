// src/renderer/components/CaixaDetalhes.tsx
import React, { useEffect, useState } from "react";
import { Button, Card, CardContent } from "@mui/material";
import toast from "react-hot-toast";

interface CaixaDetalhesProps {
  caixa: number;
  voltar: () => void;
}

export default function CaixaDetalhes({ caixa, voltar }: CaixaDetalhesProps) {
  const [dados, setDados] = useState<any>(null);
  const [resumo, setResumo] = useState<any>(null);
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [colaborador, setColaborador] = useState<any>(null);
  // ESTADOS DO FECHAMENTO
  const [valorContado, setValorContado] = useState<string>("");
  const [motivoDiferenca, setMotivoDiferenca] = useState("");

  async function carregarSessao() {
    const lista = await window.electronAPI.getSessoesCaixa();
    const selecionada = lista.find((s: any) => s.id === caixa);
    setDados(selecionada || null);
  }


  async function carregarColaborador() {
    if (!dados?.usuario_id) return;
    const c = await window.electronAPI.getColaboradorById(dados.usuario_id);
    setColaborador(c);
  }

  useEffect(() => {
    carregarColaborador();
  }, [dados]);

  async function carregarResumo() {
    const r = await window.electronAPI.resumoCaixa(caixa);
    setResumo(r);
  }

  async function carregarMovimentos() {
    const m = await window.electronAPI.resumoMovimentosCaixa(caixa);
    setMovimentos(m || []);
  }

  useEffect(() => {
    carregarSessao();
    carregarResumo();
    carregarMovimentos();
  }, [caixa]);

  if (!dados) {
    return <div style={{ padding: 20 }}>Carregando detalhes...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={voltar}
        style={{
          backgroundColor: "#e5e7eb",
          color: "#1e3a8a",
          border: "none",
          borderRadius: "6px",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: "20px",
        }}
      >
        ← Voltar
      </button>

      <Card>
        <CardContent>
          <h2>Caixa #{dados.id}</h2>

          <div style={{ marginTop: 10 }}>
            <strong>Colaborador:</strong>{" "}
            {colaborador ? (
              <>
                {colaborador.nome} — <span style={{ color: "#1e3a8a" }}>Setor: {colaborador.setor}</span>
                <br />
              </>
            ) : (
              "Carregando..."
            )}

          </div>

          <div>
            <strong>Abertura:</strong>{" "}
            {new Date(dados.criado_em).toLocaleString("pt-BR")}
          </div>

          <div>
            <strong>Valor de abertura:</strong> R$ {Number(dados.valor_abertura).toFixed(2)}
          </div>

          <div>
            <strong>Fechamento:</strong>{" "}
            {dados.fechado_em && dados.fechado_em !== "0000-00-00 00:00:00"
              ? new Date(dados.fechado_em).toLocaleString("pt-BR")
              : "Ainda aberto"}
          </div>

          <div>
            <strong>Status:</strong> {dados.status}
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h3>Resumo</h3>
          {resumo ? (
            <>
              <div><strong>Total Entradas:</strong> R$ {resumo.total_entradas.toFixed(2)}</div>
              <div><strong>Total Saídas:</strong> R$ {resumo.total_saidas.toFixed(2)}</div>
              <div><strong>Total Esperado:</strong> R$ {resumo.saldo_esperado.toFixed(2)}</div>
            </>
          ) : (
            <div>Carregando resumo...</div>
          )}

          <hr style={{ margin: "20px 0" }} />

          <h3>Movimentos</h3>
          {movimentos.length === 0 ? (
            <div>Nenhum movimento registrado.</div>
          ) : (
            <ul>
              {movimentos.map((m: any) => (
                <li key={m.id}>
                  <strong>[{m.tipo}]</strong> {m.descricao || m.forma_pagamento || ""}
                  {" — "}
                  R$ {Number(m.valor).toFixed(2)}
                  {" — "}
                  {m.criado_em ? new Date(m.criado_em).toLocaleString("pt-BR") : "—"}
                </li>
              ))}
            </ul>
          )}

          {/* 🔻 FECHAMENTO DE CAIXA 🔻 */}
          {dados.status === "aberto" && resumo && (
            <div style={{ marginTop: 30, padding: 20, background: "#f9fafb", borderRadius: 8, maxWidth: '700px' }}>
              <h3 style={{ marginBottom: 10 }}>Fechamento de Caixa</h3>

              {/* VALOR CONTADO */}
              <label style={{ fontWeight: 600 }}>Valor contado em caixa:</label>
              <input
                type="number"
                step="0.01"
                placeholder={`Esperado: R$ ${resumo.saldo_esperado.toFixed(2)}`}
                value={valorContado}
                onChange={(e) => setValorContado(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 5,
                  marginBottom: 15,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />

              {/* MOTIVO DA DIFERENÇA */}
              <label style={{ fontWeight: 600 }}>Motivo da diferença (opcional):</label>
              <textarea
                placeholder="Ex: faltou troco, erro no pagamento, etc"
                value={motivoDiferenca}
                onChange={(e) => setMotivoDiferenca(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 5,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  minHeight: 60,
                }}
              />

              <Button
                variant="contained"
                color="error"
                style={{ marginTop: 20, width: "100%" }}
                onClick={async () => {
                  if (!valorContado) {
                    toast.error("Informe o valor contado!");
                    return;
                  }

                  const r = await window.electronAPI.fecharCaixa({
                    caixa_id: dados.id,
                    valor_fechamento_usuario: Number(valorContado),
                    motivo_diferenca: motivoDiferenca || null,
                  });

                  toast.success("Caixa fechado com sucesso!");
                  voltar();
                }}
              >
                Fechar Caixa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
