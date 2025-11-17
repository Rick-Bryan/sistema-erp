// src/renderer/components/CaixaDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@mui/material';

type Sessao = any;
interface CaixaDashboardProps {
  setPage: (page: string) => void;

}
export default function CaixaDashboard({ setPage }: CaixaDashboardProps) {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [selecionada, setSelecionada] = useState<Sessao | null>(null);
  const [resumo, setResumo] = useState<any>(null);
  const [movimentos, setMovimentos] = useState<any[]>([]);

  async function carregarSessoes() {
    const list = await (window as any).electronAPI.getSessoesCaixa();
    setSessoes(list || []);
  }

  async function carregarResumo(id: number) {
    const r = await (window as any).electronAPI.resumoCaixa(id);
    setResumo(r || null);
  }

  async function carregarMovimentos(id: number) {
    const m = await (window as any).electronAPI.getMovimentosCaixa(id);
    setMovimentos(m || []);
  }

  useEffect(() => { carregarSessoes(); }, []);

  async function selecionar(sess: Sessao) {
    setSelecionada(sess);
    await carregarResumo(sess.id);
    await carregarMovimentos(sess.id);
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Caixas</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 300 }}>
          <h3>Lista</h3>
          <ul>
            {sessoes.map(s => (
              <li key={s.id}>
                <Button onClick={() => selecionar(s)}>{s.id} - {s.usuario_id} - {s.status}</Button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          {selecionada ? (
            <Card>
              <CardContent>
                <h3>Resumo Caixa #{selecionada.id}</h3>
                <div><strong>Aberto em:</strong> {selecionada.aberto_em ? new Date(selecionada.aberto_em).toLocaleString() : '—'}</div>
                <div><strong>Saldo esperado:</strong> {resumo ? resumo.saldo_esperado.toFixed(2) : '...'}</div>
                <div style={{ marginTop: 12 }}>
                  <h4>Movimentos</h4>
                  <ul>
                    {movimentos.map(m => (
                      <li key={m.id}>
                        [{m.tipo}] {m.descricao || m.forma_pagamento || ''} — {Number(m.valor).toFixed(2)} — {m.criado_em ? new Date(m.criado_em).toLocaleString() : '—'}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Button variant="contained" onClick={async () => {
                    // exemplo simples de fechamento
                    const resp = await (window as any).electronAPI.fecharCaixa({ caixa_id: selecionada.id });
                    alert('Fechado: ' + JSON.stringify(resp));
                    carregarSessoes();
                    setSelecionada(null);
                  }}>Fechar Caixa</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>Selecione um caixa para ver detalhes</div>
          )}
        </div>
      </div>
    </div>
  );
}
