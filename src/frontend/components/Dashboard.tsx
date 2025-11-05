import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

declare global {
  interface Window {
    electronAPI: {
      getProdutos: () => Promise<any[]>;
      getFabricantes: () => Promise<any[]>;
    };
  }
}

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
        cursor: onClick ? "pointer" : "default",
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1e3a8a" }}>{value}</div>
      {subtitle && <div style={{ marginTop: 8, fontSize: 13, color: "#9ca3af" }}>{subtitle}</div>}
    </div>
  );
}

export default function Dashboard({ setPage }: { setPage?: (p: string) => void }) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [fabricantes, setFabricantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [p, f] = await Promise.allSettled([
          window.electronAPI.getProdutos(),
          window.electronAPI.getFabricantes?.() ?? Promise.resolve([]),
        ]);

        if (mounted) {
          setProdutos(p.status === "fulfilled" ? p.value : []);
          setFabricantes(f.status === "fulfilled" ? f.value : []);
        }
      } catch (err) {
        console.error("Erro carregando dados do dashboard", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Métricas básicas
  const totalProdutos = produtos.length;
  const totalFabricantes = fabricantes.length;
  const estoqueTotal = produtos.reduce((acc, item) => acc + (Number(item.EstoqueAtual) || 0), 0);

  // Gráfico: produtos por mês
  const produtosPorMes: Record<string, number> = {};
  produtos.forEach((p) => {
    const data = new Date(p.DataCadastro);
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
    produtosPorMes[mesAno] = (produtosPorMes[mesAno] || 0) + 1;
  });

  const dadosGrafico = Object.entries(produtosPorMes)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => {
      const [mA, yA] = a.mes.split("/").map(Number);
      const [mB, yB] = b.mes.split("/").map(Number);
      return yA === yB ? mA - mB : yA - yB;
    });

  // Últimos produtos
  const ultimos = [...produtos]
    .sort((a, b) => new Date(b.DataCadastro).getTime() - new Date(a.DataCadastro).getTime())
    .slice(0, 6);

  return (
    <div style={{ padding: 24, backgroundColor: "#f5f7fa", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Painel</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>Visão geral rápida do sistema</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setPage?.("cadastros")}
            style={btnOutline}
          >
            Cadastros
          </button>
          <button
            onClick={() => setPage?.("produtos")}
            style={btnPrimary}
          >
            Ver Produtos
          </button>
        </div>
      </header>

      {/* Cards */}
      <section style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard onClick={() => setPage?.("produtos")} title="Produtos" value={totalProdutos} subtitle="Total de SKUs cadastrados" />
        <StatCard onClick={() => setPage?.("fabricantes")} title="Fabricantes" value={totalFabricantes} subtitle="Fornecedores cadastrados" />
        <StatCard title="Estoque total" value={estoqueTotal} subtitle="Unidades em estoque" />
        
      </section>

      {/* Gráfico de linha (Sparkline) */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 6px 18px rgba(16,24,40,0.04)",
          marginBottom: 24,
        }}
      >
        <h3 style={{ margin: 0, color: "#0f172a" }}>Histórico de Cadastros de Produtos</h3>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
          Quantos produtos foram cadastrados por mês.
        </p>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#1e3a8a"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimos produtos */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 6px 18px rgba(16,24,40,0.04)",
        }}
      >
        <h3 style={{ margin: 0, color: "#0f172a" }}>Últimos produtos</h3>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>Mais recentes cadastrados.</p>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eef2f7" }}>
              <th style={th}>Código</th>
              <th style={th}>Nome</th>
              <th style={th}>Estoque</th>
              <th style={th}>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {ultimos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 18, color: "#9ca3af" }}>Nenhum produto encontrado</td>
              </tr>
            ) : (
              ultimos.map((p) => (
                <tr key={p.CodigoProduto} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={td}>{p.CodigoProduto}</td>
                  <td style={td}>{p.NomeProduto}</td>
                  <td style={td}>{p.EstoqueAtual ?? 0}</td>
                  <td style={td}>{new Date(p.DataCadastro).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Estilos reutilizáveis
const btnPrimary: React.CSSProperties = {
  backgroundColor: "#1e3a8a",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const btnOutline: React.CSSProperties = {
  backgroundColor: "#e6f2ff",
  color: "#1e3a8a",
  border: "1px solid #bfdbfe",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  color: "#6b7280",
  fontWeight: 500,
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: "10px 8px",
  fontSize: 14,
  color: "#0f172a",
};
