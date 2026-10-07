import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { T } from '../edit/T';
import { ORDERS_SCRIPT_URL as SHEETS_URL } from '../config';

const DELIVERY_COST = 38;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartSavings, calcItemTotal, calcItemSaving, navigate, t, pickupPoints = [], formatPrice } = useApp();
  const PAY_METHODS = [t('pay.paybox_name'), t('pay.bank_name')];
  const fmt = formatPrice || ((n) => Number.isInteger(n) ? n : parseFloat(n.toFixed(1)));

  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    delivery: '',
    deliveryName: '', deliveryPhone: '', city: '', street: '', houseNum: '', floor: '', apt: '', entrance: '', notes: '', orderNotes: '', paymentMethod: '', receiptLink: ''
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
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

  const uploadToImgur = async (file) => {
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'achinoam_receipts');
      const response = await fetch('https://api.cloudinary.com/v1_1/dd0bpgvch/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setField('receiptLink', data.secure_url);
      } else {
        setUploadError(t('order.upload_error'));
      }
    } catch {
      setUploadError(t('order.upload_error'));
    }
    setUploading(false);
  };

  const totalWithDelivery = form.delivery === 'home' ? cartTotal + DELIVERY_COST : cartTotal;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = true;
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
    if (!form.paymentMethod) e.paymentMethod = true;
    if (!form.receiptLink.trim()) e.receiptLink = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateStock = async () => {
    const updates = cart
      .filter(i => i.stock !== null)
      .map(i => ({ id: i.id, qty: i.quantity }));
    if (!updates.length) return;
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        body: JSON.stringify({ type: 'updateStock', updates }),
      });
    } catch(e) {
 }
  };

  const saveToSheets = async () => {
    const data = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      itemCount: cart.reduce((s, i) => s + i.quantity, 0),
      itemsList: cart.map(i => `${i.name} x${i.quantity} (₪${calcItemTotal(i)})`).join(', '),
      total: totalWithDelivery,
      savings: cartSavings,
      deliveryCost: form.delivery === 'home' ? DELIVERY_COST : 0,
      deliveryType: form.delivery === 'home' ? 'משלוח עד הבית' : form.delivery.replace(/_/g, ' '),
      deliveryName: form.deliveryName,
      deliveryPhone: form.deliveryPhone,
      city: form.city,
      street: form.street,
      houseNum: form.houseNum,
      floor: form.floor,
      apt: form.apt,
      entrance: form.entrance,
      notes: form.notes,
      orderNotes: form.orderNotes,
      paymentMethod: form.paymentMethod,
      receiptLink: form.receiptLink,
    };
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch(e) {
    }
  };

  const buildWhatsapp = () => {
    const items = cart.map(i => `• ${i.name} x${i.quantity} — ₪${calcItemTotal(i)}`).join('\n');
    const savings = cartSavings > 0 ? `\n\n🎉 חסכת: ₪${cartSavings}` : '';
    const deliveryLabels = {
      beitshemesh: 'איסוף מבית שמש - רחוב התבור',
      kiryat_moshe: "נק' מכירה קרית משה - יסכה שטיינר 058-6890267",
      mitzpe_yericho: "נק' מכירה מצפה יריחו - הדס דסה 058-5355146",
      etz_efraim: "נק' מכירה עץ אפרים - רויטל סלם 053-5578581",
      mitzpe_ramon: "נק' מכירה מצפה רמון - חן חסון 058-4181341",
      alon_shvut: "נק' מכירה אלון שבות - עטרה סונא 052-6071456",
      beit_el: "נק' מכירה בית אל - מילכה סולטן 055-9109970",
      ali: "נק' מכירה עלי - נעמי יסכה 054-4424361",
      tel_aviv: "נק' מכירה תל אביב - אפרת שפירא 058-6940221",
      haifa: "נק' מכירה חיפה - שקד נאמן 050-9655442",
      kerem_byavne: "נק' מכירה כרם ביבנה - תהילה כהן 054-7593537",
      kiryat_arba: "נק' מכירה קרית ארבע - תהילה גספר 058-7796660",
      sderot: "נק' מכירה שדרות - טוהר 052-3636234",
      nof_ayalon: "נק' מכירה נוף איילון - חיה ממן 052-6337030",
      alon_more: "נק' מכירה אלון מורה - אחווה 058-4997561",
      pt_hadar: "נק' מכירה פתח תקווה הדר גנים - משפחת פסטליך (לבדוק מלאי דרך אחינועם 054-8838607)",
      pt_kfar: "נק' מכירה פתח תקווה כפר אברהם - רחל אורלינסקי 050-8754191",
      givat_shmuel: "נק' מכירה גבעת שמואל - משפחת רוזנטל (ווצאפ בלבד) 054-9867606",
      home: `משלוח עד הבית (+₪${DELIVERY_COST})`,
    };
    const deliveryLabel = deliveryLabels[form.delivery] || form.delivery;
    const deliveryDetails = form.delivery === 'home'
      ? `
איש קשר: ${form.deliveryName}
טלפון: ${form.deliveryPhone}
כתובת: ${form.street} ${form.houseNum}${form.floor ? ` קומה ${form.floor}` : ''}${form.apt ? ` דירה ${form.apt}` : ''}, ${form.city}${form.entrance ? ` כניסה ${form.entrance}` : ''}${form.notes ? `
הערות: ${form.notes}` : ''}`
      : '';
    const paymentLine = `\n\n💳 תשלום: ${form.paymentMethod}\nאסמכתא: ${form.receiptLink}`;
    const orderNotesLine = form.orderNotes ? `\n\n📝 הערות להזמנה: ${form.orderNotes}` : '';
    const msg = `${t('order.wa_intro')}\n${items}${savings}\n\nסה"כ לתשלום: ₪${totalWithDelivery}\n\n👤 שם: ${form.name}\n📞 טלפון: ${form.phone}\n\n🚚 אופן קבלה: ${deliveryLabel}${deliveryDetails}${paymentLine}${orderNotesLine}`;
    return `https://wa.me/${t('whatsapp_number')}?text=${encodeURIComponent(msg)}`;
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
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--rose)', marginBottom: '10px' }}><T k="cart.empty_title" /></h2>
      <p style={{ color: 'var(--light)', marginBottom: '26px' }}><T k="cart.empty_text" /></p>
      <button className="btn-primary" onClick={() => navigate('products')}><T k="cart.empty_btn" /></button>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><T k="cart.back" /></button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', color: 'var(--rose)', fontWeight: '900', marginTop: '12px', textAlign: 'center', width: '100%' }}><T k="cart.title" /></h1>
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
                    {item.dealLabel || <T k="product.deal_badge" />}
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
                          <span className="cart-price" style={{ fontSize: '18px', color: 'var(--amber)', fontWeight: '800' }}>₪{fmt(itemTotal)}</span>
                          <span style={{ fontSize: '12px', color: 'var(--light)', textDecoration: 'line-through' }}>₪{fmt(Number(item.price) * item.quantity)}</span>
                          <span style={{ fontSize: '13px', color: '#25A85A', fontWeight: '700' }}><T k="cart.saved_item" vars={{ n: fmt(saving) }} /></span>
                        </>
                      ) : (
                        <span className="cart-price" style={{ fontSize: '18px', color: 'var(--amber)', fontWeight: '800' }}>₪{fmt(itemTotal)}</span>
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
              <span style={{ fontSize: '14px', color: '#25A85A', fontWeight: '600' }}><T k="cart.saved_total" /></span>
              <span style={{ fontSize: '16px', color: '#25A85A', fontWeight: '800' }}>₪{fmt(cartSavings)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '15px', color: 'var(--mid)' }}><T k="cart.total" /></span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: '800', color: 'var(--amber)' }}>₪{fmt(cartTotal)}</span>
          </div>
          <button className="btn-whatsapp" onClick={() => setShowPopup(true)}
            style={{ width: '100%', borderRadius: '12px', fontSize: '15px', padding: '15px', border: 'none', cursor: 'pointer' }}>
            <T k="cart.continue" />
          </button>
        </div>
      </div>

      {/* פופאפ */}
      {showPopup && createPortal((
        <div className="order-popup-wrap" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPopup(false); }}>
          <div className="order-popup-inner" style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', maxWidth: '480px', width: '100%', maxHeight: '75vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#d4c4b8 transparent', direction: 'rtl', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--rose)', margin: 0 }}><T k="order.title" /></h2>
              <button onClick={() => setShowPopup(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--light)', lineHeight: 1 }}>✕</button>
            </div>

            <div style={row}>
              <label style={lbl}><T k="order.name" /></label>
              <input style={inp(errors.name)} value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>
            <div style={row}>
              <label style={lbl}><T k="order.phone" /></label>
              <input style={inp(errors.phone)} value={form.phone} onChange={e => setField('phone', e.target.value)} type="tel" />
            </div>
            <div style={row}>
              <label style={lbl}><T k="order.email" /></label>
              <input style={inp(errors.email)} value={form.email} onChange={e => setField('email', e.target.value)} type="email" />
            </div>

            <div style={secTitle}><T k="order.delivery_title" /></div>
            {errors.delivery && <p style={{ color: '#e74c3c', fontSize: '12px', margin: '-8px 0 10px' }}><T k="order.delivery_error" /></p>}

            <div style={{ background: '#fff8ee', border: '1.5px solid var(--amber)', borderRadius: '12px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: 'var(--dark)', direction: 'rtl', lineHeight: 1.7, fontWeight: '600' }}>
              <T k="order.notice" />
            </div>
            {[
              ...(pickupPoints.length > 0
                ? pickupPoints.map(p => ({
                    val: p.location.replace(/\s+/g, '_').replace(/'/g, ''),
                    label: `${t('order.pickup_prefix')} ${p.location}${p.name ? ` – ${p.name}` : ''}${p.phone ? ` ${p.phone}` : ''}`,
                  }))
                : [{ val: 'beitshemesh', label: t('order.pickup_fallback') }]
              ),

            ].map(opt => (
              <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${form.delivery === opt.val ? 'var(--amber)' : '#e0d6cc'}`, background: form.delivery === opt.val ? '#fff8ee' : 'white', marginBottom: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: 'var(--dark)', direction: 'rtl' }}>
                <input type="radio" name="delivery" value={opt.val} checked={form.delivery === opt.val}
                  onChange={() => { setField('delivery', opt.val); setErrors(e => ({ ...e, delivery: false })); }}
                  style={{ accentColor: 'var(--amber)', width: '18px', height: '18px', flexShrink: 0 }} />
                {opt.label}
              </label>
            ))}

            {false && (
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
                    <label style={lbl}>כניסה</label>
                    <input style={inp(false)} value={form.entrance} onChange={e => setField('entrance', e.target.value)} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={lbl}>הערות לשליח</label>
                  <textarea style={{ ...inp(false), resize: 'vertical', minHeight: '72px' }} value={form.notes} onChange={e => setField('notes', e.target.value)} />
                </div>
              </div>
            )}

            {/* הערות להזמנה */}
            <div style={{ marginTop: '16px', marginBottom: '4px' }}>
              <label style={lbl}><T k="order.notes" /></label>
              <textarea style={{ ...inp(false), resize: 'vertical', minHeight: '72px' }} value={form.orderNotes} onChange={e => setField('orderNotes', e.target.value)} />
            </div>

            {/* תשלום */}
            <div style={{ marginTop: '20px', marginBottom: '16px' }}>
              <div style={{ ...secTitle, marginBottom: '10px' }}><T k="order.pay_title" /></div>
              {errors.paymentMethod && <p style={{ color: '#e74c3c', fontSize: '12px', margin: '-4px 0 8px' }}><T k="order.pay_error" /></p>}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                {PAY_METHODS.map(method => (
                  <label key={method} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${form.paymentMethod === method ? 'var(--amber)' : '#e0d6cc'}`, background: form.paymentMethod === method ? '#fff8ee' : 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: 'var(--dark)' }}>
                    <input type="radio" name="paymentMethod" value={method} checked={form.paymentMethod === method}
                      onChange={() => setField('paymentMethod', method)}
                      style={{ accentColor: 'var(--amber)', width: '18px', height: '18px' }} />
                    {method}
                  </label>
                ))}
              </div>
              {form.paymentMethod && (
                <div style={{ background: '#fdf8f2', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', color: 'var(--mid)', lineHeight: 1.7 }}>
                  {form.paymentMethod === PAY_METHODS[0] && <span className="pay-note"><T k="pay.paybox_text" vars={{ phone: t('paybox_number') }} /></span>}
                  {form.paymentMethod === PAY_METHODS[1] && <div className="pay-note"><T k="pay.bank_details" /></div>}
                </div>
              )}
              <div style={row}>
                <label style={{ ...lbl, color: errors.receiptLink ? '#e74c3c' : undefined }}><T k="order.receipt" /></label>
                {form.receiptLink ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #4caf50', background: '#f0fff4' }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    <span style={{ fontSize: '13px', color: '#2e7d32', flex: 1 }}><T k="order.receipt_ok" /></span>
                    <button onClick={() => setField('receiptLink', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)', fontSize: '16px' }}>✕</button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: `1.5px dashed ${errors.receiptLink ? '#e74c3c' : '#e0d6cc'}`, cursor: 'pointer', fontSize: '14px', color: 'var(--mid)', background: '#fafafa' }}>
                    <span style={{ fontSize: '20px' }}>📎</span>
                    {uploading ? <T k="order.uploading" /> : <T k="order.receipt_btn" />}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadToImgur(e.target.files[0])} disabled={uploading} />
                  </label>
                )}
                {uploadError && <p style={{ color: '#e74c3c', fontSize: '12px', margin: '4px 0 0' }}>{uploadError}</p>}
              </div>
            </div>

            <div style={{ background: '#fdf8f2', borderRadius: '12px', padding: '14px 16px', margin: '20px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: 'var(--mid)', fontSize: '15px' }}><T k="cart.total" /></span>
              <div style={{ textAlign: 'left' }}>
                {form.delivery === 'home' && <div style={{ fontSize: '12px', color: 'var(--light)', textAlign: 'right' }}>כולל משלוח ₪{DELIVERY_COST}</div>}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: '800', color: 'var(--amber)' }}>₪{fmt(totalWithDelivery)}</span>
              </div>
            </div>

            <button onClick={() => { if (validate()) { saveToSheets(); updateStock(); window.open(buildWhatsapp(), "_blank"); setShowPopup(false); clearCart(); } }} className="btn-whatsapp"
              style={{ width: "100%", borderRadius: "12px", fontSize: "15px", padding: "15px", border: "none", cursor: "pointer", display: "block", textAlign: "center", boxSizing: "border-box" }}>
              <T k="order.submit" />
            </button>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
