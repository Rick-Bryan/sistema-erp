import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CaixaDetalhes from "./CaixaDetalhes";

import SearchBar from "../../components/ui/SearchBar";
import CaixaAbertura from "./CaixaAbertura";


interface Colaborador {
  id: number;
  nome: string;
  email: string;
  nivel?: string;
  setor?: string;
  ativo?: number; // <--- adicionado
}

interface CaixaProps {
  setPage: (page: string) => void;
  setCaixaSelecionado: (id: number) => void;
}

export default function Caixa({ setPage, setCaixaSelecionado }: CaixaProps) {

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const nivelUsuario = usuarioLogado?.nivel;
  const [modoCadastro, setModoCadastro] = useState(false);
  const [sessoes, setSessoes] = useState([]);




  async function carregarSessoes() {

    const lista = await window.ipcRenderer.invoke("get-sessoes-caixa");

    if (Array.isArray(lista)) {
      setSessoes(lista);
    } else {
      console.warn("Resposta inesperada:", lista);
      setSessoes([]);
    }
  }

  useEffect(() => {
    carregarSessoes();
  }, []);


  if (modoCadastro) {
    return (
      <CaixaAbertura
        onVoltar={() => setModoCadastro(false)}
        onCarregarSessoes={carregarSessoes}
      />

    );
  }
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <button
        onClick={() => setPage('movimentacao')}
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
        <h2 style={{ color: '#1e3a8a' }}>Caixa</h2>
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
          ＋ Abrir novo caixa
        </button>
      </div>
      {/* Tabela */}
      <div
        style={boxTabelaModal}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a', textAlign: 'left' }}>
              <th style={thStyle}>Codigo</th>
              <th style={thStyle}>Colaborador</th>
              <th style={thStyle}>Data_Abertura</th>
              <th style={thStyle}>Valor_Abertura</th>
              <th style={thStyle}>Data_Fechamento</th>
              <th style={thStyle}>Valor_Fechamento</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>

            </tr>
          </thead>
          <tbody>

            {sessoes.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>{s.id}</td>
                <td style={tdStyle}>{s.usuario_id}</td>
                <td style={tdStyle}>{new Date(s.criado_em).toLocaleString('pt-BR')}</td>
                <td style={tdStyle}>{s.valor_abertura}</td>
                <td style={tdStyle}> {s.fechado_em && s.fechado_em !== "0000-00-00 00:00:00"
                  ? new Date(s.fechado_em).toLocaleString('pt-BR')
                  : "Ainda aberto"}</td>
                <td style={tdStyle}>{s.valor_fechamento || 'Ainda aberto'}</td>
                <td style={tdStyle}>{s.status}</td>
                <td style={tdStyle}><button
                  onClick={() => {
                    setCaixaSelecionado(s.id); // <-- manda tudo
                    setPage("caixa-detalhes");
                  }}
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: 8,
                  }}
                >
                  Visualizar
                </button></td>
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
const boxTabelaModal: React.CSSProperties = {
  maxHeight: '650px',
  overflowY: "auto",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  marginTop: "10px",
  marginBottom: "10px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"

};
