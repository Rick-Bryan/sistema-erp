// src/pages/cadastros/CadastrosPage.tsx
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Package, Factory, Layers, Boxes, User, Users } from 'lucide-react';

interface CadastrosPageProps {
  setPage: (page: string) => void;
}

export default function CadastrosPage({ setPage }: CadastrosPageProps) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>Cadastros</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16
      }}>
        <Card onClick={() => setPage('produtos')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package style={{ width: 28, height: 28 }} />
              <strong>Produtos</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie o cadastro de produtos</CardContent>
        </Card>

        <Card onClick={() => setPage('fabricantes')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Factory style={{ width: 28, height: 28 }} />
              <strong>Fabricantes</strong>
            </div>
          </CardHeader>
          <CardContent>Cadastre e edite fabricantes</CardContent>
        </Card>
        <Card onClick={() => setPage('clientes')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users style={{ width: 28, height: 28 }} />
              <strong>Clientes</strong>
            </div>
          </CardHeader>
          <CardContent>Cadastre e edite Clientes</CardContent>
        </Card>
        <Card onClick={() => setPage('colaboradores')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users style={{ width: 28, height: 28 }} />
              <strong>Colaboradores</strong>
            </div>
          </CardHeader>
          <CardContent>Cadastre e edite Colaboradores</CardContent>
        </Card>
        {/* adicione mais cards */}
      </div>
    </div>
  );
}
