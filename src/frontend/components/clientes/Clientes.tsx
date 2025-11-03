import { useEffect, useState } from 'react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
}

interface ClientesProps {
  setPage: (page: string) => void;
}

export default function Clientes({ setPage }: ClientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('get-clientes').then((data: Cliente[]) => setClientes(data));
    } else {
      setClientes([{ id: 1, nome: 'Cliente Exemplo', email: 'cliente@exemplo.com' }]);
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
      <h1>Clientes</h1>
      <table
        style={{
          width: '100%',
          background: '#fff',
          padding: '30px',
          borderSpacing: 0,
          borderCollapse: 'collapse'
        }}
      >
        <thead style={{ background: '#4da6ff', color: '#fff' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Nome</th>
            <th style={thStyle}>Email</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td style={tdStyle}>{c.id}</td>
              <td style={tdStyle}>{c.nome}</td>
              <td style={tdStyle}>{c.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: 10, textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: 10, borderBottom: '1px solid #ccc' };
