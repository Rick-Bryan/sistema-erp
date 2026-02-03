import React, { useState } from "react";
import toast from "react-hot-toast";
import { toastErro } from "../helpers/toastErro";

declare global {
  interface Window {
    electronAPI: {
      salvarCliente: (cliente: any) => Promise<void>;
    };
  }
}

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  data_cadastro: string;
  data_atualizacao: string;
}

interface Props {
  clienteSelecionado: Cliente;
  onVoltar: () => void;
}

export default function ClienteDetalhes({ clienteSelecionado, onVoltar }: Props) {
  const [cliente, setCliente] = useState<Cliente>({ ...clienteSelecionado });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      await window.electronAPI.salvarCliente(cliente);
      toast.success("Cliente atualizado com sucesso!");
      onVoltar();
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
      <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>👤 Detalhes do Cliente</h2>

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
        {/* Nome */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Nome</label>
          <input
            style={inputStyle}
            name="nome"
            value={cliente.nome || ""}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>E-mail</label>
          <input
            style={inputStyle}
            name="email"
            value={cliente.email || ""}
            onChange={handleChange}
          />
        </div>

        {/* Telefone */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Telefone</label>
          <input
            style={inputStyle}
            name="telefone"
            value={cliente.telefone || ""}
            onChange={handleChange}
          />
        </div>

        {/* Endereço */}
        <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Endereço</label>
          <textarea
            style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
            name="endereco"
            value={cliente.endereco || ""}
            onChange={handleChange}
          />
        </div>

        {/* Datas */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Data de Cadastro</label>
          <input
            style={{ ...inputStyle, backgroundColor: "#f3f4f6" }}
            value={
              cliente.data_cadastro
                ? new Date(cliente.data_cadastro).toLocaleDateString("pt-BR")
                : ""
            }
            readOnly
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Última Atualização</label>
          <input
            style={{ ...inputStyle, backgroundColor: "#f3f4f6" }}
            value={
              cliente.data_atualizacao
                ? new Date(cliente.data_atualizacao).toLocaleDateString("pt-BR")
                : ""
            }
            readOnly
          />
        </div>

        {/* Botões */}
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
            onClick={onVoltar}
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
