import React, { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FullPage } from '../common';
import { Field, Switch, ErrorBox, Spinner } from '../../ui/ui';
import ImagesField from './ImagesField';

const IMG_COLS = ['תמונה1', 'תמונה2', 'תמונה3', 'תמונה4'];

export default function WorkshopEditor({ row, onClose, onSaved }) {
  const { ops, raw } = useApp();
  const emojiCol = Object.keys(row || raw.workshops?.[0] || {}).find(k => k.includes('אמוג')) || "אמוג'י";
  const [f, setF] = useState(() => ({
    'כותרת': row?.['כותרת'] || '', 'תיאור': row?.['תיאור'] || '', 'פרטים': row?.['פרטים'] || '',
    'הערת מחיר': row?.['הערת מחיר'] || '', [emojiCol]: row?.[emojiCol] || '', 'מוצג': row?.['מוצג'] || '',
  }));
  const [images, setImages] = useState(() => IMG_COLS.map(c => row?.[c] || '').filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF(x => ({ ...x, [k]: e.target.value }));
  const id = row?.['מזהה'];

  const save = async () => {
    if (!f['כותרת'].trim()) { setErr('צריך לתת שם לסדנה'); return; }
    setBusy(true); setErr(null);
    try {
      const out = { ...f };
      IMG_COLS.forEach((c, i) => { out[c] = images[i] || ''; });
      if (id) out['מזהה'] = id;
      await ops.saveRow('workshops', out, id ? {} : { newId: 'ws' + Date.now().toString(36) });
      onSaved?.(id ? 'הסדנה נשמרה ✓' : 'הסדנה נוספה ✓'); onClose();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm(`למחוק את "${row['כותרת']}"?`)) return;
    setBusy(true);
    try { await ops.deleteRow('workshops', id); onSaved?.('הסדנה נמחקה'); onClose(); } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <FullPage title={id ? 'עריכת סדנה' : 'סדנה חדשה'} onBack={onClose} footer={<>
      {id && <button className="a-btn danger-ghost icon" onClick={del} disabled={busy} aria-label="מחיקה"><Trash2 size={18} /></button>}
      <button className="a-btn primary wide" onClick={save} disabled={busy}>{busy ? <Spinner /> : <><Check size={18} /> שמירה לגוגל שיטס</>}</button>
    </>}>
      <span className="a-label">תמונות</span>
      <ImagesField images={images} onChange={setImages} emoji={f[emojiCol] || '✂️'} />
      <Field label="שם הסדנה" required><input className="a-input" value={f['כותרת']} onChange={set('כותרת')} /></Field>
      <Field label="תיאור"><textarea className="a-textarea" rows={4} value={f['תיאור']} onChange={set('תיאור')} /></Field>
      <Field label="פרטים (משך, מספר משתתפים, מה כלול…)"><textarea className="a-textarea" rows={3} value={f['פרטים']} onChange={set('פרטים')} /></Field>
      <Field label="מחיר / הערת מחיר" hint='למשל "₪120 למשתתפת" או "מחיר לפי כמות"'><input className="a-input" value={f['הערת מחיר']} onChange={set('הערת מחיר')} /></Field>
      <Field label="אימוג׳י (כשאין תמונה)"><input className="a-input" value={f[emojiCol]} onChange={set(emojiCol)} style={{ maxWidth: 120 }} /></Field>
      <div className="box"><div className="tg"><span>מוצגת באתר</span><Switch checked={f['מוצג'] !== 'לא'} onChange={(v) => setF(x => ({ ...x, 'מוצג': v ? '' : 'לא' }))} /></div></div>
      <ErrorBox message={err} />
    </FullPage>
  );
}
