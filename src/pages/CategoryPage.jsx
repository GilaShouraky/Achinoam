import React from 'react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/products';

const subCatVisuals = {
 pesach: { emoji: '', bg: 'linear-gradient(145deg, #F5E8E8, #EDD0D0)' },
 sof_shana: { emoji: '', bg: 'linear-gradient(145deg, #F5F0E0, #E8D890)' },
 shabat: { emoji: '', bg: 'linear-gradient(145deg, #EDE8F5, #D0C0E8)' },
 notebooks: { emoji: '', bg: 'linear-gradient(145deg, #E8EEF5, #C0D0E4)' },
 embroidery: { emoji: '', bg: 'linear-gradient(145deg, #F5E8EE, #E8C0D0)' },
 under100: { emoji: '', bg: 'linear-gradient(145deg, #E8F5EC, #C0E0CC)' },
 bride: { emoji: '', bg: 'linear-gradient(145deg, #F8F0E8, #EDD8C0)' },
 invitations: { emoji: '', bg: 'linear-gradient(145deg, #E8EEF8, #C0CCE8)' },
 flyers: { emoji: '', bg: 'linear-gradient(145deg, #EAF0F8, #C8D4EC)' },
 branding: { emoji: '', bg: 'linear-gradient(145deg, #E8EDF5, #C0C8D8)' },
 macrame: { emoji: '', bg: 'linear-gradient(145deg, #F5EEE8, #E4D4C0)' },
 embroidery_ws: { emoji: '', bg: 'linear-gradient(145deg, #F5E8F0, #E4C0D4)' },
 art_general: { emoji: '', bg: 'linear-gradient(145deg, #E8EEF5, #C0CCE8)' },
};

const catMeta = {
 products: { title: 'המוצרים שלי', color: 'var(--rose)', grad: 'var(--grad-rose)', headerBg: 'linear-gradient(135deg, #C0A0BC, #A885A8)', targetPage: 'products' },
 graphics: { title: 'עבודות גרפיקה', color: 'var(--slate)', grad: 'var(--grad-slate)', headerBg: 'linear-gradient(135deg, #8AB4CC, #6E9EBA)', targetPage: 'graphics' },
 workshops: { title: 'סדנאות אומנות', color: 'var(--amber)', grad: 'var(--grad-amber)', headerBg: 'linear-gradient(135deg, #C8A840, #B09030)', targetPage: 'workshops' },
};

export default function CategoryPage({ catKeyOverride } = {}) {
 const { navigate, pageData, workshops, content } = useApp();
 const catKey = catKeyOverride || pageData || 'products';
 const meta = catMeta[catKey] || catMeta.products;

 const subs = catKey === 'workshops'
 ? (workshops || []).map(w => ({ id: w.id, label: w.label }))
 : (categories[catKey]?.subCategories || []);

 // תמונות קטגוריות מגיליון "קטגוריות ראשיות"
 const getCatImage = (subId) => {
 const val = content[`subcat_${subId}`];
 return val && val.startsWith('http') ? val : null;
 };

 return (
 <div className="fade-in">
 {/* Header בהיר עם צבע הקטגוריה */}
 <div style={{
 background: meta.headerBg,
 minHeight: '130px',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 position: 'relative', overflow: 'hidden',
 padding: '20px 20px',
 }}>
 <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(50px)' }} />
 <div style={{ position: 'absolute', top: '14px', right: '16px', zIndex: 2 }}>
 <button className="back-btn" onClick={() => navigate('home')}>→ חזרה לדף הבית</button>
 </div>
 <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '40px' }}>
 <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,5vw,40px)', fontWeight: '900', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.12)', margin: '0 0 6px' }}>
 {meta.title}
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>בחרי קטגוריה להמשך</p>
 </div>
 </div>

 {/* גריד
 {/* גריד קטגוריות */}
 <div style={{ maxWidth: '980px', margin: '36px auto 68px', padding: '0 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '18px' }}>
 {subs.map(sub => {
 const v = subCatVisuals[sub.id] || { emoji: '', bg: 'linear-gradient(145deg, var(--cream), var(--parchment))' };
 const imgUrl = getCatImage(sub.id);
 return (
 <div key={sub.id}
 onClick={() => navigate(meta.targetPage, { subCategory: sub.id })}
 style={{ background: 'var(--warm-white)', border: '1px solid var(--border-light)', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.24s cubic-bezier(0.22,1,0.36,1), box-shadow 0.24s' }}
 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
 >
 <div style={{ paddingTop: '70%', position: 'relative', background: imgUrl ? 'transparent' : v.bg }}>
 {imgUrl ? (
 <img src={imgUrl} alt={sub.label}
 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
 ) : (
 <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '46px', animation: 'float 3s ease-in-out infinite' }}>
 {v.emoji}
 </span>
 )}
 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: meta.grad }} />
 </div>
 <div style={{ padding: '13px 15px', textAlign: 'center' }}>
 <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '700', color: meta.color }}>{sub.label}</p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
