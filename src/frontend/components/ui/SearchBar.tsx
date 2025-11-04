import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    placeholder?: string;
    canal: string; // nome do canal IPC (ex: 'buscar-produtos')
    onResults: (dados: any[]) => void; // retorna os resultados
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Pesquisar...", canal, onResults }) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔁 Debounce: espera o usuário parar de digitar
    useEffect(() => {
       

        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                // se o campo estiver vazio, busca tudo
                const termo = query.trim() === "" ? "*" : query.trim();
                const resultados = await window.electronAPI.buscar(canal,termo);
                onResults(resultados);
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
            {loading && <span style={{ fontSize: 12, color: "#6b7280" }}>Carregando...</span>}
        </div>
    );
};

export default SearchBar;
