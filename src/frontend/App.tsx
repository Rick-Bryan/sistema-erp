import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clientes from './components/clientes/Clientes';
import Produtos from './components/Produtos/Produtos';
import ProdutoDetalhes from './components/produtos/ProdutoDetalhes';
import DefinicoesDeAcesso from './components/definicoesDeAcesso/DefinicoesDeAcesso';
import Movimentacao from './pages/Movimentacao/Movimentacao';
import Manutencao from './pages/Manutencao/Manutencao';
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
import FinanceiroContas from './components/financeiro/FinanceiroContas';
import CarteiraDigital from './components/carteiradigital/CarteiraDigital';
import ExtratoConta from './components/carteiradigital/ExtratoConta';
import { toastErro } from './components/helpers/toastErro';
import { setPermissoes as setCachePermissoes } from './components/helpers/verifyPerm';
import Orcamentos from './components/orcamentos/Orcamentos';
import { ReactElement, ElementType } from 'react';
type Aba = {
  id: string;
  page: string;
  titulo: string;
  params?: any;
  minimizada: boolean;
};

export default function App() {
  const [hoverAba, setHoverAba] = useState<string | null>(null);

  const [abas, setAbas] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<string | null>(null);
  const [page, setPage] = useState("dashboard")
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [caixaSelecionado, setCaixaSelecionado] = useState<any>(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const [permissoes, setPermissoes] = useState<any>(null);

  useEffect(() => {
    if (token && user) setUsuario(JSON.parse(user));
  }, [])

  const carregarPermissoes = async () => {
    try {
      const list = await window.ipcRenderer.invoke("permissoes:listar", Number(user.id));
      setPermissoes(list);
      setCachePermissoes(list); // ✅ alimenta o verifyPerm
    }
    catch (err) {
      toastErro(err);
    }
  };

  const navegarMenu = (page: string) => {
    setPage(page);
    setAbaAtiva(null);
  };
  const goBack = (fallbackPage = 'dashboard') => {
    if (abaAtiva) {
      //fecharAba(abaAtiva);
      navegarMenu(fallbackPage);
    } else {
      navegarMenu(fallbackPage);
    }
  };


  const abrirAba = (page: string, titulo: string, params?: any, Icon?: ElementType) => {
    setAbas(prev => {
      const existente = prev.find(a => a.id === page);
      if (existente) return prev;

      return [...prev, { id: page, page, titulo, params, Icon, minimizada: false }];
    });

    setAbaAtiva(page);
  };


  const fecharAba = (id: string) => {
    setAbas(prev => {
      const novas = prev.filter(a => a.id !== id);
      if (abaAtiva === id && novas.length) setAbaAtiva(novas[novas.length - 1].id);
      return novas;
    });
  };
  const fecharTodasAbas = () => {
    setAbas([]);
    setAbaAtiva(null);
    setPage("dashboard");
  };


  useEffect(() => {
    if (usuario) carregarPermissoes();
  }, [usuario]);

  const handleLogout = async () => {
    try {
      await window.ipcRenderer.invoke("logout");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }

    localStorage.clear();
    setUsuario(null);

  };

  // 🔒 Se não estiver logado, mostra tela de login
  if (!usuario) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLoginSuccess={setUsuario} />
      </>
    );
  }

  const renderAba = (aba: any) => {
    const page = aba.page;

    if (page.startsWith("carteira/extrato/")) {
      const id = page.split("/")[2];
      return <ExtratoConta abrirAba={abrirAba} params={{ id }} />;
    }

    if (page.startsWith("financeiro")) {
      const parts = page.split("/");

      if (parts.length === 1) return <Financeiro abrirAba={abrirAba} voltar={() => goBack('movimentacao')} />;
      if (parts[1] === "receber" && parts.length === 2) return <ContasReceber abrirAba={abrirAba} voltar={() => goBack('financeiro')} />; //FAlta ajustar o parcelas
      if (parts[1] === "contas") return <FinanceiroContas abrirAba={abrirAba} voltar={() => goBack('financeiro')} />;
      if (parts[1] === "receber" && parts[2] === "parcelas") return <ParcelasReceber contaId={Number(parts[3])} />;
      if (parts[1] === "pagar" && parts.length === 2) return <ContasPagar abrirAba={abrirAba} />;
      if (parts[1] === "pagar" && parts[2] === "parcelas") return <ParcelasPagar contaId={Number(parts[3])} />;
    }

    switch (page) {
      //Dashboard
      case 'dashboard': return <Dashboard abrirAba={abrirAba} />;

      //Movimentacao
      case 'movimentacao': return <Movimentacao abrirAba={abrirAba} />;
      case 'compras': return <Compras abrirAba={abrirAba} voltar={() => goBack('movimentacao')} />;
      case 'vendas': return <Vendas abrirAba={abrirAba} voltar={() => goBack('movimentacao')} />;
      case 'caixa-fluxo':
        return (
          <Caixa
            abrirAba={abrirAba}
            setCaixaSelecionado={setCaixaSelecionado}
            voltar={() => goBack('movimentacao')}
          />
        );

      case 'movimentacao-estoque': return <EstoqueMovimentos abrirAba={abrirAba} voltar={() => goBack('movimentacao')} />;
      case 'carteira-digital': return <CarteiraDigital abrirAba={abrirAba} voltar={() => goBack('movimentacao')} />;
      case 'orcamentos': return <Orcamentos abrirAba={abrirAba} voltar={() => goBack('movimentacao')} />;
      case 'caixa-detalhes':
        return (
          <CaixaDetalhes
            caixa={caixaSelecionado}
            voltar={() => {
              fecharAba('caixa-detalhes');
              navegarMenu('movimentacao');
              abrirAba('caixa-fluxo', 'Caixa');
            }}
          />
        );



      //Cadastros

      case 'cadastros-auxiliares': return <CadastrosAuxiliares abrirAba={abrirAba} voltar={() => goBack('cadastros')} />;
      case 'clientes': return <Clientes abrirAba={abrirAba} voltar={() => goBack('cadastros')} />;
      case 'produtos': return <Produtos abrirAba={abrirAba} voltar={() => goBack('cadastros')} />;
      case 'produto-detalhes': return (<ProdutoDetalhes produtoSelecionado={produtoSelecionado} voltar={() => goBack('produtos')} />);
      case 'colaboradores': return <Colaboradores abrirAba={abrirAba} voltar={() => goBack('cadastros')} />;
      case 'fabricantes': return <Fabricantes abrirAba={abrirAba} voltar={() => goBack('cadastros')} />;
      case 'fornecedores': return <Fornecedores abrirAba={abrirAba} voltar={() => goBack('cadastros')} />;

      //Manutenção
      case 'manutencao': return <Manutencao abrirAba={abrirAba} />;
      case 'definicoes-acesso': return <DefinicoesDeAcesso abrirAba={abrirAba} voltar={() => goBack('manutencao')} />;
      default: return <Dashboard abrirAba={abrirAba} />;

    }

  };
  const renderBase = () => {
    switch (page) {
      case 'dashboard': return <Dashboard abrirAba={abrirAba} />;
      case 'movimentacao': return <Movimentacao abrirAba={abrirAba} />;
      case 'cadastros': return <CadastrosPage abrirAba={abrirAba} />;
      case 'manutencao': return <Manutencao abrirAba={abrirAba} />;
      default: return <Dashboard abrirAba={abrirAba} />;
    }
  };

  return (
    <div style={containerStyle}>
      <Sidebar
        abrirAba={abrirAba}
        onMenuClick={navegarMenu}
        onLogout={handleLogout}
      />


      <div style={areaDireitaStyle}>


        {/* ABAS */}
        <div style={abasContainerStyle}>
          {abas.length > 0 && (
            <>
              {abas.map(aba => {
                const ativa = aba.id === abaAtiva;
                const isHover = hoverAba === aba.id;
                const Icon = aba.Icon;

                return (
                  <div
                    key={aba.id}
                    style={abaStyle(ativa, isHover)}
                    onClick={() => setAbaAtiva(aba.id)}
                    onMouseEnter={() => setHoverAba(aba.id)}
                    onMouseLeave={() => setHoverAba(null)}
                  >
                    {Icon && <Icon size={16} />}
                    {ativa && <span style={{ marginLeft: 6 }}>{aba.titulo}</span>}

                    {ativa && (
                      <span
                        style={fecharStyle}
                        onClick={e => {
                          e.stopPropagation();
                          fecharAba(aba.id);
                        }}
                      >
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}

              {/* botão no canto direito */}
              <button
                onClick={fecharTodasAbas}
                title="Fechar todas as abas"
                style={closeAllStyle}
              >
                Fechar tudo
              </button>
            </>
          )}
        </div>


        {/* CONTEÚDO */}

        <main style={mainStyle}>
          {abaAtiva ? (
            abas.map(
              aba => aba.id === abaAtiva && <div key={aba.id}>{renderAba(aba)}</div>
            )
          ) : (
            renderBase()
          )}
        </main>

      </div>

    </div>
  );

}
const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  backgroundColor: '#f5f7fa',
  overflow: 'hidden'
};

const areaDireitaStyle: React.CSSProperties = {
  marginLeft: '230px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};
const abasContainerStyle: React.CSSProperties = {
  height: 42,
  display: "flex",
  alignItems: "center",
  background: "#fff",
  borderBottom: "1px solid #ddd",
  flexShrink: 0,
  padding: "0 8px",
};

const closeAllStyle: React.CSSProperties = {
  marginLeft: "auto", // <--- empurra para a direita
  background: "#1e3a8a",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap"
};




const abaStyle = (ativa: boolean, isHover: boolean): React.CSSProperties => ({
  position: 'relative',
  width: ativa ? 140 : 42,   // só a ativa cresce
  height: '100%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: ativa ? 'flex-start' : 'center',
  gap: ativa ? 8 : 0,
  paddingLeft: ativa ? 8 : 0,
  background: ativa
    ? '#f5f7fa'
    : isHover
      ? '#dde6f3'
      : '#e9eef5',
  borderRight: '1px solid #ccc',
  transition: 'width .18s ease, background .18s ease'
});


const fecharStyle: React.CSSProperties = {
  position: 'absolute',
  top: 2,
  right: 2,
  fontSize: 10,
  cursor: 'pointer'
};
const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: 20,
  overflowY: 'auto'
};
// --------------------- JSX ---------------------
