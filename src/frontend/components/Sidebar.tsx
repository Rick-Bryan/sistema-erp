import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Settings,
  LogOut
} from 'lucide-react';
import { ReactElement, ElementType } from 'react';
interface SidebarProps {
  abrirAba: (
    page: string,
    titulo: string,
    params?: any,
    Icon?: ElementType
  ) => void;
  onMenuClick: (page: string) => void;
  onLogout?: () => void;
}



export default function Sidebar({ abrirAba, onMenuClick, onLogout }: SidebarProps) {
  const [active, setActive] = useState('dashboard');

  const menus = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'movimentacao', label: 'Movimentação', icon: DollarSign },
    { key: 'cadastros', label: 'Cadastros', icon: Users },
    { key: 'manutencao', label: 'Manutenção', icon: Settings },
  ];

const handleClick = (page: string, label: string, Icon: ElementType) => {
  setActive(page);
  onMenuClick(page); // 👈 navega base
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

      <div style={{ flex: 1 }}>
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.key)}

              style={{
                ...btnStyle,
                backgroundColor:
                  active === item.key ? 'rgba(255,255,255,0.25)' : 'transparent',
                fontWeight: active === item.key ? 'bold' : 'normal',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')
              }
              onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                active === item.key ? 'rgba(255,255,255,0.25)' : 'transparent')
              }
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} />
                {item.label}
              </span>
            </button>
          );
        })}

      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            ...btnStyle,
            backgroundColor: 'rgba(255,255,255,0.15)',
            margin: '5px 5px 30px 5px'
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')
          }
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <LogOut size={18} />
            Sair
          </span>
        </button>
      )}
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
