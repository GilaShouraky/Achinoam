import React from 'react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product, size = 'normal' }) {
  const { navigate } = useApp();
  const isSmall = size === 'small';

  return (
    <div
      onClick={() => navigate('product', product)}
      style={{
        cursor: 'pointer',
        borderRadius: isSmall ? '12px' : '16px',
        overflow: 'hidden',
        border: '1px solid var(--light-border)',
        background: 'white',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image box */}
      <div style={{
        width: '100%',
        paddingTop: '100%',
        background: 'linear-gradient(135deg, #F5EFE6 0%, #EDE0CC 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isSmall ? '32px' : '48px',
        }}>
          {product.emoji || '🎁'}
        </span>
        {/* If real image exists */}
        {product.images && product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: isSmall ? '10px 12px' : '14px 16px' }}>
        <p style={{
          fontSize: isSmall ? '12px' : '14px',
          fontWeight: '600',
          color: 'var(--dark)',
          marginBottom: '4px',
          lineHeight: '1.3',
        }}>
          {product.name}
        </p>
        <p style={{
          fontSize: isSmall ? '12px' : '13px',
          fontWeight: '700',
          color: 'var(--terracotta)',
        }}>
          {product.priceNote ? product.priceNote : product.price > 0 ? `₪${product.price}` : 'לפי הצעה'}
        </p>
      </div>
    </div>
  );
}
