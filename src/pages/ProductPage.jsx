import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProductPage() {
  const { pageData, navigate, addToCart } = useApp();
  const product = pageData;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) { navigate('products'); return null; }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '16px 36px' }}>
        <span
          onClick={() => navigate('products')}
          style={{ fontSize: '13px', color: 'var(--mid)', cursor: 'pointer' }}
        >
          ← המוצרים שלי
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '0 30px',
      }}>
        {/* Images */}
        <div>
          {/* Main image */}
          <div style={{
            width: '100%',
            paddingTop: '100%',
            background: 'linear-gradient(135deg, #F5EFE6, #EDE0CC)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '80px',
            }}>
              {product.emoji || '🎁'}
            </span>
            {product.images?.[activeImg] && (
              <img src={product.images[activeImg]} alt={product.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Gallery thumbnails */}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: '70px', height: '70px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `2px solid ${activeImg === i ? 'var(--deep-sage)' : 'var(--light-border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: '900',
            color: 'var(--dark)',
            marginBottom: '12px',
            lineHeight: '1.2',
          }}>
            {product.name}
          </h1>

          <p style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--terracotta)',
            marginBottom: '24px',
          }}>
            {product.priceNote ? product.priceNote : product.price > 0 ? `₪${product.price}` : 'לפי הצעה'}
          </p>

          <p style={{
            fontSize: '15px',
            lineHeight: '1.9',
            color: 'var(--mid)',
            marginBottom: '32px',
          }}>
            {product.description}
          </p>

          {product.price > 0 && (
            <>
              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>כמות:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--light-border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: '8px 16px', background: 'var(--cream)', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <span style={{ padding: '8px 20px', fontSize: '16px', fontWeight: '600' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ padding: '8px 16px', background: 'var(--cream)', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: added ? 'var(--deep-sage)' : 'var(--terracotta)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '700',
                  transition: 'background 0.3s',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {added ? '✓ נוסף לסל!' : 'הוספה לסל'}
              </button>
            </>
          )}

          {/* WhatsApp for custom orders */}
          <a
            href={`https://wa.me/9720548838607?text=היי, אני מתעניין/ת במוצר: ${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              marginTop: '12px',
              width: '100%',
              padding: '14px',
              background: '#25D366',
              color: 'white',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            💬 יצירת קשר לפרטים נוספים
          </a>
        </div>
      </div>
    </div>
  );
}
