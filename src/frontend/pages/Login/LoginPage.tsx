import React, { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await window.electronAPI.login({ email, senha });

      if (response.sucesso) {
        localStorage.setItem("usuarioLogado", JSON.stringify(response.usuario));
        toast.success("Login realizado com sucesso!");
        onLoginSuccess(response.usuario);
      } else {
        toast.error(response.mensagem || "Falha no login.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <form onSubmit={handleLogin} style={form}>
        <h2>🔐 Login no ERP</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={input}
        />
        <button type="submit" disabled={loading} style={button}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f3f4f6",
};
const form = {
  display: "flex",
  flexDirection: "column",
  padding: 30,
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};
const input = {
  marginBottom: 15,
  padding: 10,
  fontSize: 14,
};
const button = {
  background: "#1E3A8A",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};
