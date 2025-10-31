import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clientes from './components/Clientes';
import Produtos from './components/Produtos';
import ProdutoDetalhes from './components/ProdutoDetalhes';
import Financeiro from './components/Financeiro';
import Ajustes from './components/Ajustes';

export default function App() {
  const [page, setPage] = useState('dashboard');
const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'clientes': return <Clientes />;
        case 'produtos': 
        return <Produtos setPage={setPage} setProdutoSelecionado={setProdutoSelecionado} />;
      case 'produto-detalhes': 
        return <ProdutoDetalhes produtoSelecionado={produtoSelecionado} voltar={() => setPage('produtos')} />;
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
