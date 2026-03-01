import React from 'react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product, size = 'normal' }) {
  const { navigate } = useApp();
  const isSmall = size === 'small';
  const price = Number(product.price) > 0 ? `₪${Number(product.price)}` : product.priceNote || 'לפי הצעה';
  const isPriceFixed = Number(product.price) > 0;

  return (
    <div onClick={() => navigate('product', product)}
      style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--border-light)',
        borderRadius: isSmall ? '16px' : '20px',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* תמונה */}
      <div style={{
        background: 'linear-gradient(145deg, var(--cream), var(--rose-soft))',
        paddingTop: isSmall ? '90%' : '105%',
        position: 'relative', overflow: 'hidden',
      }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isSmall ? '34px' : '46px', animation: 'float 3s ease-in-out infinite' }}>
            {product.emoji || '🎁'}
          </div>
        )}
        {/* תג מחיר */}
        <div style={{
          position: 'absolute', bottom: '9px', left: '9px',
          background: isPriceFixed ? 'var(--amber)' : 'rgba(139,90,107,0.82)',
          backdropFilter: 'blur(6px)',
          color: 'white', padding: '3px 10px', borderRadius: '50px',
          fontSize: '11px', fontWeight: '800',
        }}>
          {price}
        </div>
      </div>

      {/* מידע */}
      <div style={{ padding: isSmall ? '11px 13px' : '14px 16px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: isSmall ? '13px' : '16px', fontWeight: '700', color: 'var(--rose)', marginBottom: '3px', lineHeight: '1.3' }}>
          {product.name}
        </h3>
        {!isSmall && (
          <p style={{ fontSize: '12px', color: 'var(--light)', lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
}
