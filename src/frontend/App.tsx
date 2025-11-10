import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clientes from './components/clientes/Clientes';
import Produtos from './components/Produtos/Produtos';
import ProdutoDetalhes from './components/produtos/ProdutoDetalhes';
import Movimentacao from './components/Movimentacao';
import Manutencao from './components/Manutencao';
import CadastrosPage from './pages/cadastros/CadastrosPage';
import Fabricantes from './components/fabricantes/Fabricantes';
import Colaboradores from './components/colaboradores/Colaboradores';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login/LoginPage'
import Fornecedores from './components/fornecedores/Fornecedores';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    if (token && user) setUsuario(JSON.parse(user));

  }, [])

  const handleLogout = () => {
    localStorage.clear();
    setUsuario(null);

  }
  // 🔒 Se não estiver logado, mostra tela de login
  if (!usuario) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLoginSuccess={setUsuario} />
      </>
    );
  }
  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />
      case 'clientes': return <Clientes setPage={setPage} />;
      case 'produtos':
        return <Produtos setPage={setPage} setProdutoSelecionado={setProdutoSelecionado} />;
      case 'produto-detalhes':
        return <ProdutoDetalhes produtoSelecionado={produtoSelecionado} voltar={() => setPage('produtos')} />;
      case 'movimentacao': return <Movimentacao />;
      case 'manutencao': return <Manutencao />;
      case 'colaboradores': return <Colaboradores setPage={setPage} />
      case 'fabricantes':
        return <Fabricantes setPage={setPage} />;
      case 'fornecedores':
        return <Fornecedores setPage={setPage} />;
      case 'cadastros':
        return <CadastrosPage setPage={setPage} />;

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
      <Toaster position="top-right" />
      <Sidebar setPage={setPage} onLogout={handleLogout} />
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
