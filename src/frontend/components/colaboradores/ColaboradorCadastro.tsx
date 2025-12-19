import React, { useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    electronAPI: {
      addColaborador: (colaborador: any) => Promise<void>;
    };
  }
}

interface Colaborador {
  id?: number;
  nome?: string;
  email?: string;
  senha?: string;
  nivel?: 'administrador' | 'vendedor' | 'financeiro' | 'estoquista';
  setor?: string;
  ativo?: boolean;
  criado_em?: string;
}

export default function ColaboradorCadastro({ voltar }: { voltar: () => void }) {
  const [colaborador, setColaborador] = useState<Colaborador>({
    ativo: true,
    criado_em: new Date().toISOString().split('T')[0],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setColaborador((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSalvar = async () => {
    try {
      await window.electronAPI.addColaborador(colaborador);
      toast.success('✅ Colaborador cadastrado com sucesso!');
      voltar();
    } catch (err) {
      console.error(err);
      toast.error('❌ Erro ao cadastrar colaborador.');
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
      <h2 style={titulo}>Cadastrar Colaborador</h2>

      <div style={formContainer}>
        {/* Nome */}
        <div style={inputGroup}>
          <label style={labelStyle}>Nome</label>
          <input
            style={inputStyle}
            name="nome"
            value={colaborador.nome || ''}
            onChange={handleChange}
            type="text"
            maxLength={100}
            placeholder="Digite o nome completo"
          />
        </div>

        {/* Email */}
        <div style={inputGroup}>
          <label style={labelStyle}>E-mail</label>
          <input
            style={inputStyle}
            name="email"
            value={colaborador.email || ''}
            onChange={handleChange}
            type="email"
            maxLength={100}
            placeholder="exemplo@email.com"
          />
        </div>

        {/* Senha */}
        <div style={inputGroup}>
          <label style={labelStyle}>Senha</label>
          <input
            style={inputStyle}
            name="senha"
            value={colaborador.senha || ''}
            onChange={handleChange}
            type="password"
            maxLength={255}
            placeholder="Digite uma senha segura"
          />
        </div>

        {/* Nível */}
        <div style={inputGroup}>
          <label style={labelStyle}>Nível de Acesso</label>
          <select
            style={inputStyle}
            name="nivel"
            value={colaborador.nivel || ''}
            onChange={handleChange}
          >
            <option value="">Selecione...</option>
            <option value="administrador">Administrador</option>
            <option value="vendedor">Vendedor</option>
            <option value="financeiro">Financeiro</option>
            <option value="estoquista">Estoquista</option>
          </select>
        </div>

        {/* Setor */}
        <div style={inputGroup}>
          <label style={labelStyle}>Setor</label>
          <input
            style={inputStyle}
            name="setor"
            value={colaborador.setor || ''}
            onChange={handleChange}
            type="text"
            maxLength={50}
            placeholder="Ex: Vendas, Suporte, Financeiro..."
          />
        </div>

        {/* Ativo */}
        <div style={{ ...inputGroup, flexDirection: 'row', alignItems: 'center' }}>
          <label style={{ ...labelStyle, marginRight: '10px' }}>Ativo</label>
          <input
            type="checkbox"
            name="ativo"
            checked={!!colaborador.ativo}
            onChange={handleChange}
            style={{ width: '20px', height: '20px' }}
          />
        </div>

        {/* Data de Criação */}
        <div style={inputGroup}>
          <label style={labelStyle}>Data de Criação</label>
          <input
            style={inputStyle}
            name="criado_em"
            value={colaborador.criado_em || ''}
            onChange={handleChange}
            type="date"
          />
        </div>

        {/* Botões */}
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
