import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, BarChart, Wallet } from "lucide-react";
import FinanceiroResumo from "./FinanceiroResumo";
import FinanceiroVencimentosMes from "./FinanceiroVencimentoMes";

interface Props {
    setPage: (page: string) => void;
}

export default function Financeiro({ setPage }: Props) {
    return (
        <div style={{ padding: 24 }}>
            <button
                onClick={() => setPage('movimentacao')}
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
            <h1 style={{ fontSize: 24, marginBottom: 16 }}>
                Financeiro
            </h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: 16,
                    marginTop: 16,
                    marginBottom: 16,
                }
                }
            >
                <Card
                    className="cursor-pointer"
                    onClick={() => setPage("financeiro/receber")}
                >
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ArrowDownCircle style={{ width: 28, height: 28 }} />
                            <strong>Contas a Receber</strong>
                        </div>


                    </CardHeader>
                    <CardContent>
                        Vendas a prazo, parcelas e recebimentos
                    </CardContent>
                </Card>


                <Card className="cursor-pointer" onClick={() => setPage("financeiro/pagar")}>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ArrowUpCircle style={{ width: 28, height: 28 }} />
                            <strong>Contas a Pagar</strong>
                        </div>
                    </CardHeader>
                    <CardContent>Consulte preços e margens de lucro</CardContent>
                </Card>
                <Card
                    className="cursor-pointer"
                    onClick={() => setPage("caixa")}
                >
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart style={{ width: 28, height: 28 }} />
                            <strong>Fluxo de Caixa</strong>
                        </div>
                    </CardHeader>
                    <CardContent>
                        Entradas, saídas e saldo consolidado
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer"
                    onClick={() => setPage("financeiro/contas")}
                >
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Wallet style={{ width: 28, height: 28 }} />
                            <strong>Contas</strong>
                        </div>
                    </CardHeader>
                    <CardContent>
                        Caixa, Cofre e Bancos
                    </CardContent>
                </Card>

            </div>
            <FinanceiroVencimentosMes />
            <FinanceiroResumo />

        </div >
    );
}
