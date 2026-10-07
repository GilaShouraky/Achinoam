import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import { T } from '../edit/T';
import { useEdit } from '../edit/EditContext';
import { withBreaks } from '../lib/texts';
import { Pencil, Plus } from 'lucide-react';
import CategoryEditor from '../admin/catalog/CategoryEditor';

export default function ProductsPage({ subCatOverride } = {}) {
 const { navigate, pageData, products, subCats = [], site } = useApp();
 const ed = useEdit();
 const [editCat, setEditCat] = useState(false);
 // קטגוריות דינמיות מהאקסל לפי הסדר
 const subs = subCats.length > 0
   ? subCats.filter(cat => products.some(p => p.category === cat.id))
   : categories.products.subCategories.filter(sub => products.some(p => p.category === sub.id));
 const [active, setActive] = useState(subCatOverride || pageData?.subCategory || subs[0]?.id);
 const filtered = products.filter(p => p.category === active);
 const activeCat = site.allCats.find(c => c.id === active);
 const desc = activeCat?.description || '';

 return (
 <div className="fade-in">
 {/* Header */}
 <div style={{
 background: 'var(--rose-header, linear-gradient(135deg, #C0A0BC, #A885A8))',
 minHeight: '130px',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 position: 'relative', overflow: 'hidden',
 padding: '20px 20px',
 }}>
 <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(50px)' }} />
 {/* כפתור חזרה – למעלה משמאל, לא חופף */}
 <div style={{ position: 'absolute', top: '14px', right: '16px', zIndex: 2 }}>
 <button className="back-btn" onClick={() => navigate('home')}><T k="common.back_home" /></button>
 </div>
 <h1 className="page-main-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: '900', color: 'white', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.12)', position: 'relative', zIndex: 1, margin: '40px 0 0' }}>
 <T k="page.products_title" />
 </h1>
 </div>

 {/* טאבים */}
 <div style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--border-light)', padding: '14px 28px', overflowX: 'auto', display: 'flex', gap: '8px' }}>
 {subs.map(sub => (
 <button key={sub.id} onClick={() => setActive(sub.id)}
 style={{ padding: '7px 17px', borderRadius: '50px', border: 'none', background: active === sub.id ? 'var(--grad-rose)' : 'var(--cream)', color: active === sub.id ? 'white' : 'var(--mid)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', boxShadow: active === sub.id ? '0 3px 12px rgba(139,90,107,0.28)' : 'none' }}>
 {sub.label}
 </button>
 ))}
 </div>

 {/* הסבר על הקטגוריה */}
 {(desc || (ed?.editMode && activeCat)) && (
 <div className="cat-desc-wrap">
 <div className={`cat-desc${ed?.editMode ? ' editing' : ''}`}>
 {desc ? withBreaks(desc) : <span className="cat-desc-empty">אין הסבר לקטגוריה הזו</span>}
 {ed?.editMode && <button className="img-edit-btn cat-desc-btn" onClick={() => setEditCat(true)}>{desc ? <><Pencil size={13} /> עריכת ההסבר</> : <><Plus size={13} /> הוספת הסבר</>}</button>}
 </div>
 </div>
 )}
 {editCat && activeCat && <CategoryEditor cat={activeCat} onClose={() => setEditCat(false)} onSaved={() => ed.showToast('נשמר ✓')} />}

 <div style={{ maxWidth: '1060px', margin: '32px auto 68px', padding: '0 28px' }}>
 {filtered.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--light)' }}>
 <div style={{ fontSize: '46px', marginBottom: '14px' }}></div>
 <p><T k="products.empty" /></p>
 </div>
 ) : (
 <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: active === 'pesach' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '18px' }}>
 {filtered.map(p =><ProductCard key={p.id} product={p} />)}
 </div>
 )}
 </div>
 </div>
 );
}
