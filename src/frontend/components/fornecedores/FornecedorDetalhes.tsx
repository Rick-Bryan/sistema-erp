import React, { useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    electronAPI: {
      salvarFornecedor: (fornecedor: any) => Promise<void>;
    };
  }
}

interface Fornecedor {
  CodigoFornecedor?: number;
  Nome: string;
  NomeFantasia?: string;
  CNPJ?: string;
  Endereco?: string;
  Cidade?: string;
  Bairro?: string;
  Pessoa?: string;
  Ativo?: boolean;
  Data?: string;
}

interface Props {
  fornecedorSelecionado: Fornecedor;
  voltar: () => void;
}

export default function FornecedorDetalhes({ fornecedorSelecionado, voltar }: Props) {
  const [fornecedor, setFornecedor] = useState<Fornecedor>({ ...fornecedorSelecionado });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFornecedor((prev) => ({
      ...prev,
      [name]: name === "Ativo" ? value === "true" : value,
    }));
  };

  const handleSalvar = async () => {
    try {
      await window.electronAPI.salvarFornecedor(fornecedor);
      toast.success("Fornecedor salvo com sucesso!");
      voltar();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar o fornecedor.");
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
        boxSizing: 'border-box',
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
      <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Detalhes do Fornecedor</h2>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        <Input label="Nome" name="Nome" value={fornecedor.Nome || ''} onChange={handleChange} />
        <Input label="Nome Fantasia" name="NomeFantasia" value={fornecedor.NomeFantasia || ''} onChange={handleChange} />
        <Input label="CNPJ" name="CNPJ" value={fornecedor.CNPJ || ''} onChange={handleChange} />
        <Input label="Endereço" name="Endereco" value={fornecedor.Endereco || ''} onChange={handleChange} />
        <Input label="Cidade" name="Cidade" value={fornecedor.Cidade || ''} onChange={handleChange} />
        <Input label="Bairro" name="Bairro" value={fornecedor.Bairro || ''} onChange={handleChange} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>Pessoa</label>
          <select style={inputStyle} name="Pessoa" value={fornecedor.Pessoa || 'JURIDICA'} onChange={handleChange}>
            <option value="JURIDICA">Jurídica</option>
            <option value="FISICA">Física</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>Ativo</label>
          <select style={inputStyle} name="Ativo" value={fornecedor.Ativo ? 'true' : 'false'} onChange={handleChange}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleSalvar} style={buttonStyle}>Salvar</button>
          <button onClick={voltar} style={{ ...buttonStyle, backgroundColor: '#6b7280' }}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} name={name} value={value} onChange={onChange} />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  marginBottom: '5px',
  fontWeight: 600,
  color: '#1e3a8a',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
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
