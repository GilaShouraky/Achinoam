import React from 'react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, navigate, content } = useApp();

  if (!cart.length) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '100px 28px' }}>
      <div style={{ fontSize: '58px', marginBottom: '18px', animation: 'float 3s ease-in-out infinite' }}>🛍️</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--rose)', marginBottom: '10px' }}>הסל ריק</h2>
      <p style={{ color: 'var(--light)', marginBottom: '26px' }}>עדיין לא הוספת מוצרים לסל</p>
      <button className="btn-primary" onClick={() => navigate('category', 'products')}>לצפייה במוצרים ←</button>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}>→ חזרה לקנייה</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--rose)', fontWeight: '900', marginTop: '8px' }}>סל הקניות</h1>
      </div>
      <div style={{ maxWidth: '680px', margin: '32px auto 78px', padding: '0 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ background: 'var(--warm-white)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '54px', height: '54px', background: 'var(--cream)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0, overflow: 'hidden' }}>
                {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--rose)', marginBottom: '3px' }}>{item.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: '700' }}>₪{Number(item.price)}</p>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                <span className="qty-num">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)}
                style={{ background: 'none', border: 'none', color: 'var(--light)', fontSize: '17px', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'color 0.2s, background 0.2s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.background = '#fff0ee'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--light)'; e.currentTarget.style.background = 'none'; }}
              >✕</button>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '26px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '15px', color: 'var(--mid)' }}>סה"כ לתשלום:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '900', color: 'var(--amber)' }}>₪{cartTotal}</span>
          </div>
          <a href={`https://wa.me/${content.whatsapp_number}?text=${encodeURIComponent('היי! אני רוצה להזמין:\n' + cart.map(i => `• ${i.name} x${i.quantity}`).join('\n') + `\n\nסה"כ: ₪${cartTotal}`)}`}
            target="_blank" rel="noopener noreferrer" className="btn-whatsapp"
            style={{ width: '100%', borderRadius: '12px', fontSize: '15px', padding: '15px', textDecoration: 'none' }}>
            💬 להשלמת ההזמנה בוואטסאפ
          </a>
        </div>
      </div>
    </div>
  );
}
