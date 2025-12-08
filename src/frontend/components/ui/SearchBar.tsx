import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    placeholder?: string;
    canal?: string;              // opcional quando buscarNoBanco = false
    buscarNoBanco?: boolean;     // TRUE = padrão para compatibilidade
    onResults: (dados: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Pesquisar...",
    canal,
    buscarNoBanco = true,       // 👈 PADRÃO (não quebra telas antigas)
    onResults
}) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            
            // 📌 Caso 1: Filtro local (não busca no banco)
            if (!buscarNoBanco) {
                onResults({ search: query }); // 👈 manda só o texto
                return;
            }

            // 📌 Caso 2: Busca no banco via IPC (modo padrão)
            if (!canal) return; // segurança

            setLoading(true);

            try {
                const termo = query.trim() === "" ? "*" : query.trim();
                const resultados = await window.electronAPI.buscar(canal, termo);
                onResults(resultados);         // 👈 manda array (compatível com telas antigas)
            } catch (err) {
                console.error("Erro ao buscar:", err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: 8,
                padding: "20px 10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                marginBottom: 16,
            }}
        >
            <Search size={18} style={{ color: "#1E3A8A", marginRight: 8 }} />
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    background: "transparent",
                }}
            />
            {loading && buscarNoBanco && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>Carregando...</span>
            )}
        </div>
    );
};

export default SearchBar;
