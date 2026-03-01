import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const LOGO_URL = 'https://i.ibb.co/6R35Qkzt/4.png';

export default function Header() {
  const { setSidebarOpen, cartCount, navigate } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header style={{
      background: scrolled ? 'rgba(255,252,250,0.95)' : 'var(--warm-white)',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: '1px solid var(--border-light)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '80px',
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 2px 16px rgba(139,90,107,0.08)' : 'none',
      direction: 'rtl',
    }}>

      {/* ימין קיצוני: 3 פסים */}
      <button onClick={() => setSidebarOpen(true)}
        style={{ background: 'none', border: 'none', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
        {[26, 18, 26].map((w, i) => (
          <span key={i} style={{ display: 'block', width: w, height: '2px', background: 'var(--rose)', borderRadius: '2px' }} />
        ))}
      </button>

      {/* מרכז: לוגו */}
      <button onClick={() => navigate('home')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={LOGO_URL} alt="אחינועם"
          style={{ height: '68px', width: 'auto', objectFit: 'contain', display: 'block' }} />
      </button>

      {/* שמאל קיצוני: עגלה */}
      <button onClick={() => navigate('cart')}
        style={{ background: 'none', border: 'none', position: 'relative', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-soft)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cartCount > 0 && (
          <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'var(--amber)', color: 'white', borderRadius: '50%', width: '17px', height: '17px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
            {cartCount}
          </span>
        )}
      </button>

    </header>
  );
}
