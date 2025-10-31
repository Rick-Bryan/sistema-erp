import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron";

interface Produto {
  CodigoProduto: number;
  CodigoBarra: string;
  NomeProduto: string;
  CodigoGrupo?: number;
  CodigoSubGrupo: number;
  CodigoFabricante?: number;
  DataCadastro: string;
  UnidadeEmbalagem?: string;
  FracaoVenda: number;
  NCM: string;
  Eliminado: number;
  IPI: string;
  ReducaoIPI: string;
}

const ProdutoList: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const carregarProdutos = async () => {
    const lista: Produto[] = await ipcRenderer.invoke("get-produtos");
    setProdutos(lista);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#1E3A8A" }}>Lista de Produtos</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead style={{ backgroundColor: "#E0E7FF", color: "#1E3A8A" }}>
          <tr>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Código</th>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Nome</th>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Código de Barra</th>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Grupo</th>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Subgrupo</th>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Unidade</th>
            <th style={{ padding: 8, border: "1px solid #CBD5E1" }}>Preço</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.CodigoProduto} style={{ backgroundColor: "#F8FAFC" }}>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.CodigoProduto}</td>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.NomeProduto}</td>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.CodigoBarra}</td>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.CodigoGrupo || "-"}</td>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.CodigoSubGrupo}</td>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.UnidadeEmbalagem || "-"}</td>
              <td style={{ padding: 8, border: "1px solid #CBD5E1" }}>{p.IPI}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProdutoList;
