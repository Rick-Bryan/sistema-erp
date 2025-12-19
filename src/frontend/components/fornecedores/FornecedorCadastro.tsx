import React, { useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    electronAPI: {
      addFornecedor: (fornecedor: any) => Promise<void>;
    };
  }
}

interface Fornecedor {
  codigoFornecedor?: number;
  nome?: string;
  nomefantasia?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  bairro?: string;
  pessoa?: string;
  ativo?: boolean;
  data?: string;
}

const maxLength: Record<string, number> = {
  nome: 80,
  nomefantasia: 80,
  cnpj: 18,
  endereco: 100,
  cidade: 60,
  bairro: 60,
};

export default function FornecedorCadastro({ voltar }: { voltar: () => void }) {
  const [fornecedor, setFornecedor] = useState<Fornecedor>({
    data: new Date().toISOString().split('T')[0],
    ativo: true,
    pessoa: 'JURIDICA',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFornecedor((prev) => ({
      ...prev,
      [name]:
        name === 'ativo'
          ? value === 'true'
          : value.slice(0, maxLength[name] ?? value.length),
    }));
  };

  const handleSalvar = async () => {
    try {
      // 🔽 Envia os dados já com os nomes em minúsculo
      await window.electronAPI.addFornecedor(fornecedor);
      toast.success('✅ Fornecedor cadastrado com sucesso!');
      voltar();
    } catch (err) {
      console.error(err);
      toast.error('❌ Erro ao cadastrar fornecedor.');
    }
  };

  return (
    <div style={pageContainer}>
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
      <h2 style={titulo}>Cadastrar Fornecedor</h2>

      <div style={formContainer}>
        <Input label="Nome" name="nome" value={fornecedor.nome || ''} onChange={handleChange} />
        <Input label="Nome Fantasia" name="nomefantasia" value={fornecedor.nomefantasia || ''} onChange={handleChange} />
        <Input label="CNPJ" name="cnpj" value={fornecedor.cnpj || ''} onChange={handleChange} />
        <Input label="Endereço" name="endereco" value={fornecedor.endereco || ''} onChange={handleChange} />
        <Input label="Cidade" name="cidade" value={fornecedor.cidade || ''} onChange={handleChange} />
        <Input label="Bairro" name="bairro" value={fornecedor.bairro || ''} onChange={handleChange} />

        <div style={inputGroup}>
          <label style={labelStyle}>Pessoa</label>
          <select style={inputStyle} name="pessoa" value={fornecedor.pessoa || 'JURIDICA'} onChange={handleChange}>
            <option value="JURIDICA">Jurídica</option>
            <option value="FISICA">Física</option>
          </select>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Ativo</label>
          <select style={inputStyle} name="ativo" value={fornecedor.ativo ? 'true' : 'false'} onChange={handleChange}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Data</label>
          <input
            style={inputStyle}
            type="date"
            name="data"
            value={fornecedor.data || ''}
            onChange={handleChange}
          />
        </div>

        <div style={botoesContainer}>
          <button onClick={handleSalvar} style={buttonPrimary}>
            Salvar
          </button>
          <button onClick={voltar} style={buttonSecondary}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====== COMPONENTE DE INPUT ====== */
function Input({ label, name, value, onChange }: any) {
  return (
    <div style={inputGroup}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} name={name} value={value} onChange={onChange} />
    </div>
  );
}

/* ======== ESTILOS ======== */

const pageContainer: React.CSSProperties = {
  padding: '30px',
  backgroundColor: '#f3f4f6',
  minHeight: '100vh',
  boxSizing: 'border-box',
};

const titulo: React.CSSProperties = {
  color: '#1e3a8a',
  fontWeight: 700,
  fontSize: '24px',
  marginBottom: '25px',
  textAlign: 'center',
};

const formContainer: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '25px 30px',
  boxSizing: 'border-box',
};

const inputGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle: React.CSSProperties = {
  marginBottom: '6px',
  fontWeight: 600,
  color: '#1e3a8a',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  outline: 'none',
  transition: '0.2s border-color',
  fontSize: '15px',
  boxSizing: 'border-box',
};

const botoesContainer: React.CSSProperties = {
  gridColumn: '1 / -1',
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  marginTop: '30px',
};

const buttonBase: React.CSSProperties = {
  padding: '10px 22px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '15px',
  transition: '0.2s all ease',
};

const buttonPrimary: React.CSSProperties = {
  ...buttonBase,
  backgroundColor: '#1e3a8a',
  color: '#fff',
};

const buttonSecondary: React.CSSProperties = {
  ...buttonBase,
  backgroundColor: '#6b7280',
  color: '#fff',
};
