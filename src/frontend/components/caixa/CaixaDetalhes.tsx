// src/renderer/components/CaixaDetalhes.tsx
import React, { useEffect, useState } from "react";
import { Button, Card, CardContent } from "@mui/material";
import toast from "react-hot-toast";

interface CaixaDetalhesProps {
  caixa: number;             // ID do caixa selecionado
  voltar: () => void;        // Função para voltar para a lista
}

export default function CaixaDetalhes({ caixa, voltar }: CaixaDetalhesProps) {
  const [dados, setDados] = useState<any>(null);
  const [resumo, setResumo] = useState<any>(null);
  const [movimentos, setMovimentos] = useState<any[]>([]);

  // Carregar sessão específica
  async function carregarSessao() {
    const lista = await window.electronAPI.getSessoesCaixa();
    const selecionada = lista.find((s: any) => s.id === caixa);
    setDados(selecionada || null);
  }
  console.log("CaixaDetalhes recebeu ID:", caixa);
  // Carregar resumo do caixa
  async function carregarResumo() {
    const r = await window.electronAPI.resumoCaixa(caixa);
    setResumo(r);
  }

  // Carregar movimentos
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

      <Card>
        <CardContent>
          <h2>Caixa #{dados.id}</h2>

          <div style={{ marginTop: 10 }}><strong>Colaborador:</strong> {dados.usuario_id}</div>
          <div><strong>Abertura:</strong> {new Date(dados.aberto_em).toLocaleString("pt-BR")}</div>
          <div><strong>Valor de abertura:</strong> R$ {Number(dados.valor_abertura).toFixed(2)}</div>

          <div>
            <strong>Fechamento:</strong>{" "}
            {dados.fechado_em && dados.fechado_em !== "0000-00-00 00:00:00"
              ? new Date(dados.fechado_em).toLocaleString("pt-BR")
              : "Ainda aberto"}
          </div>

          <div><strong>Status:</strong> {dados.status}</div>

          <hr style={{ margin: "20px 0" }} />

          <h3>Resumo</h3>
          {resumo ? (
            <>
              <div><strong>Total Entradas:</strong> R$ {resumo.total_entradas.toFixed(2)}</div>
              <div><strong>Total Saídas:</strong> R$ {resumo.total_saidas.toFixed(2)}</div>
              <div><strong>Saldo Esperado:</strong> R$ {resumo.saldo_esperado.toFixed(2)}</div>
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

          {/* Botão de fechar caixa */}
          {dados.status === "aberto" && (
            <Button
              variant="contained"
              color="error"
              style={{ marginTop: 20 }}
              onClick={async () => {
                const r = await window.electronAPI.fecharCaixa({ caixa_id: dados.id });
                toast.success("Caixa fechado com sucesso!");
                voltar(); // volta para a lista
              }}
            >
              Fechar Caixa
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
