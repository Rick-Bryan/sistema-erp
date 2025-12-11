import React, { useState, useEffect } from 'react';
import ProdutoDetalhes from './ProdutoDetalhes';
import ProdutoCadastro from './ProdutoCadastro';
import SearchBar from "../../components/ui/SearchBar";
import toast from 'react-hot-toast';
declare global {
  interface Window {
    electronAPI: {
      getProdutos: () => Promise<any[]>;
      getGrupos: () => Promise<any[]>;
      addGrupo: (nome: string) => Promise<void>;
      getSubGrupos: () => Promise<any[]>;
      addSubGrupo: (nome: string) => Promise<void>;
    };
  }
}

export default function Produtos({ setPage }: { setPage: (page: string) => void }) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);

  // MODAIS
  const [modalGrupo, setModalGrupo] = useState(false);
  const [modalSubGrupo, setModalSubGrupo] = useState(false);
  const [comissaoGrupo, setComissaoGrupo] = useState("");

  // DADOS INTERNOS
  const [grupos, setGrupos] = useState<any[]>([]);
  const [subgrupos, setSubGrupos] = useState<any[]>([]);
  const [novoGrupo, setNovoGrupo] = useState("");
  const [novoSubGrupo, setNovoSubGrupo] = useState("");

  const carregarProdutos = async () => {
    setProdutos(await window.electronAPI.getProdutos());
  };

  const carregarGrupos = async () => {
    setGrupos(await window.electronAPI.getGrupos());
  };

  const carregarSubGrupos = async () => {
    setSubGrupos(await window.electronAPI.getSubGrupos());
  };

  const adicionarGrupo = async (novoGrupo,comissaoGrupo) => {
    try {
      const result = await window.electronAPI.addGrupo(novoGrupo,comissaoGrupo);
      setNovoGrupo("");
      setComissaoGrupo("");
      carregarGrupos();
      toast.success("grupo foi cadastrado com sucesso")
      return result;
    }
    catch (err) {
      toast.error("erro ao cadastrar grupo")
    }


  }
  const adicionarSubGrupo = async (novoSubGrupo) => {
    try {
      const result = await window.electronAPI.addSubGrupo(novoSubGrupo);
      setNovoSubGrupo("");
      carregarSubGrupos();
      toast.success("Subgrupo foi cadastrado com sucesso")
    }
    catch (err) {
      toast.error("erro ao cadastrar subgrupo")
    }


  }
  useEffect(() => {
    carregarProdutos();
    carregarGrupos();
    carregarSubGrupos();
  }, []);

  if (modoCadastro) {
    return (
      <ProdutoCadastro
        voltar={() => {
          setModoCadastro(false);
          carregarProdutos();
        }}
      />
    );
  }

  if (produtoSelecionado) {
    return (
      <ProdutoDetalhes
        produtoSelecionado={produtoSelecionado}
        voltar={() => {
          setProdutoSelecionado(null);
          carregarProdutos();
        }}
      />
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>

      {/* Botão Voltar */}
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
          marginBottom: '20px'
        }}
      >
        ← Voltar
      </button>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#1e3a8a' }}>Produtos</h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Botão Grupo */}
          <button
            onClick={() => setModalGrupo(true)}
            style={btnAzul}
          >
            ＋ Cadastrar Grupo
          </button>

          {/* Botão SubGrupo */}
          <button
            onClick={() => setModalSubGrupo(true)}
            style={btnAzul}
          >
            ＋ Cadastrar Subgrupo
          </button>

          {/* Botão Produto */}
          <button
            onClick={() => setModoCadastro(true)}
            style={btnAzul}
          >
            ＋ Novo Produto
          </button>
        </div>
      </div>

      {/* ------------------- MODAL GRUPO ------------------- */}
      {modalGrupo && (
        <Modal>
          <h3>Cadastrar Grupo</h3>

          <input
            style={inputModal}
            placeholder="Nome do grupo"
            value={novoGrupo}
            onChange={(e) => setNovoGrupo(e.target.value)}
          />
          <input
            style={inputModal}
            placeholder="Comissao"
            value={comissaoGrupo}
            onChange={(e) => setComissaoGrupo(e.target.value)}
          />
          <button
            style={btnSalvar}
            onClick={() => adicionarGrupo(novoGrupo,comissaoGrupo)}
          >Salvar</button>

          <h4>Grupos cadastrados:</h4>

          <table style={tabela}>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.id}>
                  <td>{g.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={() => setModalGrupo(false)} style={btnFechar}>Fechar</button>
        </Modal>
      )}

      {/* ------------------- MODAL SUBGRUPO ------------------- */}
      {modalSubGrupo && (
        <Modal>
          <h3>Cadastrar Subgrupo</h3>

          <input
            style={inputModal}
            placeholder="Nome do subgrupo"
            value={novoSubGrupo}
            onChange={(e) => setNovoSubGrupo(e.target.value)}
          />

        
          <button
            style={btnSalvar}
            onClick={() => { adicionarSubGrupo(novoSubGrupo) }}
          >Salvar</button>

          <h4>Subgrupos cadastrados:</h4>

          <table style={tabela}>
            <tbody>
              {subgrupos.map((s) => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={() => setModalSubGrupo(false)} style={btnFechar}>Fechar</button>
        </Modal>
      )}

      {/* ------------------- TABELA PRODUTOS ------------------- */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '20px',
        }}
      >
        <SearchBar
          canal="buscar-produtos"
          placeholder="Pesquisar produto por nome ou código de barras..."
          onResults={setProdutos}
        />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a', textAlign: 'left' }}>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Código de Barra</th>
              <th style={thStyle}>Grupo</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.CodigoProduto} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{p.CodigoProduto}</td>
                <td style={tdStyle}>{p.NomeProduto}</td>
                <td style={tdStyle}>{p.CodigoBarra}</td>
                <td style={tdStyle}>{p.CodigoGrupo}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setProdutoSelecionado(p)}
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

const thStyle: React.CSSProperties = {
  padding: '10px',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
};

/* ------------ COMPONENTE MODAL GENERICO ------------- */
function Modal({ children }: { children: any }) {
  return (
    <div style={modalFundo}>
      <div style={modalBox}>
        {children}
      </div>
    </div>
  );
}

/* ------------ ESTILOS ------------- */

const btnAzul: React.CSSProperties = {
  backgroundColor: '#1e3a8a',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
};

const boxTabela: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: '20px',
  marginTop: '20px'
};

const tabela: React.CSSProperties = {
  marginTop: '10px',
  width: '100%',
  borderCollapse: 'collapse'
};

const inputModal: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const btnSalvar: React.CSSProperties = {
  ...btnAzul,
  width: '100%',
  marginBottom: '15px'
};

const btnFechar: React.CSSProperties = {
  backgroundColor: '#b91c1c',
  color: 'white',
  padding: '8px 14px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  width: '100%'
};

const modalFundo: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox: React.CSSProperties = {
  background: "#fff",
  padding: "25px",
  borderRadius: "8px",
  width: "450px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
};

const th = { padding: "10px", fontWeight: 600 };
const td = { padding: "10px" };
const btnVer = {
  backgroundColor: "#1e3a8a",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer"
};
