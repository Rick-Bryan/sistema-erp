// src/pages/cadastros/CadastrosPage.tsx
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Package, Factory, Layers, Boxes, Users, User } from 'lucide-react';
import { verifyPerm, usePerm } from '../../components/helpers/verifyPerm';
interface CadastrosPageProps {
  setPage: (page: string) => void;
}

export default function CadastrosPage({ setPage }: CadastrosPageProps) {


  const CARDS = [
    {
      slug: "produtos",
      page: "produtos",
      titulo: "Produtos",
      icon: Package,
      desc: "Gerencie o cadastro de produtos",
    },
    {
      slug: "fabricantes",
      page: "fabricantes",
      titulo: "Fabricantes",
      icon: Factory,
      desc: "Cadastre e edite fabricantes",
    },
    {
      slug: "clientes",
      page: "clientes",
      titulo: "Clientes",
      icon: Users,
      desc: "Cadastre e edite clientes",
    },
    {
      slug: "colaboradores",
      page: "colaboradores",
      titulo: "Colaboradores",
      icon: User,
      desc: "Cadastre e edite colaboradores",
    },
    {
      slug: "cadastros-auxiliares",
      page: "cadastros-auxiliares",
      titulo: "Cadastros Auxiliares",
      icon: Layers,
      desc: "Outras alternativas de cadastros",
    },
    {
      slug: "fornecedores",
      page: "fornecedores",
      titulo: "Fornecedores",
      icon: Boxes,
      desc: "Gerencie seus fornecedores",
    },
  ];
  const perms = usePerm();
  const cardsPermitidos = CARDS.filter(c => perms?.[c.slug]?.consultar);
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>Cadastros</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16
      }}>
        {cardsPermitidos.map((c) => {

          return (

            <Card onClick={() => setPage(c.page)}>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <c.icon style={{ width: 28, height: 28 }}></c.icon>
                  <strong>{c.titulo}</strong>
                </div>
              </CardHeader>
              <CardContent>{c.desc}</CardContent>
            </Card>
          )
        })}


      </div>
    </div>
  );
}
