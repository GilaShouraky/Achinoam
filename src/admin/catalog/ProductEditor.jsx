import React, { useMemo, useState } from 'react';
import { Trash2, ExternalLink, Check, Tag, Eye, Info, Monitor } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NoEdit } from '../../edit/EditContext';
import { FullPage } from '../common';
import { Field, Switch, ErrorBox, Spinner } from '../../ui/ui';
import ImagesField from './ImagesField';
import ProductCard from '../../components/ProductCard';
import { rowToProduct, NO_PRICE } from '../../data/siteContent';

const IMG_COLS = ['תמונה1', 'תמונה2', 'תמונה3', 'תמונה4'];
const DEAL_COLS = ['מבצע_כמות', 'מבצע_מחיר', 'תיאור_מבצע', 'שם_מבצע', 'סוג_מבצע'];
const NEW = '__new__';
const csvList = (s) => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
const isNum = (s) => /^\d+(\.\d+)?$/.test(String(s).trim());
const isInt = (s) => /^\d+$/.test(String(s).trim());

const MODES = [
  { v: 'single', t: 'על המוצר הזה בלבד', d: 'למשל: 2 יחידות מהמוצר הזה ב־₪200.' },
  { v: 'group', t: 'קבוצת מוצרים', d: 'כמה מוצרים שונים נספרים יחד. למשל: כל 2 ראנרים מהקבוצה (גם בצבעים שונים) ב־₪200.' },
  { v: 'mix', t: 'סט משולב – אחד מכל סוג', d: 'ההנחה רק כשקונים ביחד מכל סוג. למשל: ראנר + כיסוי חלה ב־₪200. כל מוצר בקבוצה מסומן לפי הסוג שלו.' },
];

/** עריכת מוצר. row = השורה מהגיליון, או null למוצר חדש */
export default function ProductEditor({ sheet, row, cats, defaultCat, onClose, onSaved }) {
  const { ops, settings, raw, t } = useApp();
  const isNew = !row;
  const id = row?.['מזהה'];
  const [f, setF] = useState(() => ({
    'שם': row?.['שם'] || '', 'מחיר': row?.['מחיר'] ?? '', 'כמות_במלאי': row?.['כמות_במלאי'] ?? '',
    'קטגוריה': row?.['קטגוריה'] || defaultCat || '', 'תיאור': row?.['תיאור'] || '', 'הערת מחיר': row?.['הערת מחיר'] === NO_PRICE ? '' : (row?.['הערת מחיר'] || ''),
    'מבצע_כמות': row?.['מבצע_כמות'] || '', 'מבצע_מחיר': row?.['מבצע_מחיר'] || '', 'תיאור_מבצע': row?.['תיאור_מבצע'] || '',
    'שם_מבצע': row?.['שם_מבצע'] || '', 'סוג_מבצע': row?.['סוג_מבצע'] || '',
    'מוצג': row?.['מוצג'] || '',
  }));
  const [images, setImages] = useState(() => IMG_COLS.map(c => row?.[c] || '').filter(Boolean));
  // מחיר רגיל / טקסט במקום מחיר / בלי מחיר בכלל
  const [priceMode, setPriceMode] = useState(() => (!row || Number(row['מחיר']) > 0 ? 'price' : row['הערת מחיר'] === NO_PRICE ? 'none' : 'note'));

  // מוצרים נבחרים: אם הרשימה ריקה האתר מציג את 8 הראשונים
  const all = useMemo(() => (raw[sheet] || []).filter(r => r['שם']).map(rowToProduct), [raw, sheet]);
  const visibleIds = all.filter(p => !p.hidden).map(p => p.id);
  const featuredList = csvList(settings.featured_ids);
  const featuredNow = id ? (featuredList.length ? featuredList.includes(id) : visibleIds.slice(0, 8).includes(id)) : false;
  const [featured, setFeatured] = useState(featuredNow);
  const cheapMax = Number(t('home.under100_max')) || 100;
  const excluded = csvList(settings.under100_exclude);
  const [cheap, setCheap] = useState(id ? !excluded.includes(id) : true);

  // מבצעים: קבוצות וסוגים שכבר קיימים בגיליון
  const groups = useMemo(() => {
    const m = {};
    all.filter(p => p.dealGroup && p.id !== id).forEach(p => {
      const g = m[p.dealGroup] || (m[p.dealGroup] = { name: p.dealGroup, qty: p.dealQty, price: p.dealPrice, label: p.dealLabel, types: new Set(), items: [] });
      if (p.dealType) g.types.add(p.dealType);
      g.items.push(p.name);
    });
    return m;
  }, [all, id]);
  const [deal, setDeal] = useState(!!(f['מבצע_כמות'] || f['מבצע_מחיר']));
  const [mode, setMode] = useState(f['סוג_מבצע'] ? 'mix' : f['שם_מבצע'] ? 'group' : 'single');
  const [newGroup, setNewGroup] = useState(!!f['שם_מבצע'] && !groups[f['שם_מבצע']]);
  const ownType = row?.['שם_מבצע'] === f['שם_מבצע'] ? (row?.['סוג_מבצע'] || '').trim() : '';
  const groupTypes = [...new Set([...(groups[f['שם_מבצע']]?.types || []), ownType].filter(Boolean))];
  const [newType, setNewType] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [bad, setBad] = useState({});
  const set = (k) => (e) => { const v = e.target.value; setF(x => ({ ...x, [k]: v })); setBad(b => ({ ...b, [k]: false })); };
  const price = priceMode === 'price' ? (Number(f['מחיר']) || 0) : 0;

  const pickGroup = (v) => {
    if (v === NEW) { setNewGroup(true); setF(x => ({ ...x, 'שם_מבצע': '', 'סוג_מבצע': '' })); return; }
    setNewGroup(false);
    const g = groups[v];
    // מצטרפים לקבוצה קיימת → אותה כמות, מחיר ותגית
    setF(x => ({ ...x, 'שם_מבצע': v, 'סוג_מבצע': '', ...(g ? { 'מבצע_כמות': String(g.qty || ''), 'מבצע_מחיר': String(g.price || ''), 'תיאור_מבצע': g.label || x['תיאור_מבצע'] } : {}) }));
    setNewType(false);
    setBad(b => ({ ...b, 'שם_מבצע': false }));
  };

  const validate = () => {
    const b = {};
    if (!f['שם'].trim()) b['שם'] = 'צריך לתת שם למוצר';
    if (!f['קטגוריה']) b['קטגוריה'] = 'צריך לבחור קטגוריה';
    if (priceMode === 'price' && (!isNum(f['מחיר']) || Number(f['מחיר']) <= 0)) b['מחיר'] = 'מחיר במספרים בלבד';
    if (!isInt(f['כמות_במלאי'])) b['כמות_במלאי'] = 'מלאי במספר שלם (0 = אזל)';
    if (deal) {
      if (!isInt(f['מבצע_כמות']) || Number(f['מבצע_כמות']) < 1) b['מבצע_כמות'] = 'כמות במספר שלם';
      if (!isNum(f['מבצע_מחיר']) || Number(f['מבצע_מחיר']) <= 0) b['מבצע_מחיר'] = 'מחיר במספרים';
      if (mode !== 'single' && !f['שם_מבצע'].trim()) b['שם_מבצע'] = 'צריך לבחור או ליצור קבוצה';
      if (mode === 'mix' && !f['סוג_מבצע'].trim()) b['סוג_מבצע'] = 'צריך לבחור סוג';
    }
    setBad(b);
    const first = Object.values(b)[0];
    setErr(first ? `${first}${Object.keys(b).length > 1 ? ` (ועוד ${Object.keys(b).length - 1})` : ''}` : null);
    return !first;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const out = { ...f, 'שם': f['שם'].trim(), 'מחיר': String(f['מחיר']).trim(), 'כמות_במלאי': String(f['כמות_במלאי']).trim() };
      if (priceMode === 'price') out['הערת מחיר'] = '';
      if (priceMode === 'note') out['מחיר'] = '';
      if (priceMode === 'none') { out['מחיר'] = ''; out['הערת מחיר'] = NO_PRICE; }
      if (!deal) DEAL_COLS.forEach(k => { out[k] = ''; });
      else {
        if (mode === 'single') { out['שם_מבצע'] = ''; out['סוג_מבצע'] = ''; }
        if (mode === 'group') out['סוג_מבצע'] = '';
        out['שם_מבצע'] = out['שם_מבצע'].trim(); out['סוג_מבצע'] = out['סוג_מבצע'].trim();
      }
      IMG_COLS.forEach((c, i) => { out[c] = images[i] || ''; });
      if (id) out['מזהה'] = id;
      const newId = await ops.saveRow(sheet, out);
      const pid = String(newId || id);
      if (sheet === 'products') {
        const extra = {};
        if (featured !== featuredNow || (isNew && featured)) {
          const base = featuredList.length ? featuredList : visibleIds.slice(0, 8);
          extra.featured_ids = (featured ? [...new Set([...base, pid])] : base.filter(x => x !== pid)).join(',');
        }
        const wasCheap = !excluded.includes(pid);
        if (cheap !== wasCheap) extra.under100_exclude = (cheap ? excluded.filter(x => x !== pid) : [...excluded, pid]).join(',');
        if (Object.keys(extra).length) await ops.saveSettings(extra);
      }
      onSaved?.(isNew ? 'המוצר נוסף ✓' : 'המוצר נשמר ✓');
      onClose();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm(`למחוק את "${row['שם']}"? אי אפשר לבטל.\n(אפשר במקום זה להסתיר אותו מהאתר)`)) return;
    setBusy(true);
    try { await ops.deleteRow(sheet, id); onSaved?.('המוצר נמחק'); onClose(); } catch (e) { setErr(e.message); setBusy(false); }
  };

  // תצוגה מקדימה – בדיוק הכרטיס של האתר
  const previewProduct = {
    id: id || 'new', name: f['שם'] || 'שם המוצר', description: f['תיאור'], images, emoji: '',
    price, priceNote: priceMode === 'note' ? (f['הערת מחיר'] || t('product.price_note_short')) : '', noPrice: priceMode === 'none',
    dealQty: deal && Number(f['מבצע_כמות']) ? Number(f['מבצע_כמות']) : null,
    dealPrice: deal && Number(f['מבצע_מחיר']) ? Number(f['מבצע_מחיר']) : null,
    dealLabel: deal ? (f['תיאור_מבצע'] || null) : null,
  };
  const stockN = isInt(f['כמות_במלאי']) ? Number(f['כמות_במלאי']) : null;
  const lowFrom = Number(t('product.low_stock_from')) || 5;
  const num = (k, extra = {}) => ({ className: `a-input${bad[k] ? ' bad' : ''}`, inputMode: 'decimal', dir: 'ltr', value: f[k], onChange: set(k), ...extra });
  const catLabel = cats.find(c => c.id === f['קטגוריה'])?.label;

  return (
    <FullPage title={isNew ? 'מוצר חדש' : 'עריכת מוצר'} onBack={onClose}
      extra={id && <button className="a-btn ghost sm" onClick={() => window.open(`/product/${encodeURIComponent(id)}`, '_blank')}><ExternalLink size={14} /> באתר</button>}
      footer={<>
        {!isNew && <button className="a-btn danger-ghost icon" onClick={del} disabled={busy} aria-label="מחיקה"><Trash2 size={18} /></button>}
        <button className="a-btn primary wide" onClick={save} disabled={busy}>{busy ? <Spinner /> : <><Check size={18} /> שמירה לגוגל שיטס</>}</button>
      </>}>
      <div className="pe-grid">
        <aside className="pe-prev">
          <div className="box">
            <h4><Monitor size={16} /> כך זה ייראה באתר</h4>
            <div className="pe-card"><NoEdit><ProductCard product={previewProduct} preview /></NoEdit></div>
            <div className="pe-notes">
              {stockN === 0 && <span className="badge b-bad">יוצג "{t('product.out')}"</span>}
              {stockN > 0 && stockN <= lowFrom && <span className="badge b-amber">{t('product.low_stock', { n: stockN })}</span>}
              {catLabel && <span className="badge b-slate">בקטגוריה: {catLabel}</span>}
              {f['מוצג'] === 'לא' && <span className="badge b-bad">מוסתר מהגולשים</span>}
              {featured && sheet === 'products' && <span className="badge b-ok">מופיע במוצרים הנבחרים</span>}
            </div>
          </div>
        </aside>

        <div className="pe-form">
          <span className="a-label">תמונות <small className="muted" style={{ fontWeight: 400 }}>· הראשונה היא התמונה הראשית</small></span>
          <ImagesField images={images} onChange={setImages} />

          <Field label="שם המוצר" required><input className={`a-input${bad['שם'] ? ' bad' : ''}`} value={f['שם']} onChange={set('שם')} autoFocus={isNew} /></Field>
          <Field label="קטגוריה" required>
            <select className={`a-select${bad['קטגוריה'] ? ' bad' : ''}`} value={f['קטגוריה']} onChange={set('קטגוריה')}>
              <option value="" disabled>בחרי קטגוריה…</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              {f['קטגוריה'] && !cats.some(c => c.id === f['קטגוריה']) && <option value={f['קטגוריה']}>{f['קטגוריה']} (לא קיימת)</option>}
            </select>
          </Field>
          <span className="a-label">מחיר <i className="a-req">*</i></span>
          <div className="seg price-seg">
            {[['price', 'מחיר'], ['note', 'טקסט במקום מחיר'], ['none', 'בלי מחיר']].map(([k, l]) => (
              <button key={k} type="button" className={priceMode === k ? 'on' : ''} onClick={() => { setPriceMode(k); setBad(b => ({ ...b, 'מחיר': false })); }}>{l}</button>
            ))}
          </div>
          <div className="a-row">
            {priceMode === 'price' && <Field label="מחיר ₪" required hint={bad['מחיר']}><input {...num('מחיר')} /></Field>}
            {priceMode === 'note' && <Field label="מה לכתוב במקום מחיר" hint={`ריק = "${t('product.price_note_short')}"`}><input className="a-input" value={f['הערת מחיר']} onChange={set('הערת מחיר')} placeholder={t('product.price_note_short')} /></Field>}
            {priceMode === 'none' && <p className="a-hint" style={{ flex: 1, margin: '0 0 14px' }}>לא יוצג מחיר בכלל, וגם לא כפתור "הוספה לסל".</p>}
            <Field label="כמה במלאי" required hint={bad['כמות_במלאי'] || (stockN === 0 ? 'יוצג "אזל מהמלאי"' : null)}><input {...num('כמות_במלאי', { inputMode: 'numeric' })} /></Field>
          </div>
          {priceMode === 'note' && <p className="a-hint" style={{ marginTop: -8 }}>בלי מחיר אי אפשר להוסיף לסל – הלקוחה פונה אלייך בוואטסאפ.</p>}
          <Field label="תיאור"><textarea className="a-textarea" rows={4} value={f['תיאור']} onChange={set('תיאור')} /></Field>

          <div className="box">
            <h4><Eye size={16} /> איפה המוצר מופיע</h4>
            <div className="tg"><span>מוצג באתר<small>כבוי = מוסתר מהגולשים, נשאר בגיליון</small></span><Switch checked={f['מוצג'] !== 'לא'} onChange={(v) => setF(x => ({ ...x, 'מוצג': v ? '' : 'לא' }))} /></div>
            {sheet === 'products' && <>
              <div className="tg"><span>במוצרים הנבחרים בדף הבית</span><Switch checked={featured} onChange={setFeatured} /></div>
              <div className="tg"><span>במתנות עד {cheapMax} ₪{price > cheapMax || !price ? <small>רק למוצרים במחיר עד {cheapMax} ₪</small> : null}</span>
                <Switch checked={cheap && price > 0 && price <= cheapMax} disabled={!price || price > cheapMax} onChange={setCheap} /></div>
            </>}
          </div>

          <div className="box">
            <div className="tg" style={{ paddingTop: 0 }}><h4 style={{ margin: 0 }}><Tag size={16} /> מבצע</h4><Switch checked={deal} onChange={setDeal} /></div>
            {deal && <>
              <span className="a-label" style={{ marginTop: 10 }}>סוג המבצע</span>
              <div className="deal-modes">
                {MODES.map(m => (
                  <label key={m.v} className={`deal-mode${mode === m.v ? ' on' : ''}`}>
                    <input type="radio" name="dealmode" checked={mode === m.v} onChange={() => setMode(m.v)} />
                    <span><b>{m.t}</b><small>{m.d}</small></span>
                  </label>
                ))}
              </div>

              {mode !== 'single' && (
                <Field label="קבוצת המבצע" required hint={bad['שם_מבצע'] || (groups[f['שם_מבצע']] ? `בקבוצה כבר: ${groups[f['שם_מבצע']].items.join(', ')}` : null)}>
                  <select className={`a-select${bad['שם_מבצע'] ? ' bad' : ''}`} value={newGroup ? NEW : f['שם_מבצע']} onChange={(e) => pickGroup(e.target.value)}>
                    <option value="" disabled>בחרי קבוצה…</option>
                    {Object.values(groups).map(g => <option key={g.name} value={g.name}>{g.name} ({g.items.length} מוצרים · {g.qty} ב־₪{g.price})</option>)}
                    <option value={NEW}>+ קבוצה חדשה…</option>
                  </select>
                  {newGroup && <input className="a-input" style={{ marginTop: 6 }} value={f['שם_מבצע']} onChange={set('שם_מבצע')} placeholder='שם לקבוצה, למשל "שולחן שבת"' autoFocus />}
                </Field>
              )}

              {mode === 'mix' && (
                <Field label="הסוג של המוצר הזה בסט" required hint={bad['סוג_מבצע'] || 'כל מוצר בקבוצה מקבל סוג. ההנחה חלה כשיש בסל לפחות אחד מכל סוג.'}>
                  <select className={`a-select${bad['סוג_מבצע'] ? ' bad' : ''}`} value={newType ? NEW : f['סוג_מבצע']} onChange={(e) => {
                    const v = e.target.value; setBad(b => ({ ...b, 'סוג_מבצע': false }));
                    if (v === NEW) { setNewType(true); setF(x => ({ ...x, 'סוג_מבצע': '' })); } else { setNewType(false); setF(x => ({ ...x, 'סוג_מבצע': v })); }
                  }}>
                    <option value="" disabled>בחרי סוג…</option>
                    {groupTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                    <option value={NEW}>+ סוג חדש…</option>
                  </select>
                  {newType && <input className="a-input" style={{ marginTop: 6 }} value={f['סוג_מבצע']} onChange={set('סוג_מבצע')} placeholder='למשל "ראנר" או "כיסוי חלה"' autoFocus />}
                </Field>
              )}

              <div className="a-row">
                <Field label={mode === 'mix' ? 'כמה מוצרים בסט' : 'כמות'} required hint={bad['מבצע_כמות']}><input {...num('מבצע_כמות', { inputMode: 'numeric' })} /></Field>
                <Field label="במחיר ₪" required hint={bad['מבצע_מחיר']}><input {...num('מבצע_מחיר')} /></Field>
              </div>
              {isInt(f['מבצע_כמות']) && isNum(f['מבצע_מחיר']) && Number(f['מבצע_כמות']) > 0 && (
                <p className="a-alert ok" style={{ marginTop: 0 }}>
                  {mode === 'mix' ? `סט של ${f['מבצע_כמות']} (אחד מכל סוג) ב־₪${f['מבצע_מחיר']}` : `${f['מבצע_כמות']} יחידות ב־₪${f['מבצע_מחיר']}`}
                  {price && mode === 'single' ? ` · במקום ₪${Number(f['מבצע_כמות']) * price}` : ''}
                </p>
              )}
              <Field label="תגית על המוצר" hint='מופיעה על הכרטיס ליד "מבצע!". למשל "2 ב־200".'><input className="a-input" value={f['תיאור_מבצע']} onChange={set('תיאור_מבצע')} /></Field>
            </>}
          </div>
          {isNew && <p className="a-hint"><Info size={13} style={{ verticalAlign: -2 }} /> המוצר יתווסף בסוף הלשונית "מוצרים" בגיליון.</p>}
          <ErrorBox message={err} />
        </div>
      </div>
    </FullPage>
  );
}
