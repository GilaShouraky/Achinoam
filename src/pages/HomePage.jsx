import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { T, useImg, ImgEditBtn } from '../edit/T';
import { useEdit } from '../edit/EditContext';
import { Eye, EyeOff } from 'lucide-react';
import HomeCategoryTools from '../admin/catalog/HomeCategoryTools';

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


/** אזור בדף הבית שאפשר להסתיר (במצב עריכה יש כפתור הצגה/הסתרה) */
function HomeSection({ k, label, children }) {
 const { t, ops } = useApp();
 const ed = useEdit();
 const hidden = t(k) === 'לא';
 if (!ed?.editMode) return hidden ? null : children;
 const toggle = async () => {
 try { if (hidden) await ops.resetSettings([k]); else await ops.saveSettings({ [k]: 'לא' }); ed.showToast(hidden ? `${label} מוצגים ✓` : `${label} הוסתרו`); }
 catch (e) { ed.showToast(e.message, 'bad'); }
 };
 return (
 <div style={{ position: 'relative' }}>
 <div className="card-tools" style={{ top: 12, left: 16, zIndex: 7 }}>
 <button className="lbl" onClick={toggle}>{hidden ? <><Eye size={14} /> הצגת {label}</> : <><EyeOff size={14} /> הסתרת {label}</>}</button>
 </div>
 {hidden && <span className="card-hidden-badge" style={{ top: 14, bottom: 'auto', right: 16 }}>מוסתר מהגולשים</span>}
 <div style={{ opacity: hidden ? 0.4 : 1 }}>{children}</div>
 </div>
 );
}

export default function HomePage() {
 const { content, navigate, products, subCats, site, t } = useApp();
 const ed = useEdit();
 const editMode = !!ed?.editMode;
 const heroImg = useImg('hero_image');
 const aboutImg = useImg('about_image');
 const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 600);
 const [showPopupImg, setShowPopupImg] = React.useState(false);
 const popupUrl = (!editMode && t('תמונה_קופצת')) || null;
 React.useEffect(() => {
   const timer = setTimeout(() => setShowPopupImg(true), 3000);
   return () => clearTimeout(timer);
 }, []);
 React.useEffect(() => {
   const fn = () => setIsMobile(window.innerWidth <= 600);
   window.addEventListener('resize', fn);
   return () => window.removeEventListener('resize', fn);
 }, []);

 const featuredIds = (content.featured_ids || '').split(',').map(s => s.trim()).filter(Boolean);
 const featured = featuredIds.length > 0
 ? featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean)
 : products.slice(0, 8);

 const maxCheap = Number(t('home.under100_max')) || 100;
 const cheapExclude = (content.under100_exclude || '').split(',').map(s => s.trim()).filter(Boolean);
 const under100 = products.filter(p => Number(p.price) > 0 && Number(p.price) <= maxCheap && !cheapExclude.includes(p.id));

 // קטגוריות דינמיות מהאקסל - לפי סדר האקסל, רק עם מוצרים
 // במצב עריכה מוצגות כל הקטגוריות (גם מוסתרות / בלי תמונה) עם כלי עריכה
 const mainCats = editMode
 ? site.allCats
 : subCats.filter(cat => products.some(p => p.category === cat.id));

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
 <ImgEditBtn k="hero_image" label="החלפת תמונת רקע" />
 {editMode && <ImgEditBtn k="תמונה_קופצת" label={t('תמונה_קופצת') ? 'תמונה קופצת' : 'הוספת תמונה קופצת'} style={{ top: 'auto', bottom: 10 }} />}
 {heroImg && <img
 src={heroImg}
 alt=""
 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', filter: 'brightness(0.75)' }}
 />}
 <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)' }} />
 {/* טקסט */}
 <div style={{ position: 'relative', zIndex: 1, maxWidth: '660px', margin: '0 auto', padding: '0 28px' }}>
 <p className="fade-in hero-subtitle" style={{ fontSize: 'clamp(14px,3.2vw,32px)', color: 'var(--rose)', fontWeight: '400', marginBottom: '10px', textShadow: '0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.7)' }}>
 <span className="hero-subtitle-mobile"><T k="hero_subtitle_mobile" /></span>
 <span className="hero-subtitle-desktop"><T k="hero_subtitle" /></span>
 </p>
 <h1 className="fade-in fade-in-delay-1 hero-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,9vw,90px)', fontWeight: '900', color: 'var(--rose)', lineHeight: '1.1', textShadow: '0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.7)' }}><T k="hero_title" /></h1>
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
 <div style={{ flexShrink: 0, width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 32px rgba(139,90,107,0.18)', border: 'none', background: 'var(--rose-pale, #D4B0BE)', position: 'relative' }}>
 {aboutImg && <img src={aboutImg} alt="אחינועם"
 style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />}
 <ImgEditBtn k="about_image" label="החלפה" style={{ top: 'auto', bottom: 14, left: '50%', transform: 'translateX(-50%)' }} />
 </div>
 {/* טקסט */}
 <div style={{ flex: 1, textAlign: 'right' }}>
 <p style={{ fontSize: '16px', lineHeight: '2.1', color: 'var(--mid)', whiteSpace: 'pre-line' }}><T k="about_text" /></p>
 <p className="about-signature" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--rose)', fontWeight: '900', marginTop: '6px' }}><T k="about_signature" /></p>
 </div>
 </div>
 </section>

 {/* קטגוריות */}
 <section style={{ padding: 'clamp(48px,8vw,76px) 28px', maxWidth: '980px', margin: '0 auto' }}>
 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: '900', color: 'var(--rose)', textAlign: 'center', marginBottom: '40px' }}><T k="home.collections_title" /></h2>
 {(() => {
   const catCard = (sub, height) => {
     const imgUrl = sub.image || (() => { const k = content[`subcat_${sub.id}`]; return k && k.startsWith('http') ? k : null; })();
     const off = editMode && (sub.hidden || !sub.image || !products.some(p => p.category === sub.id));
     return (
       <div key={sub.id} onClick={() => !editMode && navigate('products', { subCategory: sub.id })} className={off ? 'is-hidden-card' : ''}
         style={{ borderRadius: '22px', overflow: 'hidden', cursor: editMode ? 'default' : 'pointer', flex: 1, transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), box-shadow 0.26s', position: 'relative' }}
         onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
         onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
         <div style={{ width: '100%', height: isMobile ? '220px' : height, position: 'relative', overflow: 'hidden', background: 'var(--rose-soft)' }}>
           {imgUrl && <img src={imgUrl} alt={sub.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.82)' }} />}
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)' }} />
           {editMode && <HomeCategoryTools cat={sub} />}
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,2.5vw,34px)', fontWeight: '900', color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.5)', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>{sub.label}</h3>
           </div>
         </div>
       </div>
     );
   };
   // פריסה דינמית: 2 בשורה בדסקטופ, 1 במובייל
   const rows = [];
   for (let i = 0; i < mainCats.length; i += 2) {
     rows.push(mainCats.slice(i, i + 2));
   }
   return (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
       {editMode && <HomeCategoryTools.Add />}
       {rows.map((row, ri) => (
         <div key={ri} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
           {row.map(sub => catCard(sub, '360px'))}
         </div>
       ))}
     </div>
   );
 })()}
 </section>

 {/* מוצרים נבחרים */}
 {featured.length > 0 && (
 <HomeSection k="home.show_featured" label="המוצרים הנבחרים">
 <section style={{ paddingTop: '44px' }}>
 <Carousel items={featured} color="var(--rose)" title={<T k="home.featured_title" />} />
 </section>
 </HomeSection>
 )}

 {/* מתנות עד 100 */}
 {under100.length > 0 && (
 <HomeSection k="home.show_under100" label="המתנות הזולות">
 <Carousel items={under100} color="var(--amber)" title={<T k="home.under100_title" vars={{ max: maxCheap }} />} bg="var(--amber-soft)" />
 </HomeSection>
 )}

 {/* פופאפ תמונה קופצת */}
 {showPopupImg && popupUrl && (
   <div onClick={() => setShowPopupImg(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeInOverlay 0.4s ease' }}>
   <style>{`
     @keyframes fadeInOverlay { from { opacity: 0 } to { opacity: 1 } }
     @keyframes popupEntrance { from { opacity: 0; transform: scale(0.85) translateY(20px) } to { opacity: 1; transform: scale(1) translateY(0) } }
   `}</style>
     <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', animation: 'popupEntrance 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
       <button onClick={() => setShowPopupImg(false)}
         style={{ position: 'absolute', top: '-14px', left: '-14px', width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1 }}>✕</button>
       <img src={popupUrl} alt="מבצע" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', display: 'block', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }} />
     </div>
   </div>
 )}
 </div>
 );
}
