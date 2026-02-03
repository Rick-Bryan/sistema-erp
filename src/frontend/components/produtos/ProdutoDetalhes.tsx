import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { toastErro } from '../helpers/toastErro';
declare global {
  interface Window {
    electronAPI: {
      salvarProduto: (produto: any) => Promise<void>;
    };
  }
}

interface Produto {
  CodigoProduto: number;
  CodigoBarra: string;
  NomeProduto: string;
  CodigoGrupo: number;
  CodigoSubGrupo: number;
  CodigoFabricante?: number;
  DataCadastro: string;
  UnidadeEmbalagem?: string;
  FracaoVenda: number;
  NCM: string;
  Eliminado: number;
  IPI: number;
  ReducaoIPI: number;
  PisCofinsCST?: string;
  PisCofinsNatureza?: string;
  PisCofinsCSTEntrada?: string;
  CEST?: string;
  CodigoBeneficio?: string;
}

interface Props {
  produtoSelecionado: Produto;
  voltar: () => void;
}

export default function ProdutoDetalhes({ produtoSelecionado, voltar }: Props) {
  const [produto, setProduto] = useState<Produto>({ ...produtoSelecionado });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduto(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      await window.electronAPI.salvarProduto(produto);
      toast.success('Produto atualizado com sucesso!');
      voltar();
    } catch (err) {
      console.error(err);
      toastErro(err)
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
        boxSizing: 'border-box',
        overflowY: 'auto', // scroll vertical se necessário
      }}
    >
        <button
        onClick={() => voltar()}
        style={{
          backgroundColor: '#e5e7eb',
          color: '#1e3a8a',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: '20px'
        }}
      >
        ← Voltar
      </button>
      <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>📋 Detalhes do Produto</h2>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // responsivo
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {Object.entries(produto).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>{key}</label>
            <input
              style={inputStyle}
              name={key}
              value={value ?? ''}
              onChange={handleChange}
            />
          </div>
        ))}

        <div
          style={{
            gridColumn: '1 / -1', // ocupa todas as colunas
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            justifyContent: 'flex-start',
          }}
        >
          <button onClick={handleSalvar} style={buttonStyle}>
            Salvar
          </button>
          <button onClick={voltar} style={{ ...buttonStyle, backgroundColor: '#6b7280' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 600,
  color: '#1e3a8a',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  marginBottom: '10px',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1e3a8a',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
};
