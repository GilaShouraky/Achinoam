import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function WorkshopsPage({ subCatOverride } = {}) {
  const { navigate, pageData, content, workshops } = useApp();
  const [activeId, setActiveId] = useState(subCatOverride || pageData?.subCategory || workshops[0]?.id || '');
  const ws = workshops.find(w => w.id === activeId) || workshops[0];

  if (!workshops.length) return (
    <div style={{ textAlign: 'center', padding: '80px 30px', color: 'var(--light)' }}>
      <div style={{ fontSize: '46px', marginBottom: '14px' }}>🧵</div><p>טוענת סדנאות...</p>
    </div>
  );

  return (
    <div className="fade-in">
      {/* ─── Header ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #D4A840, #BF922A)',
        padding: '20px 40px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(50px)' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', direction: 'ltr', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
          <button className="back-btn" onClick={() => navigate('category', 'workshops')}>
            → חזרה לקטגוריות
          </button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: '900', color: 'white', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.12)', position: 'relative', zIndex: 1 }}>
          סדנאות אומנות
        </h1>
      </div>

      <div style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--border-light)', padding: '14px 28px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {workshops.map(w => (
          <button key={w.id} onClick={() => setActiveId(w.id)}
            style={{ padding: '7px 17px', borderRadius: '50px', border: 'none', background: activeId === w.id ? 'var(--grad-amber)' : 'var(--cream)', color: activeId === w.id ? 'white' : 'var(--mid)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', boxShadow: activeId === w.id ? '0 3px 12px rgba(196,134,26,0.28)' : 'none' }}>
            {w.emoji} {w.label}
          </button>
        ))}
      </div>

      {ws && (
        <div style={{ maxWidth: '760px', margin: '38px auto 78px', padding: '0 28px' }}>
          <div style={{ background: 'var(--warm-white)', borderRadius: '26px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ background: 'linear-gradient(145deg, var(--amber-soft), var(--amber-pale))', paddingTop: '38%', position: 'relative' }}>
              {ws.images?.[0] ? (
                <img src={ws.images[0]} alt={ws.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '68px', animation: 'float 3s ease-in-out infinite' }}>{ws.emoji}</div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'var(--grad-amber)' }} />
            </div>
            <div style={{ padding: '32px 36px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--amber)', fontWeight: '900', marginBottom: '14px' }}>{ws.label}</h2>
              <div style={{ width: '36px', height: '2.5px', background: 'var(--grad-amber)', borderRadius: '2px', marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', color: 'var(--mid)', lineHeight: '1.9', marginBottom: '18px' }}>{ws.description}</p>
              {ws.details && (
                <div style={{ background: 'var(--amber-soft)', borderRadius: '14px', padding: '16px 18px', marginBottom: '26px', borderRight: '3px solid var(--amber)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8' }}>{ws.details}</p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {ws.priceNote && <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--amber)', fontWeight: '700' }}>{ws.priceNote}</span>}
                <a href={`https://wa.me/${content.whatsapp_number}?text=${encodeURIComponent('היי! אני מעוניינת בסדנת ' + ws.label)}`}
                  target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ textDecoration: 'none' }}>
                  💬 לקביעת מקום בסדנא
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
