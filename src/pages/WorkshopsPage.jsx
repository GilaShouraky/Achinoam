import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function ImageGallery({ images, label }) {
  const imgs = (images || []).filter(Boolean);
  const [cur, setCur] = React.useState(0);
  const [sliding, setSliding] = React.useState(false);
  const [slideDir, setSlideDir] = React.useState(0); // -1 = left, 1 = right
  const [nextIdx, setNextIdx] = React.useState(null);

  if (!imgs.length) return (
    <div style={{ paddingTop: '55%', background: 'var(--amber-soft)', position: 'relative', borderRadius: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '68px' }}>✨</div>
    </div>
  );

  const total = imgs.length;

  const go = (dir) => {
    if (sliding || total < 2) return;
    const next = ((cur + dir) % total + total) % total;
    setNextIdx(next);
    setSlideDir(dir);
    setSliding(true);
    setTimeout(() => {
      setCur(next);
      setSliding(false);
      setNextIdx(null);
    }, 380);
  };

  // current image: slides out in dir direction
  // next image: slides in from opposite
  const curStyle = sliding ? {
    transform: `translateX(${slideDir * -110}%)`,
    transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
    opacity: 0,
  } : { transform: 'translateX(0)', transition: 'none', opacity: 1 };

  const nextStyle = sliding ? {
    transform: 'translateX(0)',
    transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
    opacity: 1,
  } : { transform: `translateX(${slideDir * 110}%)`, transition: 'none', opacity: 1 };

  return (
    <div style={{ padding: '16px 0 20px' }}>
      {/* Main sliding area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* חץ ימין */}
        <button onClick={() => go(-1)}
          style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', border: '1.5px solid rgba(196,134,26,0.3)', color: 'var(--amber)', fontSize: '20px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--amber)'; }}>‹</button>

        {/* תמונה מרכזית עם slide */}
        <div style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.15)', position: 'relative', aspectRatio: '4/3' }}>
          {/* תמונה נוכחית */}
          <img src={imgs[cur]} alt={label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...curStyle }} />
          {/* תמונה הבאה */}
          {sliding && nextIdx !== null && (
            <img src={imgs[nextIdx]} alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                transform: `translateX(${slideDir * 110}%)`,
                animation: `slideIn${slideDir > 0 ? 'R' : 'L'} 0.38s cubic-bezier(0.4,0,0.2,1) forwards`,
              }} />
          )}
          <style>{`
            @keyframes slideInR { from { transform: translateX(110%); } to { transform: translateX(0); } }
            @keyframes slideInL { from { transform: translateX(-110%); } to { transform: translateX(0); } }
          `}</style>
        </div>

        {/* חץ שמאל */}
        <button onClick={() => go(1)}
          style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', border: '1.5px solid rgba(196,134,26,0.3)', color: 'var(--amber)', fontSize: '20px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--amber)'; }}>›</button>
      </div>

      {/* נקודות */}
      {total > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
          {imgs.map((_, i) => (
            <div key={i} onClick={() => !sliding && go(i > cur ? 1 : -1)}
              style={{ width: i === cur ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === cur ? 'var(--amber)' : 'rgba(0,0,0,0.18)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}


export default function WorkshopsPage({ subCatOverride } = {}) {
  const { navigate, pageData, content, workshops } = useApp();
  const [activeId, setActiveId] = useState(subCatOverride || pageData?.subCategory || workshops[0]?.id || '');
  const ws = workshops.find(w => w.id === activeId) || workshops[0];

  if (!workshops.length) return (
    <div style={{ textAlign: 'center', padding: '80px 30px', color: 'var(--light)' }}>
      <p>טוענת סדנאות...</p>
    </div>
  );

  return (
    <div className="fade-in">
      {/* ─── Header ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #D4A840, #BF922A)',
        minHeight: '130px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '20px 120px',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(50px)' }} />
        {/* כפתור חזרה – absolute ימין */}
        <div style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', zIndex: 2 }}>
          <button className="back-btn" onClick={() => navigate('category', 'workshops')}>→ חזרה לקטגוריות</button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: '900', color: 'white', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.12)', position: 'relative', zIndex: 1, margin: 0 }}>
          {content.workshops_title || 'סדנאות אומנות'}
        </h1>
      </div>

      {/* טאבים */}
      <div style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--border-light)', padding: '14px 28px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {workshops.map(w => (
          <button key={w.id} onClick={() => setActiveId(w.id)}
            style={{ padding: '7px 17px', borderRadius: '50px', border: 'none', background: activeId === w.id ? 'var(--grad-amber)' : 'var(--cream)', color: activeId === w.id ? 'white' : 'var(--mid)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', boxShadow: activeId === w.id ? '0 3px 12px rgba(196,134,26,0.28)' : 'none' }}>
            {w.label}
          </button>
        ))}
      </div>

      {ws && (
        <div style={{ maxWidth: '760px', margin: '38px auto 78px', padding: '0 28px' }}>
          <div style={{ background: 'var(--warm-white)', borderRadius: '26px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', padding: '20px 28px 32px' }}>

            {/* גלריה */}
            <ImageGallery images={ws.images} label={ws.label} />

            <div style={{ marginTop: '28px' }}>
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
                  לקביעת מקום בסדנא
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
