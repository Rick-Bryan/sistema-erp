import { useEffect, useState } from 'react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('get-clientes').then((data: Cliente[]) => setClientes(data));
    } else {
      setClientes([{ id: 1, nome: 'Cliente Exemplo', email: 'cliente@exemplo.com' }]);
    }
  }, []);

  return (
    <div>
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
