import React, { useState, useEffect } from 'react';

export default function Accessibility() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(0); // 0=רגיל, 1=גדול, 2=גדול מאוד
  const [contrast, setContrast] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [noAnimations, setNoAnimations] = useState(false);

  useEffect(() => {
    document.body.classList.remove('a11y-font-1', 'a11y-font-2');
    if (fontSize === 1) document.body.classList.add('a11y-font-1');
    if (fontSize === 2) document.body.classList.add('a11y-font-2');
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.style.filter = contrast ? 'contrast(1.5) saturate(0.7)' : '';
  }, [contrast]);

  useEffect(() => {
    const id = 'a11y-links';
    let s = document.getElementById(id);
    if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); }
    s.textContent = highlight ? 'a { outline: 2px solid #c0392b !important; text-decoration: underline !important; }' : '';
  }, [highlight]);

  useEffect(() => {
    const id = 'a11y-anim';
    let s = document.getElementById(id);
    if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); }
    s.textContent = noAnimations ? '*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }' : '';
  }, [noAnimations]);

  const reset = () => {
    setFontSize(0);
    setContrast(false);
    setHighlight(false);
    setNoAnimations(false);
    document.documentElement.style.fontSize = '';
    document.documentElement.style.filter = '';
  };

  const btn = (active, onClick, label) => (
    <button onClick={onClick} style={{
      width: '100%', padding: '11px 14px', borderRadius: '10px', border: 'none',
      background: active ? 'var(--rose)' : '#f5f0f2',
      color: active ? 'white' : 'var(--dark)',
      fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600',
      cursor: 'pointer', textAlign: 'right', direction: 'rtl',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background 0.2s, color 0.2s',
    }}>
      <span>{label}</span>
      {active && <span>✓</span>}
    </button>
  );

  return (
    <>
      <style>{`
        @keyframes a11ySlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* כפתור צף */}
      <button onClick={() => setOpen(o => !o)} title="תפריט נגישות"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9990,
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--rose)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139,90,107,0.35)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* אייקון נגישות סטנדרטי */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="3.5" r="2"/>
          <path d="M5 8.5l7-1 7 1" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M12 7.5v5l-3 6M12 12.5l3 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      </button>

      {/* פאנל */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', left: '24px', zIndex: 9990,
          width: '250px', background: 'white', borderRadius: '18px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)', padding: '20px',
          direction: 'rtl', animation: 'a11ySlideUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--rose)', margin: 0 }}>נגישות</h3>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--light)' }}>✕</button>
          </div>

          {/* גודל טקסט */}
          <div style={{ background: '#f5f0f2', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--mid)', margin: '0 0 8px' }}>גודל טקסט</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{val:0,size:'13px'},{val:1,size:'17px'},{val:2,size:'22px'}].map(({val,size}) => (
                <button key={val} onClick={() => setFontSize(val)} style={{
                  flex: 1, padding: '7px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: fontSize === val ? 'var(--rose)' : 'white',
                  color: fontSize === val ? 'white' : 'var(--dark)',
                  fontFamily: 'serif', fontSize: size, fontWeight: '700',
                  transition: 'background 0.2s, color 0.2s',
                }}>A</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {btn(contrast, () => setContrast(c => !c), 'ניגודיות גבוהה')}
            {btn(highlight, () => setHighlight(h => !h), 'הדגשת קישורים')}
            {btn(noAnimations, () => setNoAnimations(a => !a), 'עצירת אנימציות')}
            <button onClick={reset} style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              border: '1.5px solid #e0d6cc', background: 'white',
              color: 'var(--light)', fontFamily: 'var(--font-body)', fontSize: '13px',
              cursor: 'pointer', marginTop: '4px',
            }}>איפוס הכל</button>
          </div>
        </div>
      )}
    </>
  );
}
