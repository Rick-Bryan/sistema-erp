import React, { useState } from "react";
import { ipcRenderer } from "electron";

const ProdutoForm: React.FC<{ onProdutoAdicionado: () => void }> = ({ onProdutoAdicionado }) => {
  const [nome, setNome] = useState("");
  const [codigoBarra, setCodigoBarra] = useState("");
  const [codigoGrupo, setCodigoGrupo] = useState<number | "">("");
  const [codigoSubGrupo, setCodigoSubGrupo] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ipcRenderer.invoke("add-produto", {
      CodigoProduto: Math.floor(Math.random() * 100000), // para teste
      NomeProduto: nome,
      CodigoBarra: codigoBarra,
      CodigoGrupo: codigoGrupo || null,
      CodigoSubGrupo: codigoSubGrupo || 1,
      DataCadastro: new Date(),
      FracaoVenda: 1,
      NCM: "00000000",
      Eliminado: 0,
      IPI: 0,
      ReducaoIPI: 0,
    });
    setNome("");
    setCodigoBarra("");
    setCodigoGrupo("");
    setCodigoSubGrupo("");
    onProdutoAdicionado();
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, backgroundColor: "#F1F5F9", marginTop: 20 }}>
      <h2 style={{ color: "#1E3A8A" }}>Adicionar Produto</h2>
      <div style={{ marginBottom: 10 }}>
        <label>Nome:</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required style={{ marginLeft: 10 }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Código de Barra:</label>
        <input value={codigoBarra} onChange={(e) => setCodigoBarra(e.target.value)} required style={{ marginLeft: 10 }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Grupo:</label>
        <input type="number" value={codigoGrupo} onChange={(e) => setCodigoGrupo(Number(e.target.value))} style={{ marginLeft: 10 }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Subgrupo:</label>
        <input type="number" value={codigoSubGrupo} onChange={(e) => setCodigoSubGrupo(Number(e.target.value))} style={{ marginLeft: 10 }} />
      </div>
      <button type="submit" style={{ backgroundColor: "#1E3A8A", color: "#FFF", padding: "5px 15px", border: "none", borderRadius: 5 }}>
        Adicionar
      </button>
    </form>
  );
};

export default ProdutoForm;
