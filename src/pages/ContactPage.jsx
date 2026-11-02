import React from 'react';
import { useApp } from '../context/AppContext';
import { T } from '../edit/T';

export default function ContactPage() {
 const { t, navigate } = useApp();

 const items = [
 { icon: '', label: <T k="contact.l_phone" />, value: <T k="contact_phone" />, href: `https://wa.me/${t('whatsapp_number')}`, hint: <T k="contact.h_phone" />, color: '#25D366', key: 'p' },
 { icon: '', label: <T k="contact.l_email" />, value: <T k="contact_email" />, href: `mailto:${t('contact_email')}`, hint: <T k="contact.h_email" />, color: 'var(--slate)', key: 'e' },
 { icon: '', label: <T k="contact.l_address" />, value: <T k="contact_address" />, href: null, hint: null, color: 'var(--amber)', key: 'a' },
 { icon: '', label: <T k="contact.l_wa" />, value: <T k="contact.v_wa" />, href: `https://wa.me/${t('whatsapp_number')}`, hint: <T k="contact.h_wa" />, color: '#25D366', key: 'w' },
 { icon: '', label: <T k="contact.l_ig" />, value: <T k="instagram_handle" />, href: t('instagram_url'), hint: <T k="contact.h_ig" />, color: '#E1306C', key: 'i' },
 ];

 return (
 <div className="fade-in">
 <div className="page-header">
 <button className="back-btn" onClick={() => navigate('home')}><T k="common.back_home" /></button>
 <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '900', color: 'var(--rose)', marginTop: '8px' }}><T k="contact.title" /></h1>
 <p style={{ color: 'var(--light)', fontSize: '13px', marginTop: '5px' }}><T k="contact.sub" /></p>
 </div>

 <div style={{ maxWidth: '700px', margin: '46px auto 78px', padding: '0 28px' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
 {items.map(item => (
 <div key={item.key}
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
