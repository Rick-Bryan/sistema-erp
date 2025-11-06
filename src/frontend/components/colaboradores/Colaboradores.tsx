import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const [modoCadastro, setModoCadastro] = useState(false);
  const [colaboradorEdicao, setColaboradorEdicao] = useState<Colaborador | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", nivel: "vendedor", setor: "" });

  // 🔹 Carrega a lista de colaboradores
  const carregarColaboradores = async () => {
    try {
      const data = await window.ipcRenderer.invoke("get-colaboradores");
      setColaboradores(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar colaboradores");
    }
  };

  useEffect(() => {
    carregarColaboradores();
  }, []);

  // 🔹 Enviar formulário (criar ou atualizar)
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (colaboradorEdicao) {
        await window.ipcRenderer.invoke("update-colaborador", { id: colaboradorEdicao.id, ...form });
        toast.success("Colaborador atualizado!");
      } else {
        await window.ipcRenderer.invoke("add-colaborador", form);
        toast.success("Colaborador cadastrado!");
      }

      setModoCadastro(false);
      setColaboradorEdicao(null);
      setForm({ nome: "", email: "", senha: "", nivel: "vendedor", setor: "" });
      carregarColaboradores();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar colaborador");
    }
  };

  // 🔹 Excluir colaborador
  const handleExcluir = async (id: number) => {
    if (!confirm("Deseja realmente excluir este colaborador?")) return;
    try {
      await window.ipcRenderer.invoke("delete-colaborador", id);
      toast.success("Colaborador removido!");
      carregarColaboradores();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir colaborador");
    }
  };

  // 🔹 Abre formulário para editar
  const handleEditar = (colaborador: Colaborador) => {
    setColaboradorEdicao(colaborador);
    setForm({
      nome: colaborador.nome,
      email: colaborador.email,
      senha: "",
      nivel: colaborador.nivel || "vendedor",
      setor: colaborador.setor || "",
    });
    setModoCadastro(true);
  };

  if (modoCadastro) {
    return (
      <div style={container}>
        <h2 style={{ color: "#1e3a8a" }}>
          {colaboradorEdicao ? "Editar Colaborador" : "Novo Colaborador"}
        </h2>
        <form onSubmit={handleSalvar} style={formStyle}>
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputStyle}
          />
          {!colaboradorEdicao && (
            <input
              type="password"
              placeholder="Senha"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required
              style={inputStyle}
            />
          )}
          <select
            value={form.nivel}
            onChange={(e) => setForm({ ...form, nivel: e.target.value })}
            style={inputStyle}
          >
            <option value="administrador">Administrador</option>
            <option value="vendedor">Vendedor</option>
            <option value="financeiro">Financeiro</option>
            <option value="estoquista">Estoquista</option>
          </select>

          <input
            type="text"
            placeholder="Setor"
            value={form.setor}
            onChange={(e) => setForm({ ...form, setor: e.target.value })}
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="submit" style={btnSalvar}>Salvar</button>
            <button type="button" onClick={() => setModoCadastro(false)} style={btnCancelar}>
              ← Voltar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div  style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <button onClick={() => setPage("cadastros")} style={btnVoltar}>← Voltar</button>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#1e3a8a' }}>Colaboradores</h2>
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
          ＋ Novo Colaborador
        </button>
      </div>
      <div style={tabelaContainer}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>E-mail</th>
              <th style={thStyle}>Nível</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((c) => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.id}</td>
                <td style={tdStyle}>{c.nome}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.nivel}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEditar(c)} style={btnEditar}>Visualizar</button>
                  <button onClick={() => handleExcluir(c.id)} style={btnExcluir}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const container = { padding: "20px", background: "#f5f7fa", minHeight: "100vh" };
const tabelaContainer = { background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };
const theadStyle = { backgroundColor: "#e5e7eb", color: "#1e3a8a", textAlign: "left" };
const thStyle = { padding: 10 };
const tdStyle = { padding: 10, borderBottom: "1px solid #e5e7eb" };
const btnVoltar = { background: "#e5e7eb", color: "#1e3a8a", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 };
const btnNovo = { background: "#1e3a8a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 6, fontWeight: 600, cursor: "pointer" };
const formStyle = { display: "flex", flexDirection: "column", width: "300px" };
const inputStyle = { marginBottom: 10, padding: 8, borderRadius: 5, border: "1px solid #ccc" };
const btnSalvar = { background: "#1e3a8a", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer" };
const btnCancelar = { background: "#ccc", color: "#000", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer" };
const btnEditar = { background: "#2563eb", color: "#fff", border: "none", padding: "5px 8px", borderRadius: 4, cursor: "pointer", marginRight: 5 };
const btnExcluir = { background: "#dc2626", color: "#fff", border: "none", padding: "5px 8px", borderRadius: 4, cursor: "pointer" };
