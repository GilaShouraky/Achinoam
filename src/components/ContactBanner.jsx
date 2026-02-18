import React from 'react';
import { useApp } from '../context/AppContext';

export default function ContactBanner() {
  const { content } = useApp();

  return (
    <footer>
      <div style={{
        background: 'var(--deep-sage)',
        color: 'white',
        padding: '60px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: '900',
          marginBottom: '32px',
        }}>
          צור קשר
        </h2>

        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '32px',
        }}>
          <ContactItem icon="📱" label={`טלפון: ${content.contact_phone}`} href={`tel:${content.contact_phone}`} />
          <ContactItem icon="📧" label={content.contact_email} href={`mailto:${content.contact_email}`} />
          <ContactItem icon="📍" label={content.contact_address} />
        </div>

        <a
          href={`https://wa.me/${content.whatsapp_number}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#25D366',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '32px',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          💬 שלחו הודעה בוואטסאפ
        </a>
      </div>

      <div style={{
        background: '#1a1a1a',
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        padding: '18px',
        fontSize: '13px',
      }}>
        {content.footer_credit}
      </div>
    </footer>
  );
}

function ContactItem({ icon, label, href }) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ color: 'white', textDecoration: 'none' }}>
        {content}
      </a>
    );
  }
  return content;
}
