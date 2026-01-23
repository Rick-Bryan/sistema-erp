
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import {
Users
} from 'lucide-react';

interface ManutencaoProps {
  setPage: (page: string) => void;
}

export default function Manutencao({ setPage }: ManutencaoProps) {
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
        {/* Vendas */}
        <Card onClick={() => setPage('definicoes-acesso')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users style={{ width: 28, height: 28 }} />
              <strong>Definições de acesso</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie permissões de usuario</CardContent>
        </Card>

      
      </div>
    </div>
  );
}
