import React from 'react';
import { useApp } from '../context/AppContext';

export default function ContactPage() {
  const { navigate, content } = useApp();

  return (
    <div className="fade-in">
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '32px 36px 24px' }}>
        <div onClick={() => navigate('home')} style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '8px', cursor: 'pointer' }}>
          ← חזרה לדף הבית
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900', color: 'var(--dark)' }}>
          צור קשר
        </h1>
      </div>

      <div style={{ maxWidth: '700px', margin: '50px auto', padding: '0 36px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            { icon: '📱', label: 'טלפון', value: content.contact_phone, href: `tel:${content.contact_phone}` },
            { icon: '📧', label: 'מייל', value: content.contact_email, href: `mailto:${content.contact_email}` },
            { icon: '📍', label: 'כתובת', value: content.contact_address, href: null },
          ].map(item => (
            <div key={item.label} style={{
              background: 'white',
              border: '1px solid var(--light-border)',
              borderRadius: '16px',
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{item.icon}</div>
              <p style={{ fontSize: '12px', color: 'var(--mid)', marginBottom: '6px' }}>{item.label}</p>
              {item.href
                ? <a href={item.href} style={{ fontSize: '14px', fontWeight: '600', color: 'var(--deep-sage)' }}>{item.value}</a>
                : <p style={{ fontSize: '14px', fontWeight: '600' }}>{item.value}</p>
              }
            </div>
          ))}
        </div>

        <a
          href={`https://wa.me/${content.whatsapp_number}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#25D366',
            color: 'white',
            padding: '18px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '700',
          }}
        >
          💬 שלח הודעה בוואטסאפ
        </a>
      </div>
    </div>
  );
}
