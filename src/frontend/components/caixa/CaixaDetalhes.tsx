// src/renderer/components/CaixaDetalhes.tsx
import React, { useEffect, useState } from "react";
import { Button, Card, CardContent ,Dialog,DialogTitle,DialogContent,TextField,DialogActions} from "@mui/material";
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
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  // ESTADOS DO FECHAMENTO
  const [valorContado, setValorContado] = useState<string>("");
  const [motivoDiferenca, setMotivoDiferenca] = useState("");
  const [modalSangriaAberto, setModalSangriaAberto] = useState(false);
  function abrirModalSangria() {
    setModalSangriaAberto(true);
  }
  function fecharModalSangria() {
    setModalSangriaAberto(false);
  }

  async function carregarSessao() {
    const lista = await window.electronAPI.getSessoesCaixa();
    const selecionada = lista.find((s: any) => s.id === caixa);
    setDados(selecionada || null);
  }
  const [valorSangria, setValorSangria] = useState("");
  const [motivoSangria, setMotivoSangria] = useState("");

  async function salvarSangria() {
    if (!valorSangria) return toast.error("Informe o valor!");

    await window.electronAPI.addMovimentosCaixa({
      usuario_id: dados.usuario_id,  
      caixa_id: dados.id,
      tipo: "saida",
      valor: Number(valorSangria),
      descricao: motivoSangria || "Sangria"
    });

    toast.success("Sangria registrada!");
    carregarMovimentos();
    carregarResumo();
  }
  
  console.log("DADOS ", dados)

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
            <strong>Data Fechamento:</strong>{" "}
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
          {dados.status === "aberto" && (
            <Button
              variant="outlined"
              style={{ marginTop: 20 }}
              onClick={() => abrirModalSangria()}
            >
              Registrar Sangria
            </Button>
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

              {/* DIFERENÇA AUTOMÁTICA */}
              {valorContado && (
                <div style={{ marginBottom: 15, fontSize: "16px" }}>
                  <strong>Diferença: </strong>
                  {(
                    Number(valorContado || 0) - Number(resumo.saldo_esperado || 0)
                  ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}

                  <span style={{ marginLeft: 10, color: "#1e3a8a" }}>
                    {Number(valorContado) > resumo.saldo_esperado ? "(sobrando)" :
                      Number(valorContado) < resumo.saldo_esperado ? "(faltando)" :
                        "(sem diferença)"}
                  </span>
                </div>
              )}


              {/* MOTIVO DA DIFERENÇA (somente se houver diferença) */}
              {valorContado && Number(valorContado) !== resumo.saldo_esperado && (
                <>
                  <label style={{ fontWeight: 600 }}>Motivo da diferença:</label>
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
                </>
              )}



              <Button
                variant="contained"
                color="error"
                style={{ marginTop: 20, width: "100%" }}
                onClick={async () => {
                  if (!valorContado) {
                    toast.error("Informe o valor contado!");
                    return;
                  }

                  const temDiferenca =
                    Number(valorContado) !== Number(resumo.saldo_esperado);

                  if (temDiferenca && !motivoDiferenca) {
                    toast.error("Explique o motivo da diferença!");
                    return;
                  }

                  await window.electronAPI.fecharCaixa({
                    caixa_id: dados.id,
                    valor_fechamento_informado: Number(valorContado),
                    motivo_diferenca: motivoDiferenca || null,
                    empresa_id : usuarioLogado.empresa_id
                  });

                  toast.success("Caixa fechado com sucesso!");
                  voltar();
                }}
              >
                Fechar Caixa
              </Button>
            </div>
          )}
          {/* 🔻 DETALHES DA DIFERENÇA (caso exista) 🔻 */}
          {dados.status === "fechado" && (
            <div style={{ marginTop: 25, padding: 20, background: "#fff7ed", borderRadius: 8 }}>
              <h3 style={{ marginBottom: 10 }}>Fechamento do Caixa</h3>

              <div><strong>Valor esperado:</strong> R$ {Number(resumo?.saldo_esperado || 0).toFixed(2)}</div>
              <div><strong>Valor informado:</strong> R$ {Number(dados.valor_fechamento_informado || 0).toFixed(2)}</div>
              <div>
                <strong>Diferença:</strong>{" "}
                <span style={{ color: Number(dados.diferenca) === 0 ? "green" : "red" }}>
                  R$ {Number(dados.diferenca || 0).toFixed(2)}
                </span>
              </div>

              {dados.diferenca !== 0 && (
                <div style={{ marginTop: 10 }}>
                  <strong>Motivo declarado:</strong>
                  <p style={{ background: "#fff", padding: 10, borderRadius: 6 }}>
                    {dados.motivo_diferenca || "Nenhum motivo informado"}
                  </p>
                </div>
              )}
            </div>
          )}


        </CardContent>
      </Card>
      <Dialog open={modalSangriaAberto} onClose={fecharModalSangria} fullWidth>
        <DialogTitle>Registrar Sangria</DialogTitle>

        <DialogContent>
          <TextField
            label="Valor da sangria"
            fullWidth
            type="number"
            margin="dense"
            value={valorSangria}
            onChange={(e) => setValorSangria(e.target.value)}
          />

          <TextField
            label="Motivo"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={motivoSangria}
            onChange={(e) => setMotivoSangria(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharModalSangria}>Cancelar</Button>
          <Button variant="contained" onClick={salvarSangria}>
            Confirmar Sangria
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
