import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, BarChart, Wallet } from "lucide-react";
import FinanceiroResumo from "./FinanceiroResumo";
import FinanceiroVencimentosMes from "./FinanceiroVencimentoMes";
import { ElementType } from "react";

interface Props {
    abrirAba: (page: string, titulo: string, params?: any, Icon: ElementType) => void;
    voltar: () => void;
}

export default function Financeiro({ abrirAba, voltar }: Props) {
    return (
        <div style={{ padding: 24 }}>
            <button
                onClick={(voltar)}
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
                    onClick={() => abrirAba("financeiro/receber", "Contas a Receber", null, ArrowDownCircle)
}
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


                <Card className="cursor-pointer" onClick={() => abrirAba("financeiro/pagar", "Pagar", null, ArrowUpCircle)}>
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
                    onClick={() =>
                        abrirAba("financeiro/movimentacao-financeiro", "Movimentação", null, BarChart)
                    }
                >
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart style={{ width: 28, height: 28 }} />
                            <strong>Movimentação Financeira</strong>
                        </div>
                    </CardHeader>
                    <CardContent>
                        Entradas, saídas e saldo por caixa, banco e cofre
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer"
                    onClick={() => abrirAba("financeiro/contas", "Contas", null, Wallet)}
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
