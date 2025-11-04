import React, { useState, useEffect } from 'react';
import ProdutoDetalhes from './ProdutoDetalhes';
import ProdutoCadastro from './ProdutoCadastro';
import SearchBar from "../../components/ui/SearchBar";
declare global {
  interface Window {
    electronAPI: {
      getProdutos: () => Promise<any[]>;
    };
  }
}

interface ProdutosProps {
  setPage: (page: string) => void;
}

export default function Produtos({ setPage }: ProdutosProps) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);

  const carregarProdutos = async () => {
    const lista = await window.electronAPI.getProdutos();
    setProdutos(lista);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  if (modoCadastro) {
    return (
      <ProdutoCadastro
        voltar={() => {
          setModoCadastro(false);
          carregarProdutos();
        }}
      />
    );
  }

  if (produtoSelecionado) {
    return (
      <ProdutoDetalhes
        produtoSelecionado={produtoSelecionado}
        voltar={() => {
          setProdutoSelecionado(null);
          carregarProdutos();
        }}
      />
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* 🔙 Botão de voltar */}
      <button
        onClick={() => setPage('cadastros')}
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

      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1e3a8a' }}>Produtos</h2>
        <button
          onClick={() => setModoCadastro(true)}
          style={{
            backgroundColor: '#1e3a8a',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ＋ Novo Produto
        </button>
      </div>

      {/* Tabela */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '20px',
        }}
      >
         <SearchBar
        canal="buscar-produtos"
        placeholder="Pesquisar produto por nome ou código de barras..."
        onResults={setProdutos}
      />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a', textAlign: 'left' }}>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Código de Barra</th>
              <th style={thStyle}>Grupo</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.CodigoProduto} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{p.CodigoProduto}</td>
                <td style={tdStyle}>{p.NomeProduto}</td>
                <td style={tdStyle}>{p.CodigoBarra}</td>
                <td style={tdStyle}>{p.CodigoGrupo}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setProdutoSelecionado(p)}
                    style={{
                      backgroundColor: '#1e3a8a',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Visualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
};
