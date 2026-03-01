import React from 'react';
import { useApp } from '../context/AppContext';

const LOGO_URL = 'https://i.ibb.co/6R35Qkzt/4.png';

export default function ContactBanner() {
  const { content, navigate } = useApp();

  return (
    <footer style={{
      background: 'linear-gradient(160deg, #2C1F1F 0%, #3A2030 50%, #1E2C35 100%)',
      color: 'white', padding: '52px 36px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* blobs חמים */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: '#C4861A', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.18 }} />
      <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '160px', height: '160px', background: '#8B5A6B', borderRadius: '50%', filter: 'blur(70px)', opacity: 0.12 }} />

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '36px', marginBottom: '40px' }}>

          {/* Brand – לוגו לבן גדול, בלי טקסט */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <img
              src={LOGO_URL}
              alt="אחינועם"
              style={{
                height: '110px', width: 'auto', objectFit: 'contain',
                filter: 'brightness(0) invert(1)',  /* ← הופך ללבן */
              }}
            />
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#D9A040', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', marginBottom: '14px', textTransform: 'uppercase' }}>צור קשר</h4>
            {[
              { icon: null, logo: 'whatsapp', text: content.contact_phone,  href: `https://wa.me/${content.whatsapp_number}` },
              { icon: '✉️', logo: null,        text: content.contact_email,  href: `mailto:${content.contact_email}` },
              { icon: '📍', logo: null,        text: content.contact_address, href: null },
              { icon: null, logo: 'instagram', text: '@Achinoam_art_desigh', href: 'https://www.instagram.com/achinoam_art_desigh?igsh=MTY5a204YTY2b3lnYg==' },
            ].map(item => (
              <div key={item.text}
                onClick={() => item.href && window.open(item.href, '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '9px', cursor: item.href ? 'pointer' : 'default' }}
                onMouseEnter={e => { if (item.href) e.currentTarget.style.opacity = '0.7'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {item.logo === 'whatsapp' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.526 5.855L.057 23.882l6.162-1.616A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.369l-.361-.214-3.741.981 1-3.635-.235-.374A9.86 9.86 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/></svg>
                )}
                {item.logo === 'instagram' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="url(#ig)"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                )}
                {item.icon && <span style={{ fontSize: '13px' }}>{item.icon}</span>}
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: 'rgba(220,180,140,0.8)', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', marginBottom: '14px', textTransform: 'uppercase' }}>ניווט</h4>
            {[
              { label: 'המוצרים שלי',   page: 'category', data: 'products'  },
              { label: 'עבודות גרפיקה', page: 'category', data: 'graphics'  },
              { label: 'סדנאות',        page: 'category', data: 'workshops' },
              { label: 'אודות',         page: 'about'                       },
            ].map(link => (
              <button key={link.label} onClick={() => navigate(link.page, link.data || null)}
                style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', marginBottom: '7px', fontFamily: 'var(--font-body)', transition: 'color 0.2s', textAlign: 'right' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >{link.label}</button>
            ))}
          </div>

          {/* WhatsApp */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', marginBottom: '14px', textTransform: 'uppercase' }}>להזמנות</h4>
            <a href={`https://wa.me/${content.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'white', padding: '11px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.526 5.855L.057 23.882l6.162-1.616A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.369l-.361-.214-3.741.981 1-3.635-.235-.374A9.86 9.86 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/></svg>
              כתבי לי בוואטסאפ
            </a>
          </div>
        </div>

        <div style={{ borderTop: 'none', paddingTop: '0', display: 'none', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{content.footer_credit}</p>
        </div>
      </div>
    </footer>
  );
}
