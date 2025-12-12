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
      getSubGruposByGrupo: (codigoGrupo: number) => Promise<any[]>;
      atualizarGrupo: () => Promise<any[]>;
    };
  }
}

export default function Produtos({ setPage }: { setPage: (page: string) => void }) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);
  const [subGrupoEditando, setSubGrupoEditando] = useState(null);

  // MODAIS
  const [modalGrupo, setModalGrupo] = useState(false);
  const [modalSubGrupo, setModalSubGrupo] = useState(false);
  const [comissaoGrupo, setComissaoGrupo] = useState("");

  // DADOS INTERNOS
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<number | "">("");
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

  const adicionarGrupo = async (novoGrupo, comissaoGrupo) => {
    try {
      const result = await window.electronAPI.addGrupo(novoGrupo, comissaoGrupo);
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
  const editarGrupo = (grupo) => {
    setGrupoEditando(grupo);
    setNovoGrupo(grupo.nome);
    setComissaoGrupo(grupo.comissao || "");
    setModalGrupo(true);
  };


  const atualizarGrupo = async () => {
    try {
      await window.electronAPI.atualizarGrupo(
        grupoEditando.id,
        novoGrupo,
        comissaoGrupo
      );

      toast.success("Grupo atualizado com sucesso!");

      setGrupoEditando(null);
      setNovoGrupo("");
      setComissaoGrupo("");

      carregarGrupos();
    } catch (err) {
      toast.error("Erro ao atualizar grupo");
    }
  };
  const excluirGrupo = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este grupo?"))
      return;

    try {
      await window.electronAPI.excluirGrupo(id);
      toast.success("Grupo excluído!");
      carregarGrupos();
    } catch (err) {
      toast.error("Erro ao excluir grupo");
    }
  };

  const adicionarSubGrupo = async () => {
    try {
      if (!novoSubGrupo.trim()) {
        toast.error("Informe o nome do subgrupo");
        return;
      }

      if (!grupoSelecionado) {
        toast.error("Selecione um grupo antes de cadastrar um subgrupo");
        return;
      }

      await window.electronAPI.addSubGrupo(novoSubGrupo, Number(grupoSelecionado));

      setNovoSubGrupo("");
      carregarSubGrupos();

      toast.success("Subgrupo cadastrado com sucesso!");
    } catch (err) {
      toast.error("Erro ao cadastrar subgrupo");
    }
  };
  const atualizarSubGrupo = async () => {
    try {
      await window.electronAPI.atualizarSubGrupo(
        subGrupoEditando.id,
        novoSubGrupo,
        grupoSelecionado
      );

      toast.success("Subgrupo atualizado!");

      setSubGrupoEditando(null);
      setNovoSubGrupo("");
      setGrupoSelecionado("");

      carregarSubGrupos();
    } catch (err) {
      toast.error("Erro ao atualizar subgrupo");
    }
  };

  const excluirSubgrupo = async (id) => {
    if (!confirm("Deseja realmente excluir este subgrupo?"))
      return;

    try {
      await window.electronAPI.excluirSubGrupo(id);
      toast.success("Subgrupo excluído!");
      carregarSubGrupos();
    } catch (err) {
      toast.error("Erro ao excluir subgrupo");
    }
  };

  useEffect(() => {
    const carregarSubPorGrupo = async () => {
      if (!grupoSelecionado) {
        setSubGrupos([]);
        return;
      }

      const lista = await window.electronAPI.getSubGruposByGrupo(Number(grupoSelecionado));
      setSubGrupos(lista);
    };

    carregarSubPorGrupo();
  }, [grupoSelecionado]);


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
            onClick={() =>
              grupoEditando
                ? atualizarGrupo()
                : adicionarGrupo(novoGrupo, comissaoGrupo)
            }
          >
            {grupoEditando ? "Atualizar" : "Salvar"}
          </button>


          <h4>Grupos cadastrados:</h4>

          <div style={boxTabelaModal}>
            <table style={tabelaModal}>
              <thead>
                <tr>
                  <th style={thModal}>Nome</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((g, index) => (
                  <tr key={g.id} style={index % 2 === 0 ? linhaPar : linhaImpar}>
                    <td style={tdModal}>{g.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


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

          <select
            style={inputStyle}
            value={grupoSelecionado}
            onChange={(e) => setGrupoSelecionado(e.target.value)}
          >
            <option value="">Selecione...</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
          <button
            style={btnSalvar}
            onClick={() =>
              subGrupoEditando
                ? atualizarSubGrupo()
                : adicionarSubGrupo(novoSubGrupo, grupoSelecionado)
            }
          >
            {subGrupoEditando ? "Atualizar" : "Salvar"}
          </button>

          {grupoSelecionado && (
            <>
              <h4>SubGrupos cadastrados:</h4>

              <div style={boxTabelaModal}>
                <table style={tabelaModal}>
                  <thead>
                    <tr>
                      <th style={thModal}>Nome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subgrupos.map((g, index) => (
                      <tr key={g.id} style={index % 2 === 0 ? linhaPar : linhaImpar}>
                        <td style={tdModal}>{g.nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
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
const btnEditar: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

const btnExcluir: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};
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
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  marginBottom: '10px',
  outline: 'none',
  transition: '0.2s border-color',
  fontSize: '15px',
  boxSizing: 'border-box',
};
/* -------- MELHOR ESTILO DAS TABELAS DO MODAL -------- */

const boxTabelaModal: React.CSSProperties = {
  maxHeight: "200px",
  overflowY: "auto",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  marginTop: "10px",
  marginBottom: "10px"
};

const tabelaModal: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thModal: React.CSSProperties = {
  backgroundColor: "#1e3a8a",
  color: "white",
  padding: "10px",
  textAlign: "left",
  fontWeight: 600,
  position: "sticky",
  top: 0,
};

const tdModal: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
};

const linhaPar: React.CSSProperties = {
  backgroundColor: "#ffffff",
};

const linhaImpar: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
};
