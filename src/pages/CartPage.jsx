import React from 'react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { cart, navigate, updateQuantity, removeFromCart, cartTotal, content } = useApp();

  if (cart.length === 0) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '100px 30px' }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
          הסל שלך ריק
        </h2>
        <p style={{ color: 'var(--mid)', marginBottom: '28px' }}>
          גלה את המוצרים שלנו ומצא משהו שתאהב
        </p>
        <button
          onClick={() => navigate('products')}
          style={{
            padding: '14px 32px',
            background: 'var(--deep-sage)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            fontFamily: 'var(--font-body)',
          }}
        >
          לחנות
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '28px 36px' }}>
        <div onClick={() => navigate('home')} style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '8px', cursor: 'pointer' }}>
          ← חזרה לדף הבית
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900' }}>סל הקניות</h1>
      </div>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 30px 60px' }}>
        {/* Cart items */}
        {cart.map(item => (
          <div key={item.id} style={{
            background: 'white',
            border: '1px solid var(--light-border)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '14px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
          }}>
            <div style={{
              width: '70px', height: '70px',
              background: 'var(--cream)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              flexShrink: 0,
            }}>
              {item.emoji || '🎁'}
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{item.name}</p>
              <p style={{ color: 'var(--terracotta)', fontWeight: '700' }}>₪{item.price}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ width: '32px', height: '32px', border: '1px solid var(--light-border)', borderRadius: '8px', background: 'var(--cream)', fontSize: '16px', cursor: 'pointer' }}
              >−</button>
              <span style={{ fontSize: '15px', fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ width: '32px', height: '32px', border: '1px solid var(--light-border)', borderRadius: '8px', background: 'var(--cream)', fontSize: '16px', cursor: 'pointer' }}
              >+</button>
            </div>

            <div style={{ textAlign: 'left', minWidth: '70px' }}>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>₪{item.price * item.quantity}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                style={{ background: 'none', border: 'none', color: 'var(--light)', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}
              >
                הסר
              </button>
            </div>
          </div>
        ))}

        {/* Total */}
        <div style={{
          background: 'white',
          border: '1px solid var(--light-border)',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}>
            <span>סה"כ</span>
            <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--terracotta)' }}>₪{cartTotal}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--light)', marginBottom: '20px' }}>
            * משלוח חינם בהזמנות מעל ₪150
          </p>

          <a
            href={`https://wa.me/${content.whatsapp_number}?text=היי, אני רוצה להזמין: ${cart.map(i => `${i.name} x${i.quantity}`).join(', ')}. סה"כ: ₪${cartTotal}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              background: '#25D366',
              color: 'white',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            💬 מעבר להזמנה בוואטסאפ
          </a>
        </div>
      </div>
    </div>
  );
}
