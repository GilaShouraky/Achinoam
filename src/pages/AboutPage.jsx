import React from 'react';
import { useApp } from '../context/AppContext';
import { T } from '../edit/T';

export default function AboutPage() {
 const { t, navigate } = useApp();
 return (
 <div className="fade-in">
 <div className="page-header">
 <button className="back-btn" onClick={() => navigate('home')}><T k="common.back_home" /></button>
 <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '900', color: 'var(--rose)', marginTop: '8px' }}><T k="about.title" /></h1>
 </div>
 <div style={{ maxWidth: '720px', margin: '46px auto 78px', padding: '0 28px' }}>
 <div style={{ background: 'var(--warm-white)', borderRadius: '26px', padding: '44px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden', marginBottom: '28px' }}>
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--rose), var(--slate), var(--amber))' }} />
 <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '140px', height: '140px', background: 'var(--slate)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.07 }} />
 <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '28px' }}>
 <div style={{ width: '70px', height: '70px', background: 'var(--rose-soft)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0, border: '1px solid var(--rose-pale)' }}></div>
 <div>
 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--rose)', fontWeight: '900', marginBottom: '3px' }}><T k="about_signature" /></h2>
 <p style={{ fontSize: '12px', color: 'var(--light)', letterSpacing: '1px' }}><T k="about.roles" /></p>
 </div>
 </div>
 <p style={{ fontSize: '14px', lineHeight: '2', color: 'var(--mid)', whiteSpace: 'pre-line' }}><T k="about_text" /></p>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', marginBottom: '36px' }}>
 {t('about.tags').split(',').map(x => x.trim()).filter(Boolean).map(x => (
 <span key={x} className="pill pill-rose">{x}</span>
 ))}
 <T k="about.tags" className="edit-only" />
 </div>
 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
 <button className="btn-primary" onClick={() => navigate('category', 'products')}><T k="about.btn_products" /></button>
 <button className="btn-secondary" onClick={() => navigate('contact')}><T k="about.btn_contact" /></button>
 </div>
 </div>
 </div>
 );
}
