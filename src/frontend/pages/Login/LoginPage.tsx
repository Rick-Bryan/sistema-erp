import React, { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: any) => void;
}) {
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
        toast.error(response.mensagem || "Usuário ou senha incorretos.");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <form onSubmit={handleLogin} style={form}>
        <h2 style={titulo}>🔐 Acesso ao Sistema ERP</h2>

        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={input}
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={input}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...button,
            backgroundColor: loading ? "#93C5FD" : "#1E3A8A",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p style={footerText}>© {new Date().getFullYear()} Consult7 ERP</p>
      </form>
    </div>
  );
}

// 🎨 Estilos

const container: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "linear-gradient(135deg, #E0E7FF, #F3F4F6)",
  width: "100vw",
};

const form: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: "40px 30px",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  width: "320px",
  maxWidth: "90%",
};

const titulo: React.CSSProperties = {
  textAlign: "center",
  color: "#1E3A8A",
  marginBottom: 25,
  fontSize: 20,
  fontWeight: 600,
};

const input: React.CSSProperties = {
  marginBottom: 15,
  padding: 10,
  fontSize: 14,
  border: "1px solid #D1D5DB",
  borderRadius: 6,
  outline: "none",
  transition: "border 0.2s",
};

const button: React.CSSProperties = {
  background: "#1E3A8A",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 500,
  transition: "background 0.3s",
};

const footerText: React.CSSProperties = {
  marginTop: 20,
  fontSize: 12,
  textAlign: "center",
  color: "#6B7280",
};
