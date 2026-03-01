import React from 'react';
import { useApp } from '../context/AppContext';

export default function ContactPage() {
  const { content, navigate } = useApp();

  const items = [
    { icon: '📱', label: 'טלפון',    value: content.contact_phone,   href: `https://wa.me/${content.whatsapp_number}`, hint: 'לפתיחת וואטסאפ', color: '#25D366' },
    { icon: '✉️', label: 'אימייל',   value: content.contact_email,   href: `mailto:${content.contact_email}`,          hint: 'לשליחת מייל',   color: 'var(--slate)' },
    { icon: '📍', label: 'כתובת',    value: content.contact_address, href: null,                                        hint: null,            color: 'var(--amber)' },
    { icon: '💬', label: 'וואטסאפ', value: 'שלחי הודעה',             href: `https://wa.me/${content.whatsapp_number}`, hint: 'לפתיחת שיחה',  color: '#25D366' },
    { icon: '📸', label: 'אינסטגרם', value: '@Achinoam_art_desigh',  href: 'https://www.instagram.com/achinoam_art_desigh?igsh=MTY5a204YTY2b3lnYg==', hint: 'לעמוד שלנו', color: '#E1306C' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}>→ חזרה לדף הבית</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '900', color: 'var(--rose)', marginTop: '8px' }}>צרי קשר</h1>
        <p style={{ color: 'var(--light)', fontSize: '13px', marginTop: '5px' }}>שמחה לשמוע ממך! ❀</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '46px auto 78px', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {items.map(item => (
            <div key={item.label}
              onClick={() => item.href && window.open(item.href, '_blank')}
              style={{ background: 'var(--warm-white)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '26px 22px', cursor: item.href ? 'pointer' : 'default', transition: 'transform 0.22s, box-shadow 0.22s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { if (item.href) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: item.color }} />
              <div style={{ fontSize: '26px', marginBottom: '10px' }}>{item.icon}</div>
              <p style={{ fontSize: '10px', color: 'var(--light)', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '5px' }}>{item.label}</p>
              <p style={{ fontSize: '13px', color: 'var(--dark)', fontWeight: '600', marginBottom: item.hint ? '5px' : 0 }}>{item.value}</p>
              {item.hint && <p style={{ fontSize: '11px', color: item.color, fontWeight: '500' }}>{item.hint} ←</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
