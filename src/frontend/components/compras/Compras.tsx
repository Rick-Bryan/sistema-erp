import React, { useEffect, useState } from "react";
import SearchBar from "../../components/ui/SearchBar";


import CompraDetalhesModal from "./ComprasDetalhes";
import NovaCompraModal from "./NovaCompraModal";


export default function Compras({ setPage }: { setPage: (p: string) => void }) {
  const [compras, setCompras] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState<any>(null);
  const [abrirNovaCompra, setAbrirNovaCompra] = useState(false);
  const [search, setSearch] = useState('');

  const comprasFiltradas = compras.filter(c => {
    const textoBusca = search.toLowerCase();
    return c.id.toString().includes(textoBusca)
      || c.fornecedor_nome?.toLowerCase().includes(textoBusca)
      || c.status.toLowerCase().includes(textoBusca);
  });
  async function carregar() {
    const dados = await window.ipcRenderer.invoke('compras:listar');

    setCompras(dados);
  }
  useEffect(() => {

    carregar();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
      <button style={btnVoltar} onClick={() => setPage('movimentacao')}>← Voltar</button>

      <div style={header}>
        <h2 style={{ color: '#1e3a8a' }}>Compras</h2>
        <button style={btnNovo} onClick={() => setAbrirNovaCompra(true)}>Nova Compra</button>
      </div>

      <SearchBar
        placeholder="Pesquisar"
        buscarNoBanco={false}
        onResults={res => setSearch(res?.search || '')}
      />

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={theadRow}>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Fornecedor</th>
              <th style={th}>Valor Total</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {comprasFiltradas.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={td}>{c.id}</td>
                <td style={td}>{c.fornecedor_nome || c.fornecedor_id}</td>
                <td style={td}>R$ {Number(c.valor_total).toFixed(2)}</td>
                <td style={{ ...td, color: c.status === 'aberta' ? 'green' : 'red' }}>{c.status}</td>
                <td style={td}>
                  <button style={btnVoltar} onClick={() => setSelecionada(c.id)}>Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecionada && (
        <CompraDetalhesModal compraId={selecionada} onClose={() => setSelecionada(null)}  refresh={carregar}/>
      )}

      {abrirNovaCompra && (
        <NovaCompraModal onClose={() => setAbrirNovaCompra(false)} refresh={carregar} />
      )}
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
