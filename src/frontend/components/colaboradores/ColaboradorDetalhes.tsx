import React, { useState } from "react";
import toast from "react-hot-toast";
import { toastErro } from "../helpers/toastErro";

declare global {
  interface Window {
    electronAPI: {
      salvarColaborador: (colaborador: any) => Promise<void>;
    };
  }
}
interface Colaborador {
  id: number;
  nome: string;
  email: string;
  nivel: string;
  setor: string;
  ativo: number; // 1 ou 0
  criado_em: string;
}
interface Props {
  colaboradorSelecionado: Colaborador;
  voltar: () => void;
}

export default function ColaboradorDetalhes({ colaboradorSelecionado, voltar }: Props) {
  const [colaborador, setColaborador] = useState<Colaborador>({ ...colaboradorSelecionado });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setColaborador((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      await window.electronAPI.salvarColaborador(colaborador);
      toast.success("Colaborador atualizado com sucesso!");
      voltar();
    } catch (err) {
      console.error(err);
      toastErro(err)
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>👤 Detalhes do Colaborador</h2>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Nome</label>
          <input
            style={inputStyle}
            name="nome"
            value={colaborador.nome || ""}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>E-mail</label>
          <input
            style={inputStyle}
            name="email"
            value={colaborador.email || ""}
            onChange={handleChange}
          />
        </div>



        {/* Nível */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Nível</label>
          <select
            style={inputStyle}
            name="nivel"
            value={colaborador.nivel || ""}
            onChange={handleChange}
          >
            <option value="administrador">Administrador</option>
            <option value="vendedor">Vendedor</option>
            <option value="financeiro">Financeiro</option>
            <option value="estoquista">Estoquista</option>
          </select>
        </div>

        {/* Setor */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Setor</label>
          <input
            style={inputStyle}
            name="setor"
            value={colaborador.setor || ""}
            onChange={handleChange}
          />
        </div>

        {/* Ativo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Ativo</label>
          <select
            style={inputStyle}
            name="ativo"
            value={colaborador.ativo == 1 ? "1" : "0"} // compara com == para aceitar boolean ou número
            onChange={(e) =>
              setColaborador((prev) => ({ ...prev, ativo: e.target.value === "1" ? 1 : 0 }))
            }
          >
            <option value="1">Sim</option>
            <option value="0">Não</option>
          </select>

        </div>
        {/* Criado em (somente leitura) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Criado em</label>
          <input
            style={{ ...inputStyle, backgroundColor: "#f3f4f6" }}
            name="criado_em"
            value={colaborador.criado_em ? new Date(colaborador.criado_em).toLocaleDateString("pt-BR") : ""}
            readOnly
          />
        </div>
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            justifyContent: "flex-start",
          }}
        >
          <button onClick={handleSalvar} style={buttonStyle}>
            Salvar
          </button>
          <button
            onClick={voltar}
            style={{ ...buttonStyle, backgroundColor: "#6b7280" }}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "5px",
  fontWeight: 600,
  color: "#1e3a8a",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  marginBottom: "10px",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#1e3a8a",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 500,
};
