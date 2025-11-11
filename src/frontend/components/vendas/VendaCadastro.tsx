import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

declare global {
    interface Window {
        electronAPI: {
            addVenda: (venda: any) => Promise<void>;
        };
        ipcRenderer: any;
    }
}

interface Venda {
    id?: number;
    cliente_id?: number;
    usuario_id?: number;
    data_venda?: string;
    valor_total?: number;
    forma_pagamento?: string;
    status?: 'pendente' | 'pago' | 'cancelado';
    observacoes?: string;
    criado_em?: string;
}

interface Produto {
    CodigoProduto: number;
    nome: string;
    preco_venda: number;
    estoque: number;
}

interface ItemVenda {
    produto_id: number;
    nome: string;
    quantidade: number;
    valor_unitario: number;
    subtotal: number;
}

export default function VendaCadastro({ voltar }: { voltar: () => void }) {
    const [venda, setVenda] = useState<Venda>({
        data_venda: new Date().toISOString().split('T')[0],
        status: 'pendente',
        valor_total: 0,
        forma_pagamento: '',
        observacoes: '',
    });

    const [clientes, setClientes] = useState<any[]>([]);
    const [colaboradores, setColaboradores] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [buscaProduto, setBuscaProduto] = useState('');
    const [itens, setItens] = useState<ItemVenda[]>([]);
    const [quantidade, setQuantidade] = useState(1);

    // === Carrega clientes, colaboradores e produtos ===
    useEffect(() => {
        carregarClientes();
        carregarColaboradores();
        carregarProdutos();
    }, []);

    const carregarClientes = async () => {
        try {
            const lista = await window.ipcRenderer.invoke('get-clientes');
            setClientes(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar clientes');
        }
    };

    const carregarColaboradores = async () => {
        try {
            const lista = await window.ipcRenderer.invoke('get-colaboradores');
            setColaboradores(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar colaboradores');
        }
    };

    const carregarProdutos = async () => {
        try {
            const lista = await window.ipcRenderer.invoke('buscar-produtos');
            setProdutos(Array.isArray(lista) ? lista : []);
            console.log(lista)
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar produtos');
        }
    };

    // === Manipulação do formulário ===
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVenda(prev => ({ ...prev, [name]: value }));
    };

    // === Adicionar produto à lista de itens ===
    const handleAdicionarItem = (produto: Produto) => {
        if (!produto) return;

        const itemExistente = itens.find(i => i.Codigo_Produto === produto.CodigoProduto);
        if (itemExistente) {
            toast.error('Produto já adicionado!');
            return;
        }

        const novoItem: ItemVenda = {
            Codigo_Produto: produto.CodigoProduto,
            NomeProduto: produto.NomeProduto,
            EstoqueAtual: quantidade,
            /*
            valor_unitario: produto.preco_venda,
            subtotal: produto.preco_venda * quantidade,*/
        };

        const novosItens = [...itens, novoItem];
        setItens(novosItens);
        atualizarValorTotal(novosItens);
        setBuscaProduto('');
        setQuantidade(1);
    };

    // === Atualiza total da venda ===
    const atualizarValorTotal = (lista: ItemVenda[]) => {
        const total = lista.reduce((acc, item) => acc + item.subtotal, 0);
        setVenda(prev => ({ ...prev, valor_total: parseFloat(total.toFixed(2)) }));
    };

    // === Remover item ===
    const handleRemoverItem = (id: number) => {
        const novosItens = itens.filter(i => i.Codigo_Produto !== id);
        setItens(novosItens);
        atualizarValorTotal(novosItens);
    };

    // === Salvar venda ===
    const handleSalvar = async () => {
        try {
            if (!venda.cliente_id || !venda.usuario_id || itens.length === 0) {
                toast.error('⚠️ Selecione cliente, vendedor e pelo menos um produto.');
                return;
            }

            const vendaCompleta = { ...venda, itens };
            await window.electronAPI.addVenda(vendaCompleta);

            toast.success('✅ Venda cadastrada com sucesso!');
            voltar();
        } catch (err) {
            console.error(err);
            toast.error('❌ Erro ao cadastrar venda.');
        }
    };

    // === Filtrar produtos pela busca ===
    const produtosFiltrados = (produtos || []).filter(p =>
        p?.NomeProduto?.toLowerCase().includes(buscaProduto.toLowerCase())
    );


    // === Interface ===
    return (
        <div style={pageContainer}>
            <h2 style={titulo}>Cadastrar Venda</h2>

            <div style={formContainer}>
                {/* Cliente */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Cliente</label>
                    <select style={inputStyle} name="cliente_id" value={venda.cliente_id || ''} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {clientes.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Colaborador */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Vendedor</label>
                    <select style={inputStyle} name="usuario_id" value={venda.usuario_id || ''} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {colaboradores.map(u => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Buscar Produto */}
                <div style={{ gridColumn: '1 / -1', ...inputGroup }}>
                    <label style={labelStyle}>Buscar Produto</label>
                    <input
                        style={inputStyle}
                        value={buscaProduto}
                        onChange={e => setBuscaProduto(e.target.value)}
                        placeholder="Digite o nome do produto"
                    />
                    {buscaProduto && (
                        <div style={dropdown}>
                            {produtosFiltrados.length > 0 ? (
                                produtosFiltrados.map(p => (
                                    <div
                                        key={p.CodigoProduto}
                                        style={dropdownItem}
                                        onClick={() => handleAdicionarItem(p)}
                                    >
                                        {p.NomeProduto} — R$ 0 ({p.EstoqueAtual} em estoque)
                                    </div>
                                ))
                            ) : (
                                <div style={dropdownItem}>Nenhum produto encontrado</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quantidade */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Quantidade</label>
                    <input
                        style={inputStyle}
                        type="number"
                        min="1"
                        value={quantidade}
                        onChange={e => setQuantidade(parseFloat(e.target.value))}
                    />
                </div>

                {/* Itens adicionados */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '10px', color: '#1e3a8a' }}>Itens da Venda</h3>
                    {itens.length === 0 ? (
                        <p>Nenhum produto adicionado.</p>
                    ) : (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Qtd</th>
                                    <th>Unitário (R$)</th>
                                    <th>Subtotal (R$)</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map(item => (
                                    <tr key={item.produto_id}>
                                        <td>{item.nome}</td>
                                        <td>{item.quantidade}</td>
                                        <td>{item.valor_unitario.toFixed(2)}</td>
                                        <td>{item.subtotal.toFixed(2)}</td>
                                        <td>
                                            <button style={btnRemover} onClick={() => handleRemoverItem(item.produto_id)}>
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Valor Total */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Valor Total</label>
                    <input style={inputStyle} readOnly value={venda.valor_total?.toFixed(2) || '0.00'} />
                </div>

                {/* Forma de Pagamento */}
                <div style={inputGroup}>
                    <label style={labelStyle}>Forma de Pagamento</label>
                    <select style={inputStyle} name="forma_pagamento" value={venda.forma_pagamento || ''} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="pix">PIX</option>
                        <option value="boleto">Boleto</option>
                    </select>
                </div>

                {/* Observações */}
                <div style={{ ...inputGroup, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Observações</label>
                    <textarea
                        style={{ ...inputStyle, minHeight: '80px' }}
                        name="observacoes"
                        value={venda.observacoes || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Botões */}
                <div style={botoesContainer}>
                    <button onClick={handleSalvar} style={buttonPrimary}>Salvar</button>
                    <button onClick={voltar} style={buttonSecondary}>Voltar</button>
                </div>
            </div>
        </div>
    );
}

/* === ESTILOS === */
const pageContainer: React.CSSProperties = { padding: '30px', backgroundColor: '#f3f4f6', minHeight: '100vh' };
const titulo: React.CSSProperties = { color: '#1e3a8a', fontWeight: 700, fontSize: '24px', marginBottom: '25px', textAlign: 'center' };
const formContainer: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px 30px' };
const inputGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const labelStyle: React.CSSProperties = { marginBottom: '6px', fontWeight: 600, color: '#1e3a8a' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db' };
const botoesContainer: React.CSSProperties = { gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' };
const buttonPrimary: React.CSSProperties = { backgroundColor: '#1e3a8a', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const buttonSecondary: React.CSSProperties = { backgroundColor: '#6b7280', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const dropdown: React.CSSProperties = { backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '4px', maxHeight: '150px', overflowY: 'auto', position: 'absolute', zIndex: 10, width: '100%' };
const dropdownItem: React.CSSProperties = { padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const btnRemover: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'red', fontSize: '18px' };
