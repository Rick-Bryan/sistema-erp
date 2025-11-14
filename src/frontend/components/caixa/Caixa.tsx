import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ColaboradorDetalhes from "./CaixaDetalhes";
import ColaboradorCadastro from "./CaixaCadastro";
import SearchBar from "../../components/ui/SearchBar";

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
}

export default function Caixa({ setPage }: CaixaProps) {

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const nivelUsuario = usuarioLogado?.nivel;
  

  return (
    <div>
        TESTE
    </div>
    )
}

const thStyle: React.CSSProperties = { padding: 10, textAlign: "left" };
const tdStyle: React.CSSProperties = { padding: 10, borderBottom: "1px solid #ccc" };
