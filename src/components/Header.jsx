import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { setSidebarOpen, cartCount, navigate } = useApp();

  return (
    <header style={{
      background: 'var(--warm-white)',
      borderBottom: '1px solid var(--light-border)',
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Hamburger – Right */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{ background: 'none', border: 'none', padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}
        aria-label="תפריט"
      >
        {[0,1,2].map(i => (
          <span key={i} style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: 'var(--dark)',
            borderRadius: '2px',
            transition: 'all 0.3s',
          }} />
        ))}
      </button>

      {/* Logo – Left */}
      <button
        onClick={() => navigate('home')}
        style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: '900',
          color: 'var(--deep-sage)',
          lineHeight: '1',
        }}>
          אחינועם
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: '400',
          color: 'var(--terracotta)',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}>
          מתנות | עיצוב | סדנאות
        </div>
      </button>

      {/* Cart icon */}
      <button
        onClick={() => navigate('cart')}
        style={{ background: 'none', border: 'none', position: 'relative', padding: '4px', fontSize: '22px' }}
        aria-label="סל קניות"
      >
        🛒
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-4px',
            background: 'var(--terracotta)',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
          }}>
            {cartCount}
          </span>
        )}
      </button>
    </header>
  );
}
