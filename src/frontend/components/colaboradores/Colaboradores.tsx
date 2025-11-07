import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ColaboradorDetalhes from "./ColaboradorDetalhes";
import ColaboradorCadastro from "./ColaboradorCadastro";
import SearchBar from "../../components/ui/SearchBar";

interface Colaborador {
  id: number;
  nome: string;
  email: string;
  nivel?: string;
  setor?: string;
}

interface ColaboradoresProps {
  setPage: (page: string) => void;
}

export default function Colaboradores({ setPage }: ColaboradoresProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const nivelUsuario = usuarioLogado?.nivel;
  console.log(nivelUsuario)
  const carregarColaboradores = async () => {
    try {
      const lista = await window.ipcRenderer.invoke("get-colaboradores");

      // Garante que sempre teremos um array
      if (Array.isArray(lista)) {
        setColaboradores(lista);
      } else {
        console.warn("Resposta inesperada:", lista);
        setColaboradores([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar colaboradores");
      setColaboradores([]);
    }
  };

  const excluirColaborador = async (id) => {
    try {
      await window.ipcRenderer.invoke("delete-colaborador", id, usuarioLogado)
      toast.success("Colaborador excluido com sucesso")
      carregarColaboradores();
    }
    catch (err) {
      toast.error("Falha ao exluir colaborador")
    }
  }

  useEffect(() => {
    carregarColaboradores();
  }, []);

  if (modoCadastro) {
    return (
      <ColaboradorCadastro
        onVoltar={() => {
          setModoCadastro(false);
          carregarColaboradores();
        }}
      />
    );
  }

  if (colaboradorSelecionado) {
    return (
      <ColaboradorDetalhes
        colaboradorSelecionado={colaboradorSelecionado}
        voltar={() => {
          setColaboradorSelecionado(null);
          carregarColaboradores();
        }}
      />
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <button
        onClick={() => setPage("cadastros")}
        style={{
          backgroundColor: "#e5e7eb",
          color: "#1e3a8a",
          border: "none",
          borderRadius: "6px",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: "20px",
        }}
      >
        ← Voltar
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#1e3a8a" }}>Colaboradores</h2>
        <button
          onClick={() => setModoCadastro(true)}
          style={{
            backgroundColor: "#1e3a8a",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ＋ Novo Colaborador
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "20px",
        }}
      >
        <SearchBar
          canal="get-colaboradores"
          placeholder="Pesquisar Nome do colaborador"
          onResults={setColaboradores}
        />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#e5e7eb", color: "#1e3a8a", textAlign: "left" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>E-mail</th>
              <th style={thStyle}>Setor</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>{c.id}</td>
                <td style={tdStyle}>{c.nome}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.setor}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setColaboradorSelecionado(c)}
                    style={{
                      backgroundColor: "#1e3a8a",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      margin: '0px 5px'
                    }}
                  >
                    Visualizar
                  </button>

                  {nivelUsuario === "administrador" && (

                    <button
                      onClick={() => excluirColaborador(c.id)}
                      style={{
                        backgroundColor: "#1e3a8a",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Excluir
                    </button>
                  )
                  }



                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: 10, textAlign: "left" };
const tdStyle: React.CSSProperties = { padding: 10, borderBottom: "1px solid #ccc" };
