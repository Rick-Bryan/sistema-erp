// src/components/fabricantes/Fabricantes.tsx
import React, { useState, useEffect } from 'react';
import FabricanteCadastro from './FabricanteCadastro';
import FabricanteDetalhes from './FabricanteDetalhes';

declare global {
  interface Window {
    electronAPI: {
      getFabricantes: () => Promise<any[]>;
    };
  }
}

interface FabricantesProps {
  setPage: (page: string) => void;
}

export default function Fabricantes({ setPage }: FabricantesProps) {
  const [fabricantes, setFabricantes] = useState<any[]>([]);
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState<any | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);

  const carregarFabricantes = async () => {
    const lista = await window.electronAPI.getFabricantes();
    setFabricantes(lista);
  };

  useEffect(() => {
    carregarFabricantes();
  }, []);

  if (modoCadastro) {
    return (
      <FabricanteCadastro
        voltar={() => {
          setModoCadastro(false);
          carregarFabricantes();
        }}
      />
    );
  }

  if (fabricanteSelecionado) {
    return (
      <FabricanteDetalhes
        fabricanteSelecionado={fabricanteSelecionado}
        voltar={() => {
          setFabricanteSelecionado(null);
          carregarFabricantes();
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
        <h2 style={{ color: '#1e3a8a' }}>Fabricantes</h2>
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
          ＋ Novo Fabricante
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a', textAlign: 'left' }}>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Ativo</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fabricantes.map((f) => (
              <tr key={f.CodigoFabricante} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{f.CodigoFabricante}</td>
                <td style={tdStyle}>{f.NomeFabricante}</td>
                <td style={tdStyle}>{f.Ativo ? 'Sim' : 'Não'}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setFabricanteSelecionado(f)}
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

const thStyle: React.CSSProperties = { padding: '10px', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '10px' };
