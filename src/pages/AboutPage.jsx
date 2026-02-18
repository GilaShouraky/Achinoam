import React from 'react';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { navigate, content } = useApp();

  return (
    <div className="fade-in">
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '32px 36px 24px' }}>
        <div onClick={() => navigate('home')} style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '8px', cursor: 'pointer' }}>
          ← חזרה לדף הבית
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900', color: 'var(--dark)' }}>
          אודות
        </h1>
      </div>

      <div style={{ maxWidth: '760px', margin: '50px auto', padding: '0 36px 80px' }}>
        {/* Profile area */}
        <div style={{
          background: 'white',
          border: '1px solid var(--light-border)',
          borderRadius: '24px',
          padding: '48px 44px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '5px', height: '100%',
            background: 'linear-gradient(to bottom, var(--sage), var(--terracotta), var(--gold))',
          }} />

          <div style={{
            width: '90px', height: '90px',
            background: 'linear-gradient(135deg, var(--sage), var(--deep-sage))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '44px',
            marginBottom: '24px',
          }}>
            🌿
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: '900',
            color: 'var(--dark)',
            marginBottom: '20px',
          }}>
            אחינועם הר כוכב
          </h2>

          <p style={{
            fontSize: '16px',
            lineHeight: '2',
            color: 'var(--mid)',
            whiteSpace: 'pre-line',
            marginBottom: '20px',
          }}>
            {content.about_text}
          </p>

          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--deep-sage)',
            fontWeight: '700',
          }}>
            {content.about_signature}
          </p>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '28px' }}>
          {['🎨 גרפיקאית', '🎁 מתנות אישיות', '✂️ סדנאות', '🌿 עיצוב מקורי', '💌 עם אהבה'].map(tag => (
            <span key={tag} style={{
              background: 'white',
              border: '1px solid var(--light-border)',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '14px',
              color: 'var(--mid)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '36px',
          background: 'var(--deep-sage)',
          borderRadius: '20px',
          padding: '32px 36px',
          textAlign: 'center',
          color: 'white',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>
            רוצים לדבר?
          </h3>
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
              padding: '12px 28px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            💬 שלחו הודעה
          </a>
        </div>
      </div>
    </div>
  );
}
