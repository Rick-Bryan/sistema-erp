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
import { ElementType } from 'react';

import { verifyPerm, usePerm } from '../../components/helpers/verifyPerm';

interface MovimentacaoProps {
  abrirAba: (
    page: string,
    titulo: string,
    params?: any,
    Icon?: ElementType
  ) => void;
}


export default function Movimentacao({ abrirAba }: MovimentacaoProps) {
  const CARDS = [
    {
      slug: "vendas",
      page: "vendas",
      titulo: "Vendas",
      icon: ShoppingCart,
      desc: "Gerencie suas vendas e pré-vendas",
    },
    {
      slug: "caixa-fluxo",
      page: "caixa-fluxo",
      titulo: "Caixa e Fluxo",
      icon: DollarSign,
      desc: "Controle de caixa e fluxo financeiro diário",
    },
    {
      slug: "movimentacao-estoque",
      page: "movimentacao-estoque",
      titulo: "Movimentação de Estoque",
      icon: RefreshCw,
      desc: "Entradas, saídas e ajustes de estoque",
    },
    {
      slug: "compras",
      page: "compras",
      titulo: "Compras",
      icon: Truck,
      desc: "Gerencie suas compras e fornecedores",
    },
    {
      slug: "financeiro",
      page: "financeiro",
      titulo: "Financeiro",
      icon: FileText,
      desc: "Contas a pagar e a receber",
    },
    {
      slug: "orcamentos",
      page: "orcamentos",
      titulo: "Orçamentos",
      icon: ClipboardList,
      desc: "Crie orçamentos e pré-vendas",
    },
    {
      slug: "devolucoes-trocas",
      page: "devolucoes-trocas",
      titulo: "Devoluções e Trocas",
      icon: Repeat,
      desc: "Gerencie devoluções e trocas",
    },
    {
      slug: "notas-fiscais",
      page: "notas-fiscais",
      titulo: "Notas Fiscais",
      icon: FileText,
      desc: "Emita NFe, NFCe e NFSe",
    },
    {
      slug: "controle-de-pedidos",
      page: "controle-de-pedidos",
      titulo: "Controle de Pedidos",
      icon: PackageCheck,
      desc: "Gerencie pedidos",
    },
    {
      slug: "carteira-digital",
      page: "carteira-digital",
      titulo: "Carteira Digital",
      icon: Wallet,
      desc: "Gerencie créditos e conta interna",
    },
    {
      slug: "consulta-de-precos",
      page: "consulta-de-precos",
      titulo: "Consulta de Preços",
      icon: TrendingUp,
      desc: "Consulte preços e margens",
    },
    {
      slug: "entregas-expedicao",
      page: "entregas-expedicao",
      titulo: "Entregas / Expedição",
      icon: Archive,
      desc: "Controle o envio e entrega",
    },
    {
      slug: "controle-de-comissoes",
      page: "controle-de-comissoes",
      titulo: "Controle de Comissões",
      icon: CreditCard,
      desc: "Gerencie comissões",
    },
  ];

  const perms = usePerm();


  const cardsPermitidos = CARDS.filter(c => perms?.[c.slug]?.consultar);

  usePerm()
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
        {cardsPermitidos.map((c) => {
          const Icon = c.icon;

          return (
            <Card
              key={c.slug}
              onClick={() => abrirAba(c.page, c.titulo, undefined, c.icon)}
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
