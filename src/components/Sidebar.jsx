import React from 'react';
import { useApp } from '../context/AppContext';

const menuItems = [
  { label: 'אודות', page: 'about' },
  { label: 'חנות', page: 'products', data: null },
  { label: 'המוצרים שלי', page: 'products' },
  { label: 'עבודות גרפיקה', page: 'graphics' },
  { label: 'סדנאות אומנות', page: 'workshops' },
  { label: 'סל קניות', page: 'cart' },
  { label: 'צור קשר', page: 'contact' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, navigate } = useApp();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sidebar panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: sidebarOpen ? 0 : '-320px',
        width: '290px',
        height: '100vh',
        background: 'var(--warm-white)',
        zIndex: 300,
        transition: 'right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: 'var(--mid)',
            lineHeight: 1,
          }}
          aria-label="סגור"
        >
          ×
        </button>

        {/* Logo */}
        <div style={{
          padding: '28px 28px 24px',
          borderBottom: '1px solid var(--light-border)',
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: '900',
          color: 'var(--deep-sage)',
        }}>
          אחינועם הר כוכב
          <div style={{ fontSize: '12px', color: 'var(--terracotta)', fontFamily: 'var(--font-body)', fontWeight: 400, marginTop: 4 }}>
            מתנות | עיצוב | סדנאות
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.page, item.data)}
              style={{
                display: 'block',
                width: '100%',
                padding: '16px 28px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--light-border)',
                textAlign: 'right',
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--dark)',
                transition: 'background 0.2s, color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)'; e.currentTarget.style.color = 'var(--deep-sage)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--dark)'; }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* WhatsApp */}
        <div style={{ padding: '24px 28px' }}>
          <a
            href="https://wa.me/9720548838607"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#25D366',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '600',
              justifyContent: 'center',
            }}
          >
            <span>💬</span> ווצאפ
          </a>
        </div>
      </div>
    </>
  );
}
