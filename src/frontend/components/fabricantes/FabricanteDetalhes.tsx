// src/components/fabricantes/FabricanteDetalhes.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { toastErro } from '../helpers/toastErro';
interface FabricanteDetalhesProps {
  fabricanteSelecionado: any;
  voltar: () => void;
}

export default function FabricanteDetalhes({ fabricanteSelecionado, voltar }: FabricanteDetalhesProps) {
  const [nome, setNome] = useState(fabricanteSelecionado.NomeFabricante || '');
  const [ativo, setAtivo] = useState(fabricanteSelecionado.Ativo);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!nome.trim()) {
      toast.error('O nome do fabricante é obrigatório.');
      return;
    }

    setSalvando(true);
    try {
      await window.electronAPI.salvarFabricante({
        CodigoFabricante: fabricanteSelecionado.CodigoFabricante,
        NomeFabricante: nome,
        Ativo: ativo ? 1 : 0,
      });
      toast.success('Fabricante atualizado com sucesso!');
      voltar(); // volta para a lista de fabricantes
    } catch (err) {
      console.error(err);
      toastErro(err)
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={voltar}
        style={{
          backgroundColor: '#e5e7eb',
          color: '#1e3a8a',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: '20px',
        }}
      >
        ← Voltar
      </button>

      <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Editar Fabricante</h2>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '20px',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <label><strong>Código:</strong></label>
          <p>{fabricanteSelecionado.CodigoFabricante}</p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label><strong>Nome:</strong></label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Ativo
          </label>
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
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
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
