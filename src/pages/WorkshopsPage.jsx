import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { workshops } from '../data/products';

export default function WorkshopsPage() {
  const { navigate, content, pageData } = useApp();
  const [activeWs, setActiveWs] = useState(
    pageData?.subCategory || workshops[0].id
  );

  const ws = workshops.find(w => w.id === activeWs) || workshops[0];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '32px 36px 24px' }}>
        <div onClick={() => navigate('home')} style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '8px', cursor: 'pointer' }}>
          ← חזרה לדף הבית
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900', color: 'var(--dark)' }}>
          סדנאות אומנות
        </h1>
      </div>

      {/* Sub category tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '24px 36px', maxWidth: '1100px', margin: '0 auto' }}>
        {workshops.map(w => (
          <button
            key={w.id}
            onClick={() => setActiveWs(w.id)}
            style={{
              padding: '9px 20px',
              border: `2px solid ${activeWs === w.id ? 'var(--deep-sage)' : 'var(--light-border)'}`,
              borderRadius: '24px',
              background: activeWs === w.id ? 'var(--deep-sage)' : 'white',
              color: activeWs === w.id ? 'white' : 'var(--dark)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            {w.emoji} {w.label}
          </button>
        ))}
      </div>

      {/* Workshop detail */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 36px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '36px',
        }}>
          {/* Main image */}
          <div style={{
            width: '100%',
            paddingTop: '75%',
            background: 'linear-gradient(135deg, #F5EFE6, #EDE0CC)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '80px',
            }}>
              {ws.emoji}
            </span>
            {ws.images?.[0] && (
              <img src={ws.images[0]} alt={ws.label}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Info */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px',
              fontWeight: '900',
              color: 'var(--dark)',
              marginBottom: '16px',
            }}>
              {ws.label}
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.9', color: 'var(--mid)', marginBottom: '16px' }}>
              {ws.description}
            </p>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--mid)', marginBottom: '24px' }}>
              {ws.details}
            </p>

            <div style={{
              background: 'var(--cream)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--deep-sage)',
            }}>
              💰 {ws.priceNote}
            </div>

            <a
              href={`https://wa.me/${content.whatsapp_number}?text=היי, אני מתעניין/ת ב${encodeURIComponent(ws.label)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#25D366',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              💬 להזמנה בוואטסאפ
            </a>
          </div>
        </div>

        {/* Gallery */}
        {ws.images?.length > 1 && (
          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              גלריית תמונות
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {ws.images.map((img, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', paddingTop: '100%', position: 'relative' }}>
                  <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
