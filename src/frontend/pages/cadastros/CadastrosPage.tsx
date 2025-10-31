// src/pages/cadastros/CadastrosPage.tsx
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Package, Factory, Layers, Boxes, User, Users } from 'lucide-react';

interface CadastrosPageProps {
  setPage: (page: string) => void;
}

export default function CadastrosPage({ setPage }: CadastrosPageProps) {
  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <Card
        onClick={() => setPage('produtos')}
        className="cursor-pointer hover:shadow-lg transition"
      >
        <CardHeader className="flex flex-col items-center">
          <Package className="h-8 w-8 mb-2" />
          <h3 className="font-bold">Produtos</h3>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-500">
          Gerencie o cadastro de produtos
        </CardContent>
      </Card>

      <Card
        onClick={() => setPage('fabricantes')}
        className="cursor-pointer hover:shadow-lg transition"
      >
        <CardHeader className="flex flex-col items-center">
          <Factory className="h-8 w-8 mb-2" />
          <h3 className="font-bold">Fabricantes</h3>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-500">
          Cadastre e edite fabricantes
        </CardContent>
      </Card>

      {/* Outros cards — grupos, clientes, funcionários etc. */}
    </div>
  );
}
