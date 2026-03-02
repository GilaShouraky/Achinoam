import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductsPage({ subCatOverride } = {}) {
  const { navigate, pageData, products, content } = useApp();
  const subs = categories.products.subCategories;
  const [active, setActive] = useState(subCatOverride || pageData?.subCategory || subs[0].id);
  const filtered = products.filter(p => p.category === active);

  return (
    <div className="fade-in">
      {/* ─── Header ─── */}
      <div style={{
        background: 'var(--grad-rose)',
        minHeight: '130px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '20px 120px',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(50px)' }} />
        {/* כפתור חזרה – absolute ימין */}
        <div style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', zIndex: 2 }}>
          <button className="back-btn" onClick={() => navigate('category', 'products')}>→ חזרה לקטגוריות</button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: '900', color: 'white', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.12)', position: 'relative', zIndex: 1, margin: 0 }}>
          {'המוצרים שלי 🎁'}
        </h1>
      </div>

      {/* טאבים */}
      <div style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--border-light)', padding: '14px 28px', overflowX: 'auto', display: 'flex', gap: '8px' }}>
        {subs.map(sub => (
          <button key={sub.id} onClick={() => setActive(sub.id)}
            style={{ padding: '7px 17px', borderRadius: '50px', border: 'none', background: active === sub.id ? 'var(--grad-rose)' : 'var(--cream)', color: active === sub.id ? 'white' : 'var(--mid)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', boxShadow: active === sub.id ? '0 3px 12px rgba(139,90,107,0.28)' : 'none' }}>
            {sub.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1060px', margin: '32px auto 68px', padding: '0 28px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--light)' }}>
            <div style={{ fontSize: '46px', marginBottom: '14px' }}>🌿</div>
            <p>אין מוצרים בקטגוריה זו עדיין</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '18px' }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
