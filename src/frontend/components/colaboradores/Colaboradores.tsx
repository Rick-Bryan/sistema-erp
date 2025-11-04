import { useEffect, useState } from 'react';

interface Colaborador {
  id: number;
  nome: string;
  email: string;
}

interface ColaboradoresProps {
  setPage: (page: string) => void;
}

export default function Colaboradores({ setPage }: ColaboradoresProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<any | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('get-colaboradores').then((data: Colaborador) => setColaboradores(data));
    } else {
      setColaboradores([{ id: 1, nome: 'Cliente Exemplo', email: 'cliente@exemplo.com' }]);
    }
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1e3a8a' }}>Colaboradores</h2>
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
          ＋ Novo Colaborador
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
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{c.id}</td>
                <td style={tdStyle}>{c.nome}</td>
                <td style={tdStyle}>{c.email}</td>

                <td style={tdStyle}>
                  <button
                    onClick={() => setColaboradorSelecionado(c)}
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

const thStyle: React.CSSProperties = { padding: 10, textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: 10, borderBottom: '1px solid #ccc' };
