import React from 'react';
import { useApp } from '../context/AppContext';
import { useEdit } from '../edit/EditContext';
import { T } from '../edit/T';

const isImageUrl = (val) => val && /^https?:\/\/\S+$/i.test(val.trim()) && /(\.(jpg|jpeg|png|gif|webp|svg)|googleusercontent|ibb\.co|cloudinary)/i.test(val);

export default function TopBanner() {
 const { t } = useApp();
 const ed = useEdit();
 const val = t('banner_text');
 if (!val && !ed?.editMode) return null;

 // תמונה — מציגה כ-banner מלא
 if (isImageUrl(val)) {
 return (
 <div style={{ width: '100%', overflow: 'hidden', maxHeight: '180px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
 <img src={val} alt="באנר" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
 {ed?.editMode && <div style={{ position: 'absolute', top: 8, left: 8 }}><T k="banner_text" /></div>}
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
 <T k="banner_text" />
 </div>
 );
}
