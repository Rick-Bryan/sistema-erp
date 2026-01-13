import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardContent } from "../ui/card";
import { useEffect, useState } from "react";

export default function FinanceiroVencimentosMes() {
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("🧩 FinanceiroVencimentosMes renderizou");

  useEffect(() => {
    async function carregar() {
      try {
        const resumo = await window.ipcRenderer.invoke(
          "financeiro:vencimentos-mes-atual"
        );
        console.log("📊 Dados recebidos IPC:", resumo);
        setDados([
          {
            nome: "Mês Atual",
            receber: Number(resumo.receber || 0),
            pagar: Number(resumo.pagar || 0),
          },
        ]);
      } catch (err) {
        console.error("Erro ao carregar vencimentos do mês", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>Carregando vencimentos do mês...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader >
        <strong>📆 Vencimentos do Mês Atual</strong>
      </CardHeader>

      <CardContent style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <XAxis dataKey="nome" />
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
      </CardContent>
    </Card>
  );
}
