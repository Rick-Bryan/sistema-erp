import { useState } from 'react';
import Sidebar from './frontend/components/Sidebar';
import Dashboard from './frontend/components/Dashboard';
import Clientes from './frontend/components/clientes/Clientes';
import Produtos from './frontend/components/Produtos';
import Financeiro from './frontend/components/Financeiro';
import Ajustes from './frontend/components/Ajustes';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'clientes': return <Clientes />;
      case 'produtos': return <Produtos />;
      case 'financeiro': return <Financeiro />;
      case 'ajustes': return <Ajustes />;
      default: return <Dashboard />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f5f7fa',
      }}
    >
      <Sidebar setPage={setPage} />
      <main
        style={{
          flex: 1,
          marginLeft: '230px', // ✅ espaço pro sidebar fixo
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}
