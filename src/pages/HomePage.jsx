import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

// ─── קרוסלה עם CSS sliding אמיתי ──────────────────────────
function Carousel({ items, color, title, bg }) {
  const [pos, setPos]     = useState(0);   // אינדקס נוכחי (0..total-1)
  const [moving, setMoving] = useState(false);
  const CARD_GAP  = 14;
  const trackRef  = useRef(null);
  const total     = items.length;

  // רוחב קלף מחושב דינמית
  const getCardW = () => {
    if (!trackRef.current) return 220;
    return (trackRef.current.offsetWidth - CARD_GAP * 3) / 4;
  };

  const slideTo = (newPos) => {
    if (moving) return;
    setMoving(true);
    const cardW  = getCardW();
    const step   = ((newPos - pos + total) % total);
    const dir    = step <= total / 2 ? step : step - total; // קצר יותר
    const px     = dir * (cardW + CARD_GAP);

    if (trackRef.current) {
      trackRef.current.style.transition = `transform 0.42s cubic-bezier(0.4,0,0.2,1)`;
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

  // מה שמוצג: 4 קלפים מהמיקום הנוכחי (circular)
  const visible = Array.from({ length: Math.min(4, total) }, (_, i) => items[(pos + i) % total]);

  const Arrow = ({ dir }) => {
    const label = dir === -1 ? '‹' : '›';
    return (
      <button onClick={() => go(dir)}
        style={{
          width: '42px', height: '42px', borderRadius: '50%',
          background: 'white', border: `1.5px solid ${color}40`,
          color, fontSize: '22px', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.18s, background 0.18s, color 0.18s',
          fontFamily: 'var(--font-body)', lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = color; e.currentTarget.style.transform = 'scale(1)'; }}
      >{label}</button>
    );
  };

  if (!total) return null;

  return (
    <div style={{ background: bg || 'transparent', padding: bg ? '44px 0 50px' : '0 0 50px', borderTop: bg ? '1px solid var(--border-light)' : 'none', borderBottom: bg ? '1px solid var(--border-light)' : 'none' }}>
      {/* כותרת */}
      <div style={{ maxWidth: '1060px', margin: '0 auto 22px', padding: '0 68px', textAlign: 'right' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color }}>{title}</h2>
      </div>

      {/* חיצים + קלפים */}
      <div style={{ maxWidth: '1060px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 18px' }}>
        <Arrow dir={-1} />

        {/* window — overflow:hidden מסתיר את מה שמחוץ */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div ref={trackRef}
            style={{ display: 'grid', gridTemplateColumns: `repeat(4, 1fr)`, gap: `${CARD_GAP}px` }}>
            {visible.map((p, i) => (
              <div key={`${pos}-${i}`}>
                <ProductCard product={p} size="small" />
              </div>
            ))}
          </div>
        </div>

        <Arrow dir={1} />
      </div>

      {/* dots */}
      {total > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
          {items.map((_, i) => (
            <div key={i} onClick={() => slideTo(i)}
              style={{ width: i === pos ? '20px' : '7px', height: '7px', borderRadius: '4px', background: i === pos ? color : 'var(--border)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}

const isImageUrl = (val) => val && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i.test(val);

export default function HomePage() {
  const { content, navigate, products } = useApp();

  const featuredIds = (content.featured_ids || '').split(',').map(s => s.trim()).filter(Boolean);
  const featured = featuredIds.length > 0
    ? featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean)
    : products.slice(0, 8);

  const under100 = products.filter(p => Number(p.price) > 0 && Number(p.price) <= 100);

  const mainCats = [
    { key: 'products',  pageData: 'products',  icon: '🎁', title: 'המוצרים שלי',    desc: 'קולקציות עונתיות, מתנות ממותגות ופריטים בעיצוב אישי', color: 'var(--rose)',  grad: 'var(--grad-rose)',  bg: 'var(--rose-soft)',  imgKey: content.cat_products_image },
    { key: 'graphics',  pageData: 'graphics',  icon: '🎨', title: 'עבודות גרפיקה', desc: 'הזמנות, פלאיירים ומיתוגים לעסק ולאירועים',           color: 'var(--slate)', grad: 'var(--grad-slate)', bg: 'var(--slate-soft)', imgKey: content.cat_graphics_image },
    { key: 'workshops', pageData: 'workshops', icon: '🧵', title: 'סדנאות אומנות',  desc: 'סדנאות מקרמה, ריקמה ואומנות לכל הגילאים',            color: 'var(--amber)', grad: 'var(--grad-amber)', bg: 'var(--amber-soft)', imgKey: content.cat_workshops_image },
  ];

  return (
    <div>
      {/* ─── Hero ─── */}
      <section style={{ background: 'var(--grad-warm)', padding: 'clamp(56px,10vw,96px) 28px clamp(48px,8vw,76px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '320px', height: '320px', background: 'var(--rose)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.07, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '240px', height: '240px', background: 'var(--slate)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.07, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '12%', right: '8%', fontSize: '28px', opacity: 0.13, transform: 'rotate(15deg)' }}>❀</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '6%', fontSize: '22px', opacity: 0.1, transform: 'rotate(-10deg)' }}>✿</div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '660px', margin: '0 auto' }}>
          <p className="fade-in" style={{ fontSize: 'clamp(13px,1.8vw,16px)', color: 'var(--mid)', fontWeight: '500', marginBottom: '8px' }}>{content.hero_subtitle}</p>
          <h1 className="fade-in fade-in-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,7vw,70px)', fontWeight: '900', color: 'var(--rose)', lineHeight: '1.1' }}>{content.hero_title}</h1>
        </div>
      </section>

      {/* ─── About ─── */}
      <section style={{ background: 'var(--warm-white)', padding: '48px 28px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '48px', direction: 'rtl' }}>
          {/* תמונה */}
          <div style={{ flexShrink: 0, width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 32px rgba(139,90,107,0.18)', border: '4px solid var(--rose-soft)' }}>
            <img src="https://i.ibb.co/vCRMZYPs/25.png" alt="אחינועם"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </div>
          {/* טקסט */}
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ fontSize: '14px', lineHeight: '2', color: 'var(--mid)', whiteSpace: 'pre-line' }}>{content.about_text}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--rose)', fontWeight: '700', marginTop: '12px' }}>{content.about_signature}</p>
          </div>
        </div>
      </section>

      {/* ─── קטגוריות ─── */}
      <section style={{ padding: 'clamp(48px,8vw,76px) 28px', maxWidth: '980px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: '900', color: 'var(--rose)', textAlign: 'center', marginBottom: '40px' }}>מה תמצאי אצלי?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {mainCats.map((cat, i) => (
            <div key={cat.key} onClick={() => navigate('category', cat.pageData)}
              style={{ background: cat.bg, border: `1px solid ${cat.color}22`, borderRadius: '22px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), box-shadow 0.26s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: cat.grad }} />
              {cat.imgKey ? (
                <div style={{ width: '100%', paddingTop: '55%', position: 'relative', overflow: 'hidden' }}>
                  <img src={cat.imgKey} alt={cat.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ paddingTop: '36px', textAlign: 'center', fontSize: '50px', animation: `float 3s ${i * 0.4}s ease-in-out infinite` }}>{cat.icon}</div>
              )}
              <div style={{ padding: '16px 24px 24px', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: '900', color: cat.color, marginBottom: '8px' }}>{cat.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.7', marginBottom: '18px' }}>{cat.desc}</p>
                <div style={{ display: 'inline-block', padding: '8px 22px', borderRadius: '50px', background: cat.grad, color: 'white', fontSize: '13px', fontWeight: '700' }}>לצפייה ←</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── מוצרים נבחרים ─── */}
      {featured.length > 0 && (
        <section style={{ paddingTop: '44px' }}>
          <Carousel items={featured} color="var(--rose)" title="מוצרים נבחרים" />
        </section>
      )}

      {/* ─── מתנות עד 100 ─── */}
      {under100.length > 0 && (
        <Carousel items={under100} color="var(--amber)" title="🎁 מתנות עד 100 ₪" bg="var(--amber-soft)" />
      )}
    </div>
  );
}
