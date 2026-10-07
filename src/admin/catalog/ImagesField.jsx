import React, { useState } from 'react';
import { X, ImagePlus, Star } from 'lucide-react';
import { Modal, ImagePicker } from '../../ui/ui';

/** עד 4 תמונות. הראשונה = הראשית. לחיצה על תמונה: החלפה / הסרה / הפיכה לראשית */
export default function ImagesField({ images, onChange, emoji, max = 4 }) {
  const [open, setOpen] = useState(null); // index | 'new'
  const list = images.filter(Boolean);
  const setAt = (i, url) => {
    const next = [...list];
    if (url) next[i] = url; else next.splice(i, 1);
    onChange(next);
  };
  const makeMain = (i) => { const next = [...list]; const [x] = next.splice(i, 1); next.unshift(x); onChange(next); setOpen(null); };
  return (
    <>
      <div className="imgs">
        {list.map((src, i) => (
          <div key={src + i} style={{ position: 'relative' }}>
            <button type="button" className="im" onClick={() => setOpen(i)} aria-label={`תמונה ${i + 1}`}>
              <img src={src} alt="" onError={(e) => { e.currentTarget.style.opacity = .25; }} />
              {i === 0 && <span className="main-tag">ראשית</span>}
            </button>
            <button type="button" className="x" style={{ position: 'absolute', top: -6, left: -6, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => { if (window.confirm('להסיר את התמונה?')) setAt(i, ''); }} aria-label="הסרה"><X size={13} /></button>
          </div>
        ))}
        {list.length < max && (
          <button type="button" className="im add" onClick={() => setOpen('new')}><ImagePlus size={22} />{list.length ? 'עוד תמונה' : 'הוספת תמונה'}</button>
        )}
        {!list.length && emoji && <div className="im" style={{ cursor: 'default' }} title="מוצג כשאין תמונה">{emoji}</div>}
      </div>
      {open !== null && (
        <Modal title={open === 'new' ? 'הוספת תמונה' : `תמונה ${open + 1}`} onClose={() => setOpen(null)}
          footer={open !== 'new' && open > 0 ? <button className="a-btn ghost wide" onClick={() => makeMain(open)}><Star size={16} /> להפוך לתמונה הראשית</button> : null}>
          <ImagePicker value={open === 'new' ? '' : list[open]} allowRemove={open !== 'new'}
            onChange={(url) => { if (open === 'new') { if (url) onChange([...list, url]); } else setAt(open, url); setOpen(null); }} />
          <p className="a-hint">אפשר לצלם ישר מהטלפון. התמונה מוקטנת אוטומטית ונשמרת בגוגל דרייב.</p>
        </Modal>
      )}
    </>
  );
}
