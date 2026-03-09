import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const LOGO_URL = 'https://i.ibb.co/6R35Qkzt/4.png';

export default function Header() {
  const { setSidebarOpen, cartCount, navigate, products } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 600);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val.trim()) { setResults([]); return; }
    const q = val.toLowerCase();
    const found = (products || []).filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 6);
    setResults(found);
  };

  const handleSelect = (p) => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
    navigate('product', p);
  };

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

      {/* ימין: 3 פסים */}
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



      {/* שמאל: חיפוש + עגלה */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {/* חיפוש inline */}
        <div ref={searchRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {searchOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--rose-soft)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '5px 12px', gap: '6px', width: isMobile ? '160px' : '260px', transition: 'width 0.3s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input ref={inputRef} value={query} onChange={e => handleSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontFamily: 'var(--font-body)', direction: 'rtl', background: 'transparent', color: 'var(--dark)' }} />
              <button onClick={() => { setSearchOpen(false); setQuery(''); setResults([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)', fontSize: '14px', lineHeight: 1, padding: 0 }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)}
              style={{ background: 'none', border: 'none', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          )}

          {/* תוצאות dropdown */}
          {searchOpen && (results.length > 0 || query) && (
            <div style={{ position: 'absolute', left: 0, top: '46px', width: '240px', zIndex: 200, direction: 'rtl' }}>
              {results.length > 0 && (
                <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  {results.map(p => (
                    <button key={p.id} onClick={() => handleSelect(p)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', direction: 'rtl', borderBottom: '1px solid var(--border-light)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-soft)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--rose)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: '600' }}>₪{p.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {query && results.length === 0 && (
                <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '10px', textAlign: 'center', color: 'var(--light)', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>לא נמצאו מוצרים</div>
              )}
            </div>
          )}
        </div>

        {/* עגלה */}
        <button onClick={() => navigate('cart')}
          style={{ background: 'none', border: 'none', position: 'relative', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s', cursor: 'pointer' }}
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
      </div>

    </header>
  );
}
