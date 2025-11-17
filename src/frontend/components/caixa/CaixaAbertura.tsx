import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
interface CaixaCadastroProps {

  onVoltar: () => void;

}
interface CaixaSessao {
  id?: number;
  usuario_id: number;

  valor_abertura: number;
  status: string;
  observacoes: string;
}

import { Button, Input, Typography, Card, CardContent, Box, Paper, Divider, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
export default function CaixaAbertura({ onVoltar }: CaixaCadastroProps) {
  const [valorAbertura, setValorAbertura] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [sessaoAtual, setSessaoAtual] = useState(null);
  const [sessoes, setSessoes] = useState([]);


  async function carregarSessoes() {

    const lista = await window.ipcRenderer.invoke("get-sessoes-caixa");

    if (Array.isArray(lista)) {
      setSessoes(lista);
    } else {
      console.warn("Resposta inesperada:", lista);
      setSessoes([]);
    }
  }

  async function abrirCaixa() {

    if (!usuarioId || !valorAbertura) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      const novaSessao = {
        usuario_id: Number(usuarioId),
        valor_abertura: Number(valorAbertura),
        status: 'Aberto',
        observacoes,
      };
      await window.electronAPI.addSessoesCaixa(novaSessao);

      toast.success('Caixa aberto com sucesso!');
      setValorAbertura('');
      setObservacoes('');


    } catch (err) {
      console.error(err);
      toast.error('Erro ao abrir caixa');
    }
  }

  useEffect(() => {
    carregarSessoes();
  }, []);

  return (
    <div className="p-4 grid gap-4">
      <button onClick={onVoltar}
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
      <Card className="shadow-xl p-4">

        <CardContent className="grid gap-4">

          <h2 className="text-xl font-bold">Abertura de Caixa</h2>

          <Input
            placeholder="ID do Usuário"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          />

          <Input
            placeholder="Valor de Abertura"
            value={valorAbertura}
            onChange={(e) => setValorAbertura(e.target.value)}
          />

          <Input
            placeholder="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />

          <Button onClick={abrirCaixa}>Abrir Caixa</Button>
        </CardContent>
      </Card>

      <Card className="shadow p-4">
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Sessões do Caixa</h2>
          <ul className="grid gap-2">
            {sessoes.map((s) => (
              <li key={s.id} className="border p-2 rounded-lg">
                <p><strong>ID: </strong>{s.id}</p>
                <p><strong>Usuário:</strong> {s.usuario_id}</p>

                <p>{new Date(s.aberto_em).toLocaleString('pt-BR')}</p>

                <p><strong>Status:</strong> {s.status}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
