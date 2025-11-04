// src/components/fabricantes/FabricanteCadastro.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
declare global {
    interface Window {
        electronAPI: {
            salvarFabricante: (fabricante: any) => Promise<void>;
        };
    }
}

interface FabricanteCadastroProps {
    voltar: () => void;
}

export default function FabricanteCadastro({ voltar }: FabricanteCadastroProps) {
    const [nome, setNome] = useState('');
    const [ativo, setAtivo] = useState(false);

    const salvar = async () => {
        if (!nome.trim()) {
           toast.error("O nome do fabricante é obrigatorio");
            return;
        }

        const fabricante = {
            NomeFabricante: nome.trim(),
            Ativo: ativo ? 1 : 0
        };

        try {
            await window.electronAPI.salvarFabricante(fabricante);
            voltar();
        } catch (error) {
            toast.error('Erro ao salvar fabricante:')
            console.error('Erro ao salvar fabricante:', error);
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

            <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Novo Fabricante</h2>

            <div
                style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                <div style={{ marginBottom: '10px' }}>
                    <label>Nome do Fabricante:</label>
                    <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
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
                    style={{
                        backgroundColor: '#1e3a8a',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '10px',
                    }}
                >
                    Salvar
                </button>
            </div>
        </div>
    );
}
