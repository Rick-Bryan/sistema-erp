import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";

declare global {
  interface Window {
    electronAPI: {
      getCompraById: (id: number) => Promise<any>;
      finalizarCompra: (id: number) => Promise<void>;
    };
  }
}

interface CompraDetalhesModalProps {
  compraId: number;
  onClose: () => void;
  refresh: () => void;
}

export default function CompraDetalhes({ compraId, onClose, refresh }: CompraDetalhesModalProps) {
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    async function carregarCompra() {
      try {
        const c = await window.electronAPI.getCompraById(compraId);
        setCompra(c);
      } catch (e) {
        console.error("Erro ao carregar compra", e);
      }
    }
    carregarCompra();
  }, [compraId]);

  const finalizarCompra = async () => {
    if (!compra) return;
    try {
      await window.electronAPI.finalizarCompra(compra.id);
      toast.success("Compra finalizada com sucesso!");
      onClose();
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao finalizar compra.");
    }
  };

  if (!compra) {
    return <div style={overlay}><div style={modal}>Carregando detalhes...</div></div>;
  }

  const valorTotal = compra.itens.reduce(
    (acc: number, item: any) => acc + item.quantidade * item.custo_unitario,
    0
  );

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ color: "#1e3a8a", marginBottom: 20 }}>Compra #{compra.id}</h2>

        <div style={{ marginBottom: 10 }}>
          <strong>Fornecedor:</strong> {compra.fornecedor?.nome || "—"}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Forma de pagamento:</strong> {compra.forma_pagamento}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Status:</strong> {compra.status}
        </div>
        {compra.observacoes && (
          <div style={{ marginBottom: 10 }}>
            <strong>Observações:</strong> {compra.observacoes}
          </div>
        )}

        <h3 style={{ color: "#1e3a8a", marginTop: 20 }}>Itens</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#1e3a8a' }}>
              <th style={th}>Produto</th>
              <th style={th}>Qtd</th>
              <th style={th}>Custo Unit.</th>
              <th style={th}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {compra.itens.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={td}>{item.produto?.nome}</td>
                <td style={td}>{item.quantidade}</td>
                <td style={td}>R$ {item.custo_unitario.toFixed(2)}</td>
                <td style={td}>R$ {(item.quantidade * item.custo_unitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontWeight: 600, marginBottom: 20 }}>Valor Total: R$ {valorTotal.toFixed(2)}</div>

        <div style={{ display: 'flex', gap: 10 }}>
          {compra.status === "aberta" && (
            <Button variant="contained" color="primary" style={{ flex: 1 }} onClick={finalizarCompra}>
              Finalizar Compra
            </Button>
          )}
          <Button variant="outlined" color="inherit" style={{ flex: 1 }} onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 999
};

const modal: React.CSSProperties = {
  background: '#fff', padding: 20, borderRadius: 8, width: '600px', maxHeight: '90vh',
  overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const th: React.CSSProperties = { padding: 10, fontWeight: 600, textAlign: 'center' };
const td: React.CSSProperties = { padding: 10, textAlign: 'center', color: '#374151' };
