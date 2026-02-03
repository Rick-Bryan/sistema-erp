import { useState } from "react";
import toast from "react-hot-toast";
import { toastErro } from "../helpers/toastErro";

interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface ClienteCadastroProps {
  cliente?: Cliente | null;
  onVoltar: () => void;
  onSalvo: () => void;
}

export default function ClienteCadastro({ cliente, onVoltar, onSalvo }: ClienteCadastroProps) {
  const [form, setForm] = useState<Cliente>({
    nome: cliente?.nome || "",
    email: cliente?.email || "",
    telefone: cliente?.telefone || "",
    endereco: cliente?.endereco || "",
  });

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let resposta;

      if (cliente?.id) {
        resposta = await window.ipcRenderer.invoke("update-cliente", { id: cliente.id, ...form });
      } else {
        resposta = await window.ipcRenderer.invoke("add-cliente", form);
      }

      if (resposta.sucesso) {
        toast.success(cliente ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
        onSalvo?.(); // evita erro se a função não for passada
      } else {
        toast.error(resposta.mensagem || "Erro ao salvar cliente.");
      }
    } catch (err) {
      toastErro(err)
    }
  };

  return (
    <div style={container}>
      <button onClick={onVoltar} style={btnVoltar}>← Voltar</button>

      <div style={card}>
        <h2 style={titulo}>{cliente ? "Editar Cliente" : "Novo Cliente"}</h2>

        <form onSubmit={handleSalvar} style={formStyle}>
          <div style={linha}>
            <label style={label}>Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              style={input}
            />
          </div>

          <div style={linha}>
            <label style={label}>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={input}
            />
          </div>

          <div style={linha}>
            <label style={label}>Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              style={input}
            />
          </div>

          <div style={linha}>
            <label style={label}>Endereço</label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              style={input}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 30 }}>
            <button type="submit" style={btnSalvar}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 🎨 Estilos — padronizados igual ao ColaboradorCadastro
const container: React.CSSProperties = {
  padding: "20px",
  backgroundColor: "#f5f7fa",
  minHeight: "100vh",
};

const card: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  padding: "30px",
  maxWidth: "800px",
  margin: "0 auto",
};

const titulo: React.CSSProperties = {
  color: "#1e3a8a",
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: "20px",
  textAlign: "center",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const linha: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const label: React.CSSProperties = {
  fontWeight: 600,
  color: "#1e3a8a",
  marginBottom: "5px",
};

const input: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const btnVoltar: React.CSSProperties = {
  backgroundColor: "#e5e7eb",
  color: "#1e3a8a",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: 600,
  marginBottom: "20px",
};

const btnSalvar: React.CSSProperties = {
  backgroundColor: "#1e3a8a",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
};
