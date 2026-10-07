import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, Field, ImagePicker, Switch, ErrorBox, Spinner } from '../../ui/ui';

/** עריכת קטגוריה: שם, תמונה, האם מוצגת. cat = null → קטגוריה חדשה */
export default function CategoryEditor({ cat, onClose, onSaved }) {
  const { ops, cols, raw } = useApp();
  const c = cols.categories;
  const [name, setName] = useState(cat?.label || '');
  const [image, setImage] = useState(cat?.image || '');
  const [visible, setVisible] = useState(cat ? !cat.hidden : true);
  const [desc, setDesc] = useState(cat?.description || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const count = cat ? (raw.products || []).filter(p => String(p['קטגוריה'] || '').trim() === cat.id).length : 0;

  const save = async () => {
    if (!name.trim()) { setErr('צריך לתת שם לקטגוריה'); return; }
    setBusy(true); setErr(null);
    try {
      const row = { [c.label]: name.trim(), [c.image]: image, 'תיאור_קטגוריה': desc.trim(), 'מוצג': visible ? '' : 'לא' };
      if (cat) row[c.id] = cat.key;
      await ops.saveRow('categories', row, cat ? {} : { newId: 'subcat_c' + Date.now().toString(36) });
      onSaved?.(); onClose();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  const del = async () => {
    const msg = count
      ? `בקטגוריה "${cat.label}" יש ${count} מוצרים. אחרי המחיקה הם לא יופיעו באתר עד שתעבירי אותם לקטגוריה אחרת. למחוק?`
      : `למחוק את הקטגוריה "${cat.label}"?`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    try { await ops.deleteRow('categories', cat.key); onSaved?.(); onClose(); } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <Modal title={cat ? 'עריכת קטגוריה' : 'קטגוריה חדשה'} onClose={onClose} footer={<>
      <button className="a-btn primary wide" onClick={save} disabled={busy}>{busy ? <Spinner /> : 'שמירה'}</button>
      {cat && <button className="a-btn danger-ghost icon" onClick={del} disabled={busy} aria-label="מחיקה"><Trash2 size={18} /></button>}
    </>}>
      <Field label="שם הקטגוריה" required><input className="a-input" value={name} onChange={e => setName(e.target.value)} autoFocus={!cat} placeholder="למשל: קולקציית חנוכה" /></Field>
      <Field label="הסבר על הקטגוריה (לא חובה)" hint='מופיע בעמוד המוצרים, בין רשימת הקטגוריות למוצרים. Enter יורד שורה, **מילה** מודגשת.'>
        <textarea className="a-textarea" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="למשל: כל הראנרים בעבודת יד, מתאימים לשולחן באורך 1.8–2.4 מ׳" />
      </Field>
      <div className="a-field"><span className="a-label">תמונה</span><ImagePicker value={image} onChange={setImage} /></div>
      <Switch checked={visible} onChange={setVisible} label="מוצגת באתר" />
      <p className="a-hint">קטגוריה מופיעה באתר רק כשיש לה תמונה, שם, ולפחות מוצר אחד{cat ? ` (כרגע: ${count} מוצרים)` : ''}.</p>
      <ErrorBox message={err} />
    </Modal>
  );
}
