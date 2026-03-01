import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProductPage({ productOverride } = {}) {
  const { pageData, navigate, addToCart, content } = useApp();
  const product = productOverride || pageData;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (!product) return null;

  const price = Number(product.price);
  const hasPrice = price > 0;
  const priceDisplay = hasPrice ? `₪${price}` : product.priceNote || 'מחיר לפי הצעה';

  const handleAdd = () => { addToCart(product, qty); setAdded(true); setTimeout(() => setAdded(false), 2000); };

  return (
    <div className="fade-in">
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 28px 80px' }}>

        {/* כפתור חזרה – ימין פיזי */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', direction: 'ltr', marginBottom: '26px' }}>
          <button className="back-btn" onClick={() => navigate('products')}>→ חזרה למוצרים</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '44px', alignItems: 'start' }}>
          {/* תמונה */}
          <div style={{ background: 'linear-gradient(145deg, var(--cream), var(--rose-soft))', borderRadius: '24px', paddingTop: '120%', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '76px', animation: 'float 3s ease-in-out infinite' }}>
                {product.emoji || '🎁'}
              </div>
            )}
          </div>

          {/* מידע – בלי pill קטגוריה */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: 'var(--rose)', lineHeight: '1.2', marginBottom: '14px' }}>
              {product.name}
            </h1>

            {/* מחיר בפונט Heebo */}
            <div style={{ fontSize: '32px', fontWeight: '800', color: hasPrice ? 'var(--amber)' : 'var(--rose)', fontFamily: 'Heebo, sans-serif', marginBottom: '8px' }}>
              {priceDisplay}
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
                <button className="btn-primary" onClick={handleAdd} style={{ flex: 1, background: added ? 'linear-gradient(135deg,#25D366,#128C7E)' : 'var(--grad-rose)' }}>
                  {added ? '✓ נוסף לסל!' : 'הוספה לסל'}
                </button>
              </div>
            )}
            {/* כפתור וואטסאפ הוסר */}
          </div>
        </div>
      </div>
    </div>
  );
}
