import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Paper, Divider, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import toast from "react-hot-toast";

interface VendaDetalhesProps {
  venda: any;
  voltar: () => void;
}

const VendaDetalhes: React.FC<VendaDetalhesProps> = ({ venda, voltar }) => {
  if (!venda) return null;
  
  const [itens, setItens] = useState<any[]>([]);
  
  const listarItensVenda = async () => {

    try {
      const result = await window.ipcRenderer.invoke("listar-itens-venda", venda.id)
      if (Array.isArray(result)) {
        setItens(result);
      } else {
        console.warn("Resposta inesperada:", result);
        setItens([]);
      }
      
    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    listarItensVenda()
  }, []);


  
  const finalizarVenda = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const usuarioId = usuario?.id;

    const caixaId = localStorage.getItem("caixa_id");

    if (!usuarioId) {
      toast.error("Usuário não encontrado");
      return;
    }

    try {
      const resposta = await window.ipcRenderer.invoke("pagar-venda", {
        venda_id: venda.id,
        forma_pagamento: venda.forma_pagamento,
        usuario_id: usuarioId,
        caixa_id: Number(caixaId)
      });

      if (resposta.sucesso) {
        toast.success("Venda finalizada!");
        voltar();
      } else {
        toast.error(resposta.mensagem || "Erro ao finalizar a venda");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao finalizar a venda");
    }
  };




  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, mx: "auto" }}>
      {/* Cabeçalho */}
      <button
        onClick={() => voltar()}
        style={{
          backgroundColor: '#e5e7eb',
          color: '#1e3a8a',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: '20px'
        }}
      >
        ← Voltar
      </button>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#2c3e50" }}>
        🧾 Detalhes da Venda #{venda.id}
      </Typography>

      {/* Informações da venda */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Informações Gerais
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <Typography variant="body1">
            <strong>Cliente:</strong> {venda.cliente_nome || "Não informado"}
          </Typography>
          <Typography variant="body1">
            <strong>Vendedor:</strong> {venda.usuario_nome || "-"}
          </Typography>
          <Typography variant="body1">
            <strong>Forma de Pagamento:</strong> {venda.forma_pagamento || "-"}
          </Typography>

          <Typography variant="body1">
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  venda.status === "pago"
                    ? "green"
                    : venda.status === "cancelado"
                      ? "red"
                      : "#999",
                fontWeight: 600,
              }}
            >
              {venda.status?.toUpperCase() || "PENDENTE"}
            </span>
          </Typography>
          <Typography variant="body1">
            <strong>Data:</strong>{" "}
            {venda.data_venda
              ? new Date(venda.data_venda).toLocaleDateString("pt-BR")
              : new Date().toLocaleDateString("pt-BR")}
          </Typography>
          <Typography>
            Total: R$ {Number(venda?.valor_total || 0).toFixed(2)}
          </Typography>
        </Box>

        {venda.observacoes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Observações:
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              {venda.observacoes}
            </Typography>
          </Box>
        )}
        {venda.status === "pendente" && (
          <button
            onClick={finalizarVenda}
            style={{
              backgroundColor: "#1e3a8a",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Finalizar Venda
          </button>
        )}
      </Paper>

      {/* Itens da venda */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Itens da Venda
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {itens.length > 0 ? (
          <Table size="small">
            <TableHead sx={{ background: "#f7f9fc" }}>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="center">Qtd</TableCell>
                <TableCell align="right">Unitário (R$)</TableCell>
                <TableCell align="right">Subtotal (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itens.map((item: any, index: number) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nome_item}</TableCell>
                  <TableCell align="center">{item.quantidade}</TableCell>
                  <TableCell align="right">{item.valor_unitario}</TableCell>
                  <TableCell align="right">{item.subtotal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" sx={{ color: "#777" }}>
            Nenhum item nesta venda.
          </Typography>
        )}
      </Paper>

      {/* Botão Voltar */}
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={voltar}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 2,
          }}
        >
          ← Voltar
        </Button>
      </Box>
    </Box>
  );
};

export default VendaDetalhes;
