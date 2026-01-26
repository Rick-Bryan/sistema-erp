import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Users, Settings } from 'lucide-react';
import { usePerm, verifyPerm } from '../../components/helpers/verifyPerm';

interface ManutencaoProps {
  setPage: (page: string) => void;
}

export default function Manutencao({ setPage }: ManutencaoProps) {

  const CARDS = [
    {
      slug: "definicoes-acesso",
      page: "definicoes-acesso",
      titulo: "Definições de acesso",
      icon: Users,
      desc: "Gerencie permissões de usuário",
    },
    // futuramente você só adiciona aqui
  ];
  const perms = usePerm();
  const cardsPermitidos = CARDS.filter(c => perms?.[c.slug]?.consultar);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>
        Manutenção
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {cardsPermitidos.map((c) => {
          const Icon = c.icon;

          return (
            <Card
              key={c.slug}
              onClick={() => setPage(c.page)}
              className="cursor-pointer"
            >
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon style={{ width: 28, height: 28 }} />
                  <strong>{c.titulo}</strong>
                </div>
              </CardHeader>

              <CardContent>{c.desc}</CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
