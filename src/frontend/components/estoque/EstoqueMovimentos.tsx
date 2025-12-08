import React, { useState, useEffect } from 'react';
import SearchBar from "../../components/ui/SearchBar";


declare global {
  interface Window {
    electronAPI: {
      getMovimentosEstoque: () => Promise<any[]>;
    };
  }
}

export default function EstoqueMovimentos({ setPage }) {
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('')
  const [filtroProduto, setFiltroProduto] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [search, setSearch] = useState('');

  const movimentosFiltrados = movimentos.filter(m => {

    const textoBusca = typeof search === "string" ? search.toLowerCase() : "";

    const nomeMatch = textoBusca ? m.NomeProduto.toLowerCase().includes(textoBusca) : true;

    const tipoMatch = filtroTipo ? m.tipo === filtroTipo : true;
    const produtoMatch = filtroProduto ? m.NomeProduto.toLowerCase() === filtroProduto.toLowerCase() : true;
    const origemMatch = filtroOrigem ? m.origem === filtroOrigem : true;
    const data = new Date(m.criado_em);
    const inicioMatch = dataInicial ? data >= new Date(dataInicial) : true;
    const finalMatch = dataFinal ? data <= new Date(dataFinal) : true;

    return nomeMatch && tipoMatch && produtoMatch && inicioMatch && finalMatch && origemMatch;
  });

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await window.electronAPI.getMovimentosEstoque();
        setMovimentos(dados);
      } catch (e) {
        console.error("Erro ao carregar movimentação de estoque ", e);
      }
    }

    carregar();
  }, []);





  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
      <button style={btnVoltar} onClick={() => setPage('movimentacao')}>← Voltar</button>

      <div style={header}>
        <h2 style={{ color: '#1e3a8a' }}>Movimentações de Estoque</h2>
      </div>
      <SearchBar
        placeholder="Pesquisar"
        buscarNoBanco={false}           // 👈 ESSENCIAL AQUI
        onResults={res => setSearch(res?.search || '')}
      />


      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>

        {/* Tipo */}
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={filtro}>
          <option value="">Tipo</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        {/* Produto */}
        <select value={filtroProduto} onChange={e => setFiltroProduto(e.target.value)} style={filtro}>
          <option value="">Produto</option>
          {Array.from(new Set(movimentos.map(m => m.NomeProduto))).map(prod => (
            <option key={prod} value={prod}>{prod}</option>
          ))}
        </select>
        <select value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)} style={filtro}>
          <option value="">Origem</option>
          {Array.from(new Set(movimentos.map(m => m.origem))).map(origem => (
            <option key={origem} value={origem}>{origem}</option>
          ))}
        </select>

        {/* Data inicial */}
        <input type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} style={filtro} />

        {/* Data final */}
        <input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} style={filtro} />

        {/* Botão limpar */}
        <button onClick={() => {
          setFiltroTipo('');
          setFiltroProduto('');
          setDataInicial('');
          setDataFinal('');
          setSearch('');
          setFiltroOrigem('')   // <-- ADICIONE ISTO
        }} style={{ ...filtro, background: '#e5e7eb' }}>Limpar</button>


      </div>

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>Produto</th>
              <th style={th}>Tipo</th>
              <th style={th}>Origem</th>
              <th style={th}>Qtd</th>
              <th style={th}>Custo</th>
              <th style={th}>Observação</th>
              <th style={th}>Data</th>
            </tr>
          </thead>
          <tbody>
            {movimentosFiltrados.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={td}>{m.NomeProduto}</td>
                <td style={{ ...td, color: m.tipo === 'entrada' ? 'green' : 'red' }}>
                  {m.tipo}
                </td>
                <td style={{ ...td }}>{m.origem}</td>

                <td style={{ ...td }}>{parseFloat(m.quantidade).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
                
                <td style={{ ...td }}>
                  {m.custo_unitario ? Number(m.custo_unitario).toFixed(2) : '-'}
                </td>
                <td style={{ ...td }}>{m.observacao}</td>
                <td style={td}>{new Date(m.criado_em).toLocaleDateString()}</td>
              </tr>
            ))}
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
const th: React.CSSProperties = { padding: 10, fontWeight: 600 };
const td = {
  padding: '12px 8px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
  textAlign: 'center',
  color: '#374151'
};
const filtro = {
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  background: 'white'
};
