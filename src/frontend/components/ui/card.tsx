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
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: any) {
  return <div style={{ marginBottom: 8 }}>{children}</div>;
}

export function CardContent({ children }: any) {
  return <div style={{ color: '#6b7280' }}>{children}</div>;
}
