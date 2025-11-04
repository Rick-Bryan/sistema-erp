import React from 'react';

export function Card({ children, onClick, className = '' }: any) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 10px 25px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 6px 18px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: any) {
  return <div style={{ marginBottom: 8, fontWeight: 600 }}>{children}</div>;
}

export function CardContent({ children }: any) {
  return <div style={{ color: '#6b7280', fontSize: 14 }}>{children}</div>;
}
