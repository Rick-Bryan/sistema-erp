import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { useEffect, useState } from "react";


interface ResumoFinanceiroRaw {
    ano: number;
    mes: number;
    receber: number;
    pagar: number;
}

interface ResumoFinanceiro {
    mes: string; // formatado (Jan/2026)
    receber: number;
    pagar: number;
}

export default function FinanceiroResumo() {
    const [dados, setDados] = useState<ResumoFinanceiro[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const resumo: ResumoFinanceiroRaw[] =
                    await window.ipcRenderer.invoke("financeiro:resumo-anual");

                const formatado: ResumoFinanceiro[] = resumo.map((item) => {
                    const data = new Date(item.ano, item.mes - 1);

                    return {
                        mes: data.toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "numeric",
                        }),
                        receber: Number(item.receber),
                        pagar: Number(item.pagar),
                    };
                });

                setDados(formatado);
            } catch (err) {
                console.error("Erro ao carregar gráfico financeiro", err);
            } finally {
                setLoading(false);
            }
        }

        carregar();
    }, []);

    console.log("Dados gráfico:", dados);

    if (loading) {
        return (
            <Card style={{ marginBottom: 24 }}>
                <CardContent>Carregando gráfico financeiro...</CardContent>
            </Card>
        );
    }

    return (
        <Card style={{ marginBottom: 24 }}>
            <CardHeader>
                <strong>📊 Resumo Financeiro Anual</strong>
            </CardHeader>

            <CardContent>
                <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dados}>
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="pagar"
                                name="Contas a Pagar"
                                fill="#dc2626"
                                radius={[6, 6, 0, 0]}
                            />
                            <Bar
                                dataKey="receber"
                                name="Contas a Receber"
                                fill="#16a34a"
                                radius={[6, 6, 0, 0]}
                            />


                        </BarChart>
                    </ResponsiveContainer>

                </div>
            </CardContent>
        </Card>
    );
}
