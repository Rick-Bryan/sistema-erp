/* ------------ COMPONENTE MODAL GENERICO ------------- */
export function Modal({ children }: { children: any }) {
  return (
    <div style={modalFundo}>
      <div style={modalBox}>
        {children}
      </div>
    </div>
  );
}

/* ------------ ESTILOS ------------- */
const btnEditar: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

const btnExcluir: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};
const btnAzul: React.CSSProperties = {
  backgroundColor: '#1e3a8a',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
};

const boxTabela: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: '20px',
  marginTop: '20px'
};

const tabela: React.CSSProperties = {
  marginTop: '10px',
  width: '100%',
  borderCollapse: 'collapse'
};

const inputModal: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const btnSalvar: React.CSSProperties = {
  ...btnAzul,
  width: '100%',
  marginBottom: '15px'
};

const btnFechar: React.CSSProperties = {
  backgroundColor: '#b91c1c',
  color: 'white',
  padding: '8px 14px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  width: '100%'
};

const modalFundo: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox: React.CSSProperties = {
  background: "#fff",
  padding: "25px",
  borderRadius: "8px",
  width: "450px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
};

const th = { padding: "10px", fontWeight: 600 };
const td = { padding: "10px" };
const btnVer = {
  backgroundColor: "#1e3a8a",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer"
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  marginBottom: '10px',
  outline: 'none',
  transition: '0.2s border-color',
  fontSize: '15px',
  boxSizing: 'border-box',
};
/* -------- MELHOR ESTILO DAS TABELAS DO MODAL -------- */

const boxTabelaModal: React.CSSProperties = {
  maxHeight: "200px",
  overflowY: "auto",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  marginTop: "10px",
  marginBottom: "10px"
};

const tabelaModal: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thModal: React.CSSProperties = {
  backgroundColor: "#1e3a8a",
  color: "white",
  padding: "10px",
  textAlign: "left",
  fontWeight: 600,
  position: "sticky",
  top: 0,
};

const tdModal: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
};

const linhaPar: React.CSSProperties = {
  backgroundColor: "#ffffff",
};

const linhaImpar: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
};
