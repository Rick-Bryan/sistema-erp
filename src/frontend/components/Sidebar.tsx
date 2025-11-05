import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  setPage: (page: 'dashboard' | 'clientes' | 'movimentacao' | 'manutencao' | 'cadastros') => void;
}

export default function Sidebar({ setPage }: SidebarProps) {
  const [active, setActive] = useState('dashboard');

  const menus = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'movimentacao', label: 'Movimentação', icon: <DollarSign size={18} /> },
    { key: 'cadastros', label: 'Cadastros', icon: <Users size={18} /> },
    { key: 'manutencao', label: 'Manutenção', icon: <Settings size={18} /> },
  ];

  const handleClick = (page: string) => {
    setActive(page);
    setPage(page as any);
  };

  return (
    <div
      style={{
        width: '200px',
        backgroundColor: '#4da6ff',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 15px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        boxShadow: '3px 0 10px rgba(0,0,0,0.1)',
      }}
    >
      <h2
        style={{
          marginBottom: '40px',
          textAlign: 'center',
          letterSpacing: '1px',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        ERP
      </h2>

      {menus.map((item) => (
        <button
          key={item.key}
          onClick={() => handleClick(item.key)}
          style={{
            ...btnStyle,
            backgroundColor:
              active === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
            fontWeight: active === item.key ? 'bold' : 'normal',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')
          }
          onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor =
            active === item.key ? 'rgba(255,255,255,0.2)' : 'transparent')
          }
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {item.icon}
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 10px',
  marginBottom: '10px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 16,
  textAlign: 'left',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
};
