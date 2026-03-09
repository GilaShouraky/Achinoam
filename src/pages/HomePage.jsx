import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/products';

// קרוסלה עם CSS sliding אמיתי 
function Carousel({ items, color, title, bg }) {
 const [pos, setPos] = useState(0);
 const [moving, setMoving] = useState(false);
 const CARD_GAP = 14;
 const trackRef = useRef(null);
 const total = items.length;
 const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth <= 768);
 const visibleCount = isMobile ? 1 : 4;
 React.useEffect(() => {
   const handler = () => setIsMobile(window.innerWidth <= 768);
   window.addEventListener('resize', handler);
   return () => window.removeEventListener('resize', handler);
 }, []);

 const getCardW = () => {
 if (!trackRef.current) return 220;
 return (trackRef.current.offsetWidth - CARD_GAP * (visibleCount - 1)) / visibleCount;
 };

 const slideTo = (newPos) => {
 if (moving) return;
 setMoving(true);
 const cardW = getCardW();
 const step = ((newPos - pos + total) % total);
 const dir = step <= total / 2 ? step : step - total; // קצר יותר
 const px = dir * (cardW + CARD_GAP);

 if (trackRef.current) {
 trackRef.current.style.transition = `transform 0.42s cubic-bezier(0.4,0,0.2,1)`;
 trackRef.current.style.transform = `translateX(${px}px)`;
 }
 setTimeout(() => {
 if (trackRef.current) {
 trackRef.current.style.transition = 'none';
 trackRef.current.style.transform = 'translateX(0)';
 }
 setPos(newPos);
 setMoving(false);
 }, 430);
 };

 const go = (dir) => slideTo(((pos + dir) % total + total) % total);

 // מה שמוצג: 4 קלפים מהמיקום הנוכחי (circular)
 const visible = Array.from({ length: Math.min(visibleCount, total) }, (_, i) => items[(pos + i) % total]);

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
 className="carousel-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleCount}, 1fr)`, gap: `${CARD_GAP}px` }}>
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
 const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 600);
 React.useEffect(() => {
   const fn = () => setIsMobile(window.innerWidth <= 600);
   window.addEventListener('resize', fn);
   return () => window.removeEventListener('resize', fn);
 }, []);

 const featuredIds = (content.featured_ids || '').split(',').map(s => s.trim()).filter(Boolean);
 const featured = featuredIds.length > 0
 ? featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean)
 : products.slice(0, 8);

 const under100 = products.filter(p => Number(p.price) > 0 && Number(p.price) <= 100);

 // קטגוריות ישירות מהמוצרים
 const allSubCats = categories.products.subCategories;
 const mainCats = allSubCats.filter(sub => products.some(p => p.category === sub.id));

 return (
 <div>
 {/* Hero */}
 <section className="hero-section" style={{
 position: 'relative', overflow: 'hidden',
 minHeight: 'clamp(200px, 28vw, 360px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 textAlign: 'center',
 }}>
 {/* תמונת רקע */}
 <img
 src="https://i.ibb.co/CK4VYPTt/Whats-App-Image-2026-03-01-at-03-16-12.jpg"
 alt=""
 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', filter: 'brightness(0.75)' }}
 />
 <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)' }} />
 {/* טקסט */}
 <div style={{ position: 'relative', zIndex: 1, maxWidth: '660px', margin: '0 auto', padding: '0 28px' }}>
 <p className="fade-in hero-subtitle" style={{ fontSize: 'clamp(14px,3.2vw,32px)', color: 'var(--rose)', fontWeight: '400', marginBottom: '10px', textShadow: 'none' }}>
 <span className="hero-subtitle-mobile">מחפשים מתנה לעצמיכם?<br/>לאהובים עליכם?</span>
 <span className="hero-subtitle-desktop">{content.hero_subtitle}</span>
 </p>
 <h1 className="fade-in fade-in-delay-1 hero-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,9vw,90px)', fontWeight: '900', color: 'var(--rose)', lineHeight: '1.1', textShadow: 'none' }}>{content.hero_title}</h1>
 </div>
 </section>

 {/* חץ מונפש - מובייל בלבד */}
 <div className="scroll-arrow-mobile" style={{ display: 'none', justifyContent: 'center', padding: '42px 40px 36px', background: 'var(--warm-white)' }}>
 <div style={{ animation: 'bounceDown 1.4s ease-in-out infinite', color: 'var(--rose)', lineHeight: 1 }}>
 <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M2 2L19 19L36 2" stroke="var(--rose)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
 </div>
 </div>

 {/* About */}
 <section style={{ background: 'var(--warm-white)', padding: '48px 28px', borderBottom: '1px solid var(--border-light)' }}>
 <div className="about-flex" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '48px', direction: 'rtl' }}>
 {/* תמונה */}
 <div style={{ flexShrink: 0, width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 32px rgba(139,90,107,0.18)', border: 'none', background: '#D4B0BE' }}>
 <img src="https://i.ibb.co/vCRMZYPs/25.png" alt="אחינועם"
 style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
 </div>
 {/* טקסט */}
 <div style={{ flex: 1, textAlign: 'right' }}>
 <p style={{ fontSize: '16px', lineHeight: '2.1', color: 'var(--mid)', whiteSpace: 'pre-line' }}>{content.about_text}</p>
 <p className="about-signature" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--rose)', fontWeight: '900', marginTop: '14px' }}>{content.about_signature}</p>
 </div>
 </div>
 </section>

 {/* קטגוריות */}
 <section style={{ padding: 'clamp(48px,8vw,76px) 28px', maxWidth: '980px', margin: '0 auto' }}>
 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: '900', color: 'var(--rose)', textAlign: 'center', marginBottom: '40px' }}>הקולקציות שלי</h2>
 <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(mainCats.length, 3)}, 1fr)`, gap: '20px' }}>
 {mainCats.map((sub, i) => {
 const imgKey = content[`subcat_${sub.id}`];
 const imgUrl = imgKey && imgKey.startsWith('http') ? imgKey : null;
 return (
 <div key={sub.id} onClick={() => navigate('products', { subCategory: sub.id })}
 style={{ borderRadius: '22px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), box-shadow 0.26s', position: 'relative' }}
 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
 >
 <div style={{ width: '100%', height: isMobile ? '260px' : '400px', position: 'relative', overflow: 'hidden', background: 'var(--rose-soft)' }}>
   {imgUrl && <img src={imgUrl} alt={sub.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.82)' }} />}
   {/* overlay */}
   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)' }} />
   {/* כיתוב במרכז */}
   <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
     <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: '900', color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.5)', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>{sub.label}</h3>
   </div>
 </div>
 </div>
 );
 })}
 </div>
 </section>

 {/* מוצרים נבחרים */}
 {featured.length > 0 && (
 <section style={{ paddingTop: '44px' }}>
 <Carousel items={featured} color="var(--rose)" title="מוצרים נבחרים" />
 </section>
 )}

 {/* מתנות עד 100 */}
 {under100.length > 0 && (
 <Carousel items={under100} color="var(--amber)" title="מתנות עד 100 ₪" bg="var(--amber-soft)" />
 )}
 </div>
 );
}
