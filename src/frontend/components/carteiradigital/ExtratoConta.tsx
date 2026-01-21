import { useEffect, useState } from "react";

export default function ExtratoConta({ setPage, params }: any) {
  const contaId = params?.id;

  const [movs, setMovs] = useState<any[]>([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  async function carregar() {
    const res = await window.ipcRenderer.invoke("carteira-extrato", {
      conta_id: contaId,
      inicio,
      fim
    });

    const { saldoInicial, movimentos } = res;

    let saldo = Number(saldoInicial || 0);

    const formatado = (movimentos || []).map((m: any) => {
      saldo += m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor);
      return { ...m, saldo };
    });

    setMovs(formatado);
  }


  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setPage("carteira-digital")} style={btnVoltar}>
        ← Voltar
      </button>

      <h2>Extrato da Conta #{contaId}</h2>

      {/* FILTROS */}
      <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
        <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
        <input type="date" value={fim} onChange={e => setFim(e.target.value)} />
        <button onClick={carregar}>Filtrar</button>
      </div>

      <table width="100%">
        <thead style={theadRow}>
          <tr>
            <th style={th}>Data</th>
            <th style={th}>Descrição</th>
            <th style={th}>Entrada</th>
            <th style={th}>Saída</th>
            <th style={th}>Saldo</th>
          </tr>
        </thead>

        <tbody>
          {movs.map(m => (
            <tr key={m.id}>
              <td style={td}>{new Date(m.criado_em).toLocaleString()}</td>
              <td style={td}>{m.descricao}</td>
              <td style={td}>
                {m.tipo === "entrada" ? `R$ ${Number(m.valor).toFixed(2)}` : "-"}
              </td>
              <td style={td}>
                {m.tipo === "saida" ? `R$ ${Number(m.valor).toFixed(2)}` : "-"}
              </td>
              <td style={td}>R$ {Number(m.saldo).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const btnVoltar = {
  background: "#e5e7eb",
  color: "#7c2d12",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: 600,
  marginBottom: "20px",
};
const theadRow = {
  backgroundColor: "#e5e7eb",
  color: "#7c2d12",
};
const th: React.CSSProperties = {
  padding: 10,
  fontWeight: 600,
  textAlign: "center",
};
const td = {
  padding: "12px 8px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  textAlign: "center",
  color: "#374151",
};


