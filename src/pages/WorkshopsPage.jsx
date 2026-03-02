import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function ImageGallery({ images, label }) {
  const imgs = (images || []).filter(Boolean);
  const [pos, setPos] = React.useState(0);
  const [moving, setMoving] = React.useState(false);
  const trackRef = React.useRef(null);

  if (!imgs.length) return (
    <div style={{ paddingTop: '55%', background: 'var(--amber-soft)', position: 'relative', borderRadius: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '68px' }}>✨</div>
    </div>
  );

  const total = imgs.length;

  const slideTo = (newPos) => {
    if (moving || total < 2) return;
    setMoving(true);
    const cardW = trackRef.current ? trackRef.current.offsetWidth * 0.56 + 10 : 200;
    const step = ((newPos - pos + total) % total);
    const dir  = step <= total / 2 ? step : step - total;
    const px   = dir * cardW;
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.42s cubic-bezier(0.4,0,0.2,1)';
      trackRef.current.style.transform  = `translateX(${px}px)`;
    }
    setTimeout(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform  = 'translateX(0)';
      }
      setPos(newPos);
      setMoving(false);
    }, 430);
  };

  const go = (dir) => slideTo(((pos + dir) % total + total) % total);
  const getIdx = (o) => (pos + o + total) % total;

  const ArrowBtn = ({ dir }) => (
    <button onClick={() => go(dir)}
      style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white',
        border: '1.5px solid rgba(196,134,26,0.35)', color: 'var(--amber)',
        fontSize: '20px', cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'white'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--amber)'; }}
    >{dir === -1 ? '‹' : '›'}</button>
  );

  return (
    <div>
      {/* חיצים + track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', padding: '16px 0 8px' }}>
        <ArrowBtn dir={-1} />

        {/* track */}
        <div style={{ flex: 1, overflow: 'hidden', borderRadius: '16px' }}>
          <div ref={trackRef} style={{ display: 'flex', gap: '10px' }}>
            {/* תמונה שמאל – קטנה */}
            {total > 1 && (
              <div onClick={() => go(-1)} style={{ flex: '0 0 20%', borderRadius: '12px', overflow: 'hidden', opacity: 0.55, cursor: 'pointer', alignSelf: 'center' }}>
                <img src={imgs[getIdx(-1)]} alt="" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            {/* תמונה מרכזית */}
            <div style={{ flex: '0 0 56%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.16)' }}>
              <img src={imgs[pos]} alt={label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* תמונה ימין – קטנה */}
            {total > 1 && (
              <div onClick={() => go(1)} style={{ flex: '0 0 20%', borderRadius: '12px', overflow: 'hidden', opacity: 0.55, cursor: 'pointer', alignSelf: 'center' }}>
                <img src={imgs[getIdx(1)]} alt="" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
          </div>
        </div>

        <ArrowBtn dir={1} />
      </div>

      {/* נקודות */}
      {total > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          {imgs.map((_, i) => (
            <div key={i} onClick={() => slideTo(i)}
              style={{ width: i === pos ? '18px' : '6px', height: '6px', borderRadius: '3px',
                background: i === pos ? 'var(--amber)' : 'rgba(0,0,0,0.18)',
                cursor: 'pointer', transition: 'all 0.3s' }} />
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
