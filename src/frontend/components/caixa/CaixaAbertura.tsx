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


export default function CaixaAbertura({ onVoltar }: CaixaCadastroProps) {
  const [valorAbertura, setValorAbertura] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [usuarioId, setUsuarioId] = useState('');

  const [colaboradores, setColaboradores] = useState([])

  async function carregarColaboradores() {
    const result = await window.ipcRenderer.invoke("get-colaboradores");
    setColaboradores(result)
  }
  console.log(colaboradores)
  useEffect(() => {
    carregarColaboradores();
  }, [])

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

      const resposta = await window.electronAPI.addSessoesCaixa(novaSessao);

      if (resposta?.id) {
        // SALVA O ID DO CAIXA NO LOCALSTORAGE
        localStorage.setItem("caixa_id", resposta.id);
      }

      toast.success('Caixa aberto com sucesso!');
      setValorAbertura('');
      setObservacoes('');

      // atualizar lista após abrir
    } catch (err: any) {
      console.error(err);

      // Se o backend enviou uma mensagem clara, exibe ela
      if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao abrir caixa');
      }
    }

  }


  return (
    <div style={pageContainer} >
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
      <h2 style={titulo}>Abertura de Caixa</h2>
      <div style={formContainer}>

        <div style={inputGroup}>
          <label style={labelStyle}>Colaborador</label>
          <select style={inputStyle} value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
            {colaboradores.map((c) => (

              <option key={c.id} value={c.id}>{c.nome}</option>

            ))}
          </select>
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>Valor de Abertura</label>
          <input
            style={inputStyle}
            placeholder="Valor de Abertura"
            value={valorAbertura}
            onChange={(e) => setValorAbertura(e.target.value)}
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Observações</label>
          <input
            style={inputStyle}
            placeholder="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>





        <div style={botoesContainer}>
          <button style={buttonPrimary} onClick={abrirCaixa}>Abrir Caixa</button>
        </div>
      </div>



    </div>
  );
}

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
