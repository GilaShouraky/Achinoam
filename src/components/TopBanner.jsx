import React from 'react';
import { useApp } from '../context/AppContext';

const isImageUrl = (val) => val && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i.test(val);

export default function TopBanner() {
 const { content } = useApp();
 const val = content.banner_text;
 if (!val) return null;

 // תמונה — מציגה כ-banner מלא
 if (isImageUrl(val)) {
 return (
 <div style={{ width: '100%', overflow: 'hidden', maxHeight: '180px', borderBottom: '1px solid var(--border-light)' }}>
 <img src={val} alt="באנר" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
 </div>
 );
 }

 // טקסט — פס צבעוני
 return (
 <div style={{
 background: 'var(--rose)', color: 'white',
 textAlign: 'center', padding: '9px 20px',
 fontSize: '13px', fontWeight: '600', letterSpacing: '0.4px',
 }}>
 <span style={{ opacity: 0.5, marginLeft: '10px' }}></span>
 {val}
 <span style={{ opacity: 0.5, marginRight: '10px' }}></span>
 </div>
 );
}
