// src/pages/movimentacao/Movimentacao.tsx
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import {
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Truck,
  FileText,
  ClipboardList,
  TrendingUp,
  Wallet,
  Archive,
  Repeat,
  CreditCard,
  PackageCheck,
} from 'lucide-react';

interface MovimentacaoProps {
  setPage: (page: string) => void;
}

export default function Movimentacao({ setPage }: MovimentacaoProps) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16, color: '#1e3a8a' }}>
        Movimentação
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {/* Vendas */}
        <Card onClick={() => setPage('vendas')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart style={{ width: 28, height: 28 }} />
              <strong>Vendas</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie suas vendas e pré-vendas</CardContent>
        </Card>

        {/* Caixa e Fluxo */}
        <Card onClick={() => setPage('caixa')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign style={{ width: 28, height: 28 }} />
              <strong>Caixa e Fluxo</strong>
            </div>
          </CardHeader>
          <CardContent>Controle de caixa e fluxo financeiro diário</CardContent>
        </Card>

        {/* Movimentação de Estoque */}
        <Card onClick={() => setPage('movimentacao-estoque')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw style={{ width: 28, height: 28 }} />
              <strong>Movimentação de Estoque</strong>
            </div>
          </CardHeader>
          <CardContent>Entradas, saídas e ajustes de estoque</CardContent>
        </Card>

        {/* Compras */}
        <Card onClick={() => setPage('compras')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck style={{ width: 28, height: 28 }} />
              <strong>Compras</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie suas compras e fornecedores</CardContent>
        </Card>

        {/* Financeiro */}
        <Card onClick={() => setPage('financeiro')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText style={{ width: 28, height: 28 }} />
              <strong>Financeiro</strong>
            </div>
          </CardHeader>
          <CardContent>Contas a pagar e a receber</CardContent>
        </Card>

        {/* Orçamentos */}
        <Card onClick={() => setPage('orcamentos')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList style={{ width: 28, height: 28 }} />
              <strong>Orçamentos</strong>
            </div>
          </CardHeader>
          <CardContent>Crie orçamentos e pré-vendas</CardContent>
        </Card>

        {/* Devoluções e Trocas */}
        <Card onClick={() => setPage('devolucoes')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Repeat style={{ width: 28, height: 28 }} />
              <strong>Devoluções e Trocas</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie devoluções e trocas de produtos</CardContent>
        </Card>

        {/* Notas Fiscais */}
        <Card onClick={() => setPage('notas')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText style={{ width: 28, height: 28 }} />
              <strong>Notas Fiscais</strong>
            </div>
          </CardHeader>
          <CardContent>Emita NFe, NFCe e NFSe</CardContent>
        </Card>

        {/* Controle de Pedidos */}
        <Card onClick={() => setPage('pedidos')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PackageCheck style={{ width: 28, height: 28 }} />
              <strong>Controle de Pedidos</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie pedidos de compra e venda</CardContent>
        </Card>

        {/* Carteira Digital */}
        <Card onClick={() => setPage('carteira-digital')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet style={{ width: 28, height: 28 }} />
              <strong>Carteira Digital</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie créditos e conta interna</CardContent>
        </Card>

        {/* Consulta de Preços */}
        <Card onClick={() => setPage('consulta-precos')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp style={{ width: 28, height: 28 }} />
              <strong>Consulta de Preços</strong>
            </div>
          </CardHeader>
          <CardContent>Consulte preços e margens de lucro</CardContent>
        </Card>

        {/* Entregas / Expedição */}
        <Card onClick={() => setPage('entregas')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Archive style={{ width: 28, height: 28 }} />
              <strong>Entregas / Expedição</strong>
            </div>
          </CardHeader>
          <CardContent>Controle o envio e entrega de pedidos</CardContent>
        </Card>

        {/* Controle de Comissões */}
        <Card onClick={() => setPage('comissoes')} className="cursor-pointer">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard style={{ width: 28, height: 28 }} />
              <strong>Controle de Comissões</strong>
            </div>
          </CardHeader>
          <CardContent>Gerencie as comissões dos vendedores</CardContent>
        </Card>
      </div>
    </div>
  );
}
