import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import ClienteCadastro from './ClientesCadastro';
import ClienteDetalhes from './ClientesDetalhes';
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
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [modoCadastro, setModoCadastro] = useState(false);
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const nivelUsuario = usuarioLogado?.nivel || "";

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const lista = await window.ipcRenderer.invoke("get-clientes");

      // Garante que sempre teremos um array
      if (Array.isArray(lista)) {
        setClientes(lista);
      } else {
        console.warn("Resposta inesperada:", lista);
        setClientes([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar clientes");
      setClientes([]);
    }
  };
  const excluirCliente = async (id) => {
    try {
      const resposta = await window.ipcRenderer.invoke("delete-cliente", { id, usuario: usuarioLogado });

      if (resposta.sucesso) {
        toast.success("Cliente excluído com sucesso");
        carregarClientes();
      } else {
        toast.error(resposta.mensagem || "Falha ao excluir cliente");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao excluir cliente");
    }
  };

  if (modoCadastro) {
    return (
      <ClienteCadastro
        onVoltar={() => {
          setModoCadastro(false);
          carregarClientes();
        }}
      />
    );
  }
  if (clienteSelecionado) {
    return (
      <ClienteDetalhes
        clienteSelecionado={clienteSelecionado}
        onVoltar={() => {
          setClienteSelecionado(null);
          carregarClientes();
        }}
      />
    )
  }
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1e3a8a' }}>Clientes</h2>
        <button
          onClick={() => setModoCadastro(true)}
          style={{
            backgroundColor: '#1e3a8a',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',

          }}
        >
          ＋ Novo Cliente
        </button>
      </div>
      {/* Tabela */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '20px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a', textAlign: 'left' }}>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>

              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{c.nome}</td>
                <td style={tdStyle}>{c.email}</td>

                <td style={tdStyle}>
                  <button
                    onClick={() => setClienteSelecionado(c)}
                    style={{
                      backgroundColor: '#1e3a8a',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      margin: '0px 5px'
                    }}
                  >
                    Visualizar
                  </button>
                  {nivelUsuario === "administrador" && (

                    <button
                      onClick={() => excluirCliente(c.id)}
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

const thStyle: React.CSSProperties = { padding: 10, textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: 10, borderBottom: '1px solid #ccc' };
