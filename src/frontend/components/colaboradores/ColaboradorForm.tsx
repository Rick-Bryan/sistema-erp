import React, { useState } from "react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    electronAPI: {
      atualizarColaborador: (colaborador: any) => Promise<void>;
    };
  }
}

interface Colaborador {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  nivel?: string;
  setor?: string;
}

interface Props {
  colaboradorSelecionado?: Colaborador | null;
  voltar: () => void;
}

export default function ColaboradorForm({ colaboradorSelecionado, voltar }: Props) {
  const [colaborador, setColaborador] = useState<Colaborador>(
    colaboradorSelecionado || { nome: "", email: "", senha: "", nivel: "", setor: "" }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setColaborador((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      if (!colaborador.nome || !colaborador.email) {
        toast.error("Preencha os campos obrigatórios.");
        return;
      }

      await window.electronAPI.atualizarColaborador(colaborador);
      toast.success("Colaborador salvo com sucesso!");
      voltar();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar colaborador.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>
        {colaboradorSelecionado ? "✏️ Editar Colaborador" : "➕ Novo Colaborador"}
      </h2>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Nome</label>
          <input
            style={inputStyle}
            name="nome"
            value={colaborador.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>E-mail</label>
          <input
            style={inputStyle}
            name="email"
            value={colaborador.email}
            onChange={handleChange}
            required
          />
        </div>

        {!colaboradorSelecionado && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Senha</label>
            <input
              style={inputStyle}
              name="senha"
              type="password"
              value={colaborador.senha || ""}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Nível</label>
          <select name="nivel" style={inputStyle} value={colaborador.nivel || ""} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="admin">Administrador</option>
            <option value="colaborador">Colaborador</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Setor</label>
          <input
            style={inputStyle}
            name="setor"
            value={colaborador.setor || ""}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button onClick={handleSalvar} style={buttonStyle}>
            Salvar
          </button>
          <button onClick={voltar} style={{ ...buttonStyle, backgroundColor: "#6b7280" }}>
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
