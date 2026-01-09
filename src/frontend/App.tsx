import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clientes from './components/clientes/Clientes';
import Produtos from './components/Produtos/Produtos';
import ProdutoDetalhes from './components/produtos/ProdutoDetalhes';
import Movimentacao from './pages/Movimentacao/Movimentacao';
import Manutencao from './components/Manutencao';
import CadastrosPage from './pages/cadastros/CadastrosPage';
import Fabricantes from './components/fabricantes/Fabricantes';
import Colaboradores from './components/colaboradores/Colaboradores';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login/LoginPage'
import Fornecedores from './components/fornecedores/Fornecedores';
import Vendas from './components/vendas/Vendas';
import CadastrosAuxiliares from './pages/cadastros/CadastrosAuxiliares';
import Caixa from './components/caixa/Caixa';
import CaixaDetalhes from './components/caixa/CaixaDetalhes';
import ParcelasPagar from './components/financeiro/ParcelasPagar';
import EstoqueMovimentos from './components/estoque/EstoqueMovimentos';
import Compras from './components/compras/Compras';
import Financeiro from './components/financeiro/Financeiro';
import ContasReceber from './components/financeiro/ContasReceber';
import ParcelasReceber from './components/financeiro/ParcelasReceber';
import ContasPagar from './components/financeiro/ContasPagar';
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [caixaSelecionado, setCaixaSelecionado] = useState<any>(null);

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



    if (page.startsWith("financeiro")) {
      const parts = page.split("/");

      // financeiro
      if (parts.length === 1) {
        return <Financeiro setPage={setPage} />;
      }

      // financeiro/receber
      if (parts[1] === "receber" && parts.length === 2) {
        return <ContasReceber setPage={setPage} />;
      }

      // financeiro/receber/parcelas/:id
      if (parts[1] === "receber" && parts[2] === "parcelas") {
        const contaId = Number(parts[3]);
        return (
          <ParcelasReceber
            contaId={contaId}
            setPage={setPage}
          />
        );
      }

      // financeiro/pagar
      if (parts[1] === "pagar" && parts.length === 2) {
        return <ContasPagar setPage={setPage} />;
      }

      // ✅ financeiro/pagar/parcelas/:id
      if (parts[1] === "pagar" && parts[2] === "parcelas") {
        const contaId = Number(parts[3]);
        return (
          <ParcelasPagar
            contaId={contaId}
            setPage={setPage}
          />
        );
      }
    }

    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />
      case 'clientes': return <Clientes setPage={setPage} />;
      case 'produtos':
        return <Produtos setPage={setPage} setProdutoSelecionado={setProdutoSelecionado} />;
      case 'produto-detalhes':
        return <ProdutoDetalhes produtoSelecionado={produtoSelecionado} voltar={() => setPage('produtos')} />;
      case 'movimentacao': return <Movimentacao setPage={setPage} />;
      case 'manutencao': return <Manutencao />;
      case 'colaboradores': return <Colaboradores setPage={setPage} />
      case 'fabricantes':
        return <Fabricantes setPage={setPage} />;
      case 'fornecedores':
        return <Fornecedores setPage={setPage} />;
      case 'cadastros':
        return <CadastrosPage setPage={setPage} />;
      case 'compras':
        return <Compras setPage={setPage} />
      case 'vendas': return <Vendas setPage={setPage} />;
      case 'cadastrosauxiliares':
        return <CadastrosAuxiliares setPage={setPage} />
      case 'caixa':
        return <Caixa setPage={setPage} setCaixaSelecionado={setCaixaSelecionado} />
      case "movimentacao-estoque":
        return <EstoqueMovimentos setPage={setPage} />;

      case 'caixa-detalhes':
        return (
          <CaixaDetalhes
            caixa={caixaSelecionado}     // ← envia o ID
            voltar={() => setPage('caixa')}
          />
        );



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
