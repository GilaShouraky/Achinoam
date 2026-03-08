import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';

const DELIVERY_COST = 38;
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwmJ7b0E2NiuntAbE1XGk8UGGCarLNMsP3yPVN_n8wJXIhTljCZmTGj28A6zspRpdCP/exec';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartSavings, calcItemTotal, calcItemSaving, navigate, content } = useApp();

  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '',
    delivery: '',
    deliveryName: '', deliveryPhone: '', city: '', street: '', houseNum: '', floor: '', apt: '', zip: '', notes: ''
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showPopup]);

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: false }));
  };

  const totalWithDelivery = form.delivery === 'home' ? cartTotal + DELIVERY_COST : cartTotal;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.phone.trim() || phoneDigits.length !== 10) e.phone = true;
    if (!form.delivery) e.delivery = true;
    if (form.delivery === 'home') {
      if (!form.deliveryName.trim()) e.deliveryName = true;
      const deliveryPhoneDigits = form.deliveryPhone.replace(/\D/g, '');
      if (!form.deliveryPhone.trim() || deliveryPhoneDigits.length !== 10) e.deliveryPhone = true;
      if (!form.city.trim()) e.city = true;
      if (!form.street.trim()) e.street = true;
      if (!form.houseNum.trim() || isNaN(Number(form.houseNum))) e.houseNum = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveToSheets = async () => {
    const data = {
      name: form.name,
      phone: form.phone,
      itemCount: cart.reduce((s, i) => s + i.quantity, 0),
      itemsList: cart.map(i => `${i.name} x${i.quantity} (₪${calcItemTotal(i)})`).join(', '),
      total: totalWithDelivery,
      savings: cartSavings,
      deliveryCost: form.delivery === 'home' ? DELIVERY_COST : 0,
      deliveryType: form.delivery === 'jerusalem' ? 'איסוף ירושלים - כנפי נשרים'
        : form.delivery === 'beitshemesh' ? 'איסוף בית שמש - רחוב התבור'
        : 'משלוח עד הבית',
      deliveryName: form.deliveryName,
      deliveryPhone: form.deliveryPhone,
      city: form.city,
      street: form.street,
      houseNum: form.houseNum,
      floor: form.floor,
      apt: form.apt,
      zip: form.zip,
      notes: form.notes,
    };
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch(e) {
      console.error('Sheets save failed:', e);
    }
  };

  const buildWhatsapp = () => {
    const items = cart.map(i => `• ${i.name} x${i.quantity} — ₪${calcItemTotal(i)}`).join('\n');
    const savings = cartSavings > 0 ? `\n\n🎉 חסכת: ₪${cartSavings}` : '';
    const deliveryLabel = form.delivery === 'jerusalem' ? 'איסוף מירושלים - כנפי נשרים'
      : form.delivery === 'beitshemesh' ? 'איסוף מבית שמש - רחוב התבור'
      : `משלוח עד הבית (+₪${DELIVERY_COST})`;
    const deliveryDetails = form.delivery === 'home'
      ? `
איש קשר: ${form.deliveryName}
טלפון: ${form.deliveryPhone}
כתובת: ${form.street} ${form.houseNum}${form.floor ? ` קומה ${form.floor}` : ''}${form.apt ? ` דירה ${form.apt}` : ''}, ${form.city}${form.zip ? ` מיקוד ${form.zip}` : ''}${form.notes ? `
הערות: ${form.notes}` : ''}`
      : '';
    const msg = `היי! אני רוצה להזמין:\n${items}${savings}\n\nסה"כ לתשלום: ₪${totalWithDelivery}\n\n👤 שם: ${form.name}\n📞 טלפון: ${form.phone}\n\n🚚 אופן קבלה: ${deliveryLabel}${deliveryDetails}`;
    return `https://wa.me/${content.whatsapp_number}?text=${encodeURIComponent(msg)}`;
  };

  const inp = (err) => ({
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    fontFamily: 'var(--font-body)', border: `1.5px solid ${err ? '#e74c3c' : '#e0d6cc'}`,
    background: 'white', outline: 'none', boxSizing: 'border-box', direction: 'rtl'
  });
  const lbl = { fontSize: '13px', fontWeight: '600', color: 'var(--mid)', marginBottom: '4px', display: 'block' };
  const row = { marginBottom: '12px' };
  const secTitle = { fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--rose)', fontWeight: '700', margin: '24px 0 14px', borderBottom: '1px solid #f0e8df', paddingBottom: '8px' };

  if (!cart.length) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '100px 28px' }}>
      <div style={{ fontSize: '58px', marginBottom: '18px', animation: 'float 3s ease-in-out infinite' }}>🛒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--rose)', marginBottom: '10px' }}>הסל ריק</h2>
      <p style={{ color: 'var(--light)', marginBottom: '26px' }}>עדיין לא הוספת מוצרים לסל</p>
      <button className="btn-primary" onClick={() => navigate('category', 'products')}>לצפייה במוצרים ←</button>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}>→ חזרה לקנייה</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', color: 'var(--rose)', fontWeight: '900', marginTop: '12px', textAlign: 'center', width: '100%' }}>סל הקניות</h1>
      </div>
      <div style={{ maxWidth: '680px', margin: '32px auto 78px', padding: '0 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {cart.map(item => {
            const itemTotal = calcItemTotal(item, cart);
            const saving = calcItemSaving(item, cart);
            const hasDeal = saving > 0;
            return (
              <div key={item.id} className="cart-item" style={{ background: 'var(--warm-white)', border: `1px solid ${hasDeal ? '#D4A84060' : 'var(--border-light)'}`, borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
                {hasDeal && (
                  <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--grad-amber)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(196,134,26,0.3)' }}>
                    {item.dealLabel || 'מבצע!'}
                  </div>
                )}
                <div className="cart-item-img" style={{ width: '120px', height: '120px', background: 'var(--cream)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0, overflow: 'hidden' }}>
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.emoji}
                </div>
                <div className="cart-item-details" style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--rose)', marginBottom: '8px' }}>{item.name}</p>
                  <div className="cart-price-qty-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {hasDeal ? (
                        <>
                          <span className="cart-price" style={{ fontSize: '18px', color: 'var(--amber)', fontWeight: '800' }}>₪{itemTotal}</span>
                          <span style={{ fontSize: '12px', color: 'var(--light)', textDecoration: 'line-through' }}>₪{Number(item.price) * item.quantity}</span>
                          <span style={{ fontSize: '13px', color: '#25A85A', fontWeight: '700' }}>חסכת ₪{saving}</span>
                        </>
                      ) : (
                        <span className="cart-price" style={{ fontSize: '18px', color: 'var(--amber)', fontWeight: '800' }}>₪{itemTotal}</span>
                      )}
                    </div>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--light)', fontSize: '17px', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'color 0.2s, background 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.background = '#fff0ee'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--light)'; e.currentTarget.style.background = 'none'; }}>✕</button>
              </div>
            );
          })}
        </div>

        {/* סיכום */}
        <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '26px', boxShadow: 'var(--shadow-sm)' }}>
          {cartSavings > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: '#F0FAF4', borderRadius: '10px', padding: '10px 14px' }}>
              <span style={{ fontSize: '14px', color: '#25A85A', fontWeight: '600' }}>🎉 חסכת במבצעים:</span>
              <span style={{ fontSize: '16px', color: '#25A85A', fontWeight: '800' }}>₪{cartSavings}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '15px', color: 'var(--mid)' }}>סה"כ לתשלום:</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: '800', color: 'var(--amber)' }}>₪{cartTotal}</span>
          </div>
          <button className="btn-whatsapp" onClick={() => setShowPopup(true)}
            style={{ width: '100%', borderRadius: '12px', fontSize: '15px', padding: '15px', border: 'none', cursor: 'pointer' }}>
            סיימתי, אני רוצה להמשיך
          </button>
        </div>
      </div>

      {/* פופאפ */}
      {showPopup && createPortal((
        <div className="order-popup-wrap" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPopup(false); }}>
          <div className="order-popup-inner" style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', maxWidth: '480px', width: '100%', maxHeight: '75vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#d4c4b8 transparent', direction: 'rtl', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--rose)', margin: 0 }}>רק עוד כמה פרטים אחרונים</h2>
              <button onClick={() => setShowPopup(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--light)', lineHeight: 1 }}>✕</button>
            </div>

            <div style={row}>
              <label style={lbl}>שם מלא *</label>
              <input style={inp(errors.name)} value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>
            <div style={row}>
              <label style={lbl}>מספר פלאפון *</label>
              <input style={inp(errors.phone)} value={form.phone} onChange={e => setField('phone', e.target.value)} type="tel" />
            </div>

            <div style={secTitle}>איך אני רוצה לקבל את ההזמנה שלי?</div>
            {errors.delivery && <p style={{ color: '#e74c3c', fontSize: '12px', margin: '-8px 0 10px' }}>יש לבחור אופן קבלה</p>}

            {[
              { val: 'jerusalem', label: 'איסוף מירושלים – כנפי נשרים' },
              { val: 'beitshemesh', label: 'איסוף מבית שמש – רחוב התבור' },
              { val: 'home', label: `משלוח עד הבית – ₪${DELIVERY_COST}` },
            ].map(opt => (
              <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${form.delivery === opt.val ? 'var(--amber)' : '#e0d6cc'}`, background: form.delivery === opt.val ? '#fff8ee' : 'white', marginBottom: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: 'var(--dark)' }}>
                <input type="radio" name="delivery" value={opt.val} checked={form.delivery === opt.val}
                  onChange={() => { setField('delivery', opt.val); setErrors(e => ({ ...e, delivery: false })); }}
                  style={{ accentColor: 'var(--amber)', width: '18px', height: '18px' }} />
                {opt.label}
              </label>
            ))}

            {form.delivery === 'home' && (
              <div style={{ background: '#fdf8f2', borderRadius: '14px', padding: '16px', marginTop: '10px' }}>
                <p style={{ fontWeight: '700', color: 'var(--rose)', fontSize: '14px', marginBottom: '12px' }}>פרטי משלוח</p>
                <div style={row}>
                  <label style={lbl}>איש קשר *</label>
                  <input style={inp(errors.deliveryName)} value={form.deliveryName} onChange={e => setField('deliveryName', e.target.value)} />
                </div>
                <div style={row}>
                  <label style={lbl}>מספר פלאפון *</label>
                  <input style={inp(errors.deliveryPhone)} value={form.deliveryPhone} onChange={e => setField('deliveryPhone', e.target.value)} type="tel" />
                </div>
                <div style={row}>
                  <label style={lbl}>עיר *</label>
                  <input style={inp(errors.city)} value={form.city} onChange={e => setField('city', e.target.value)} />
                </div>
                <div className="order-popup-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={lbl}>רחוב *</label>
                    <input style={inp(errors.street)} value={form.street} onChange={e => setField('street', e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>מספר בית *</label>
                    <input style={inp(errors.houseNum)} value={form.houseNum} onChange={e => setField('houseNum', e.target.value)} />
                  </div>
                </div>
                <div className="order-popup-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={lbl}>קומה</label>
                    <input style={inp(false)} value={form.floor} onChange={e => setField('floor', e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>דירה</label>
                    <input style={inp(false)} value={form.apt} onChange={e => setField('apt', e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>מיקוד</label>
                    <input style={inp(false)} value={form.zip} onChange={e => setField('zip', e.target.value)} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={lbl}>הערות לשליח</label>
                  <textarea style={{ ...inp(false), resize: 'vertical', minHeight: '72px' }} value={form.notes} onChange={e => setField('notes', e.target.value)} />
                </div>
              </div>
            )}

            <div style={{ background: '#fdf8f2', borderRadius: '12px', padding: '14px 16px', margin: '20px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: 'var(--mid)', fontSize: '15px' }}>סה"כ לתשלום:</span>
              <div style={{ textAlign: 'left' }}>
                {form.delivery === 'home' && <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'right' }}>כולל משלוח ₪{DELIVERY_COST}</div>}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: '800', color: 'var(--amber)' }}>₪{totalWithDelivery}</span>
              </div>
            </div>

            <button onClick={() => { if (validate()) { saveToSheets(); window.open(buildWhatsapp(), "_blank"); setShowPopup(false); clearCart(); } }} className="btn-whatsapp"
              style={{ width: "100%", borderRadius: "12px", fontSize: "15px", padding: "15px", border: "none", cursor: "pointer", display: "block", textAlign: "center", boxSizing: "border-box" }}>
              להשלמת ההזמנה בוואטסאפ
            </button>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
