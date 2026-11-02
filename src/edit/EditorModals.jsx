import React, { useEffect, useState } from 'react';
import { RotateCcw, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEdit } from './EditContext';
import { textEntry, Rich, withBreaks } from '../lib/texts';
import { Modal, ErrorBox, ImagePicker, Switch, Spinner } from '../ui/ui';

/** חלון עריכה של טקסט אחד – משמש גם על האתר וגם ברשימה המרכזית */
export function TextEditorModal() {
  const ed = useEdit();
  const { settings } = useApp();
  const editing = ed?.editing?.kind === 'text' ? ed.editing.key : null;
  const e = editing ? textEntry(editing) : null;
  const current = editing ? (settings[editing] ?? e?.def ?? '') : '';
  const [val, setVal] = useState(current);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => { setVal(current || ''); setHidden(editing ? current === '' && (e?.def ?? '') !== '' : false); setErr(null); }, [editing]);
  if (!editing) return null;

  const changed = settings[editing] !== undefined && settings[editing] !== e?.def;
  const kind = e?.kind || 'text';
  const ltr = ['phone', 'link', 'number', 'email'].includes(kind);
  const long = e?.multiline || e?.rich || current.length > 60;
  const canHide = kind === 'text' && e?.optional !== false;

  const doSave = async () => {
    const out = hidden ? '' : val;
    if (!hidden && !out.trim() && (e?.def ?? '') !== '') { setErr('הטקסט ריק. כדי להסתיר אותו – הפעילי "הסתרה". כדי לחזור למקור – "חזרה לנוסח המקורי".'); return; }
    if (kind === 'link' && out && !/^(https?:\/\/|mailto:|tel:)/.test(out.trim())) { setErr('קישור צריך להתחיל ב־https://'); return; }
    setBusy(true); setErr(null);
    try { await ed.save(editing, out); ed.close(); ed.showToast('נשמר ✓'); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };
  const doReset = async () => {
    setBusy(true); setErr(null);
    try { await ed.reset(editing); ed.close(); ed.showToast('חזר לנוסח המקורי'); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <Modal title="עריכת טקסט" onClose={ed.close} footer={<>
      <button className="a-btn primary wide" onClick={doSave} disabled={busy}>{busy ? <Spinner /> : 'שמירה'}</button>
      {changed && <button className="a-btn ghost" onClick={doReset} disabled={busy}><RotateCcw size={16} /> לנוסח המקורי</button>}
    </>}>
      <p className="ed-where">{e ? <><b>{e.group}</b> · {e.label}</> : editing}</p>
      {!hidden && (long
        ? <textarea className="a-textarea" rows={e?.rich ? 8 : 4} value={val} onChange={(x) => setVal(x.target.value)} autoFocus />
        : <input className="a-input" dir={ltr ? 'ltr' : 'rtl'} value={val} onChange={(x) => setVal(x.target.value)} autoFocus
          onKeyDown={(x) => { if (x.key === 'Enter') doSave(); }} inputMode={kind === 'phone' || kind === 'number' ? 'tel' : undefined} />)}
      {hidden && <div className="a-alert info"><EyeOff size={17} /><div>הטקסט הזה מוסתר ולא יופיע באתר.</div></div>}
      {!hidden && <p className="a-hint">
        {long ? 'Enter יורד שורה. ' : ''}**מילה** תוצג מודגשת.
        {e?.rich && ' שורה שמתחילה ב־"- " תוצג כסעיף ברשימה. שורה ריקה מתחילה פסקה חדשה.'}
        {e?.vars?.length ? <> אפשר לשלב: {e.vars.map((v) => <code key={v} className="ed-var">{`{${v}}`}</code>)} – יוחלף אוטומטית.</> : null}
        {e?.help ? ' ' + e.help : ''}
      </p>}
      {canHide && <div style={{ margin: '10px 0' }}><Switch checked={hidden} onChange={setHidden} label="הסתרה מהאתר" /></div>}
      {!hidden && (long || val.includes('**')) && val.trim() && (
        <div className="ed-preview"><small>תצוגה מקדימה</small>
          <div className="rich">{e?.rich ? <Rich text={val} /> : withBreaks(val)}</div></div>
      )}
      {changed && e && <details className="ed-orig"><summary>הנוסח המקורי</summary><div>{e.def || '(ריק)'}</div></details>}
      <ErrorBox message={err} />
    </Modal>
  );
}

/** חלון החלפת תמונה */
export function ImageEditorModal() {
  const ed = useEdit();
  const { settings } = useApp();
  const ctx = ed?.editing?.kind === 'image' ? ed.editing : null;
  const key = ctx?.key;
  const e = key ? textEntry(key) : null;
  const current = ctx ? (ctx.value !== undefined ? ctx.value : settings[key] ?? e?.def ?? '') : '';
  const [val, setVal] = useState(current);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => { setVal(current); setErr(null); }, [key, ctx?.value]);
  if (!ctx) return null;
  const changed = !ctx.onSave && settings[key] !== undefined && settings[key] !== e?.def;

  const doSave = async () => {
    setBusy(true); setErr(null);
    try {
      if (ctx.onSave) await ctx.onSave(val); else await ed.save(key, val);
      ed.close(); ed.showToast('התמונה עודכנה ✓');
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  const doReset = async () => {
    setBusy(true);
    try { await ed.reset(key); ed.close(); ed.showToast('חזרה לתמונה המקורית'); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return (
    <Modal title={ctx.title || 'החלפת תמונה'} onClose={ed.close} footer={<>
      <button className="a-btn primary wide" onClick={doSave} disabled={busy || val === current}>{busy ? <Spinner /> : 'שמירה'}</button>
      {changed && <button className="a-btn ghost" onClick={doReset} disabled={busy}><RotateCcw size={16} /> למקורית</button>}
    </>}>
      {e && <p className="ed-where"><b>{e.group}</b> · {e.label}</p>}
      <ImagePicker value={val} onChange={setVal} allowRemove={ctx.allowRemove ?? e?.optional ?? true} />
      <p className="a-hint">תמונה שמעלים נשמרת בתיקייה "תמונות לאתר אחינועם" בגוגל דרייב שלך, ומוקטנת אוטומטית כדי שהאתר יישאר מהיר.</p>
      <ErrorBox message={err} />
    </Modal>
  );
}
