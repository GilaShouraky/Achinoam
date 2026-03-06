import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProductPage({ productOverride } = {}) {
 const { pageData, navigate, addToCart, content } = useApp();
 const product = productOverride || pageData;
 const fromSubCat = product?._fromSubCategory;
 const [qty, setQty] = useState(1);
 const [added, setAdded] = useState(false);
 const [activeImg, setActiveImg] = useState(0);
 const [animating, setAnimating] = useState(false);

 if (!product) return null;

 const price = Number(product.price);
 const hasPrice = price > 0;
 const priceDisplay = hasPrice ? `₪${price}` : product.priceNote || 'מחיר לפי הצעה';
 const imgs = product.images?.filter(Boolean) || [];

 const switchImage = (i) => {
 if (i === activeImg || animating) return;
 setAnimating(true);
 setTimeout(() => {
 setActiveImg(i);
 setAnimating(false);
 }, 220);
 };

 const handleAdd = () => { addToCart(product, qty); setAdded(true); setTimeout(() => setAdded(false), 2000); };

 return (
 <div className="fade-in">
 <style>{`
 @keyframes imgFadeIn {
 from { opacity: 0; transform: scale(1.03); }
 to { opacity: 1; transform: scale(1); }
 }
 .main-img-enter { animation: imgFadeIn 0.28s ease; }
 `}</style>

 <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 28px 80px' }}>
 {/* כפתור חזרה */}
 <div style={{ display: 'flex', justifyContent: 'flex-end', direction: 'ltr', marginBottom: '26px' }}>
 <button className="back-btn" onClick={() => navigate('products', fromSubCat ? { subCategory: fromSubCat } : undefined)}>→ חזרה למוצרים</button>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '44px', alignItems: 'start' }}>

 {/* עמודת תמונות */}
 <div>
 {/* תמונה מרכזית */}
 <div style={{ background: 'linear-gradient(145deg, var(--cream), var(--rose-soft))', borderRadius: '24px', paddingTop: '100%', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
 {imgs[activeImg] ? (
 <img
 key={activeImg}
 src={imgs[activeImg]}
 alt={product.name}
 className="main-img-enter"
 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
 />
 ) : (
 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '76px', animation: 'float 3s ease-in-out infinite' }}>
 {product.emoji || ''}
 </div>
 )}
 </div>

 {/* thumbnails – רק אם יש יותר מתמונה אחת */}
 {imgs.length > 1 && (
 <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
 {imgs.map((src, i) => (
 <div key={i} onClick={() => switchImage(i)}
 style={{
 width: '62px', height: '62px', borderRadius: '12px', overflow: 'hidden',
 cursor: 'pointer', flexShrink: 0,
 border: i === activeImg ? '2.5px solid var(--rose)' : '2px solid var(--border-light)',
 boxShadow: i === activeImg ? '0 2px 10px rgba(139,90,107,0.25)' : 'none',
 opacity: animating && i !== activeImg ? 0.6 : 1,
 transition: 'all 0.2s',
 transform: i === activeImg ? 'scale(1.05)' : 'scale(1)',
 }}>
 <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
 </div>
 ))}
 </div>
 )}
 </div>

 {/* עמודת מידע */}
 <div>
 <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: 'var(--rose)', lineHeight: '1.2', marginBottom: '14px' }}>
 {product.name}
 </h1>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
 <div style={{ fontSize: '32px', fontWeight: '800', color: hasPrice ? 'var(--amber)' : 'var(--rose)', fontFamily: 'Heebo, sans-serif' }}>
 {priceDisplay}
 </div>
 {product.dealQty && product.dealPrice && (
 <div style={{ background: 'var(--grad-amber)', borderRadius: '8px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
 <span style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>מבצע!</span>
 <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{product.dealLabel || `${product.dealQty} יחידות ב-₪${product.dealPrice}`}</span>
 </div>
 )}
 </div>
 <div style={{ width: '36px', height: '2.5px', background: 'var(--grad-amber)', borderRadius: '2px', marginBottom: '18px' }} />
 <p style={{ fontSize: '14px', color: 'var(--mid)', lineHeight: '1.9', marginBottom: '28px' }}>{product.description}</p>

 {hasPrice && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
 <div className="qty-control">
 <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
 <span className="qty-num">{qty}</span>
 <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
 </div>
 <button className="btn-primary" onClick={handleAdd} style={{ flex: 1, background: added ? 'linear-gradient(135deg,#C0A0BC,#A885A8)' : 'var(--grad-rose)' }}>
 {added ? ' נוסף לסל!' : 'הוספה לסל'}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
