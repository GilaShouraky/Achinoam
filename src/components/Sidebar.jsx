import React from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

const menuItems = [
  { label: 'דף הבית',       page: 'home',     icon: '🏠' },
  { label: 'המוצרים שלי',   page: 'category', data: 'products',  icon: '🎁' },
  { label: 'עבודות גרפיקה', page: 'category', data: 'graphics',  icon: '🎨' },
  { label: 'סדנאות אומנות', page: 'category', data: 'workshops', icon: '🧵' },
  { label: 'קצת עלי',       page: 'about',    icon: '🌿' },
  { label: 'צרי קשר',       page: 'contact',  icon: '📩' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, navigate, content } = useApp();

  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,31,31,0.45)', backdropFilter: 'blur(3px)', zIndex: 200, animation: 'fadeIn 0.2s ease' }} />
      )}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '290px', height: '100vh',
        background: 'var(--warm-white)', zIndex: 300,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.33s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-6px 0 40px rgba(139,90,107,0.12)',
      }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--rose), var(--slate), var(--amber))' }} />
        <div style={{ padding: '24px 22px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
          <Logo size="small" />
          <button onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', left: '16px', background: 'var(--cream)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)' }}>×</button>
        </div>
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {menuItems.map((item, i) => (
            <button key={i} onClick={() => navigate(item.page, item.data || null)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 14px', background: 'none', border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', marginBottom: '3px', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-soft)'; e.currentTarget.style.paddingRight = '20px'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.paddingRight = '14px'; }}
            >
              <span style={{ fontSize: '19px', width: '26px', textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--dark)' }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border-light)' }}>
          <a href={`https://wa.me/${content.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
            className="btn-whatsapp" style={{ width: '100%', borderRadius: '12px', padding: '13px' }}>
            <span>💬</span><span>שלחי הודעה בוואטסאפ</span>
          </a>
        </div>
      </div>
    </>
  );
}
