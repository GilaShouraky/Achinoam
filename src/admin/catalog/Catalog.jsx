import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronUp, ChevronDown, Info, Package, Tag, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useEdit } from '../../edit/EditContext';
import { Switch } from '../../ui/ui';
import { SectionHead, Seg, useTab } from '../common';
import { rowToProduct } from '../../data/siteContent';
import CategoryEditor from './CategoryEditor';
import ProductEditor from './ProductEditor';
import { missingFields } from './missing';

const TABS = [['categories', 'קטגוריות'], ['products', 'מוצרים'], ['deals', 'מבצעים']];

export default function Catalog() {
  const nav = useNavigate();
  const [tab, setTab] = useTab(TABS.map(t => t[0]));
  return (
    <div>
      <SectionHead title="קטלוג" onBack={() => nav('/admin')} />
      <Seg tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'products' && <ProductsTab sheet="products" />}
      {tab === 'deals' && <DealsTab />}
    </div>
  );
}

function useRun() {
  const ed = useEdit();
  return async (fn, ok = 'נשמר ✓') => { try { await fn(); if (ok) ed.showToast(ok); } catch (e) { ed.showToast(e.message, 'bad'); } };
}

const Thumb = ({ src, emoji }) => <span className="thumb">{src ? <img src={src} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : (emoji || <Package size={22} color="#C9A8B4" />)}</span>;

/* ─────────────── קטגוריות ─────────────── */
function CategoriesTab() {
  const { site, raw, ops, cols } = useApp();
  const run = useRun();
  const ed = useEdit();
  const [editing, setEditing] = useState(null); // cat | 'new'
  const cats = site.allCats;
  const counts = useMemo(() => {
    const m = {};
    (raw.products || []).forEach(r => { const c = String(r['קטגוריה'] || '').trim(); if (c) m[c] = (m[c] || 0) + 1; });
    return m;
  }, [raw.products]);
  const move = (i, d) => {
    const ids = cats.map(c => c.key); const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run(() => ops.reorder('categories', ids), 'הסדר עודכן ✓');
  };
  return (
    <div>
      <div className="tools">
        <p className="small muted" style={{ flex: 1 }}>החצים משנים את הסדר. הסדר כאן = הסדר באתר.</p>
        <button className="a-btn amber sm" onClick={() => setEditing('new')}><Plus size={16} /> קטגוריה</button>
      </div>
      {cats.map((c, i) => {
        const n = counts[c.id] || 0;
        const problem = !c.image ? 'חסרה תמונה' : !n ? 'אין מוצרים' : null;
        return (
          <div key={c.key} className={`row${c.hidden ? ' off' : ''}`}>
            <span className="mv">
              <button className="a-icon-btn sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="למעלה"><ChevronUp size={15} /></button>
              <button className="a-icon-btn sm" disabled={i === cats.length - 1} onClick={() => move(i, 1)} aria-label="למטה"><ChevronDown size={15} /></button>
            </span>
            <button className="row-main" onClick={() => setEditing(c)}>
              <Thumb src={c.image} emoji="🗂️" />
              <span className="grow"><b className="nm">{c.label || '(בלי שם)'}</b>
                <span className="small muted">{n} מוצרים{problem && <span style={{ color: 'var(--a-bad)' }}> · {problem} – לא מוצגת</span>}</span></span>
            </button>
            <span className="swl"><Switch checked={!c.hidden} onChange={(v) => run(() => ops.saveRow('categories', { [cols.categories.id]: c.key, 'מוצג': v ? '' : 'לא' }), v ? 'מוצגת ✓' : 'הוסתרה')} />מוצגת</span>
          </div>
        );
      })}
      {!cats.length && <div className="empty"><Package size={40} /><div>אין עדיין קטגוריות</div></div>}
      <div className="grp-h"><Info size={14} /> קטגוריה מוצגת באתר רק כשיש לה תמונה, שם ולפחות מוצר אחד</div>
      {editing && <CategoryEditor cat={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => ed.showToast('נשמר ✓')} />}
    </div>
  );
}

/* ─────────────── מוצרים / גרפיקה ─────────────── */
function ProductsTab({ sheet }) {
  const { raw, site, ops, settings } = useApp();
  const ed = useEdit();
  const run = useRun();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState(null); // row | 'new'

  const cats = useMemo(() => site.allCats.map(c => ({ id: c.id, label: c.label || c.id })), [site.allCats]);
  const catIds = useMemo(() => cats.map(c => c.id), [cats]);
  const rows = useMemo(() => (raw[sheet] || []).filter(r => r['שם']).map(r => ({ r, p: rowToProduct(r), miss: missingFields(r, catIds) })), [raw, sheet, catIds]);
  const missingCount = rows.filter(x => x.miss.length).length;
  const featured = String(settings.featured_ids || '').split(',').map(s => s.trim()).filter(Boolean);

  // פתיחה ישירה של מוצר מהאתר (?edit=ID)
  const editId = params.get('edit');
  useEffect(() => {
    if (!editId) return;
    const hit = rows.find(x => x.p.id === editId);
    if (hit) setEditing(hit.r);
    const next = new URLSearchParams(params); next.delete('edit'); setParams(next, { replace: true });
  }, [editId]);

  const counts = {};
  rows.forEach(({ p }) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  const orphan = rows.filter(({ p }) => !cats.some(c => c.id === p.category)).length;
  const term = q.trim();
  const list = rows.filter(({ p, miss }) => (cat === 'all' || (cat === '_missing' ? miss.length > 0 : cat === '_none' ? !cats.some(c => c.id === p.category) : p.category === cat))
    && (!term || [p.name, p.description, p.id].some(x => String(x).includes(term))));
  const canMove = !['all', '_none', '_missing'].includes(cat) && !term;
  const move = (i, d) => {
    const a = list[i], b = list[i + d];
    if (!a || !b) return;
    const ids = rows.map(x => x.p.id);
    const ia = ids.indexOf(a.p.id), ib = ids.indexOf(b.p.id);
    [ids[ia], ids[ib]] = [ids[ib], ids[ia]];
    run(() => ops.reorder(sheet, ids), 'הסדר עודכן ✓');
  };
  const catLabel = (id) => cats.find(c => c.id === id)?.label;

  return (
    <div>
      <div className="tools">
        <label className="search"><Search size={18} /><input type="search" placeholder="חיפוש מוצר…" value={q} onChange={e => setQ(e.target.value)} /></label>
        <button className="a-btn amber icon" onClick={() => setEditing('new')} aria-label="מוצר חדש"><Plus size={20} /></button>
      </div>
      <div className="chips">
        {missingCount > 0 && <button className={`chip miss${cat === '_missing' ? ' on' : ''}`} onClick={() => setCat('_missing')}>חסרים פרטים<i>{missingCount}</i></button>}
        <button className={`chip${cat === 'all' ? ' on' : ''}`} onClick={() => setCat('all')}>הכול<i>{rows.length}</i></button>
        {cats.map(c => (counts[c.id] || cat === c.id) ? <button key={c.id} className={`chip${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>{c.label}<i>{counts[c.id] || 0}</i></button> : null)}
        {orphan > 0 && <button className={`chip${cat === '_none' ? ' on' : ''}`} onClick={() => setCat('_none')}>בלי קטגוריה<i>{orphan}</i></button>}
      </div>
      {canMove && list.length > 1 && <p className="small muted" style={{ margin: '-4px 2px 8px' }}>החצים משנים את הסדר בעמוד הקטגוריה.</p>}
      {list.map(({ r, p, miss }, i) => {
        const isFeat = featured.length ? featured.includes(p.id) : false;
        return (
          <div key={p.id + '_' + i} className={`row${p.hidden ? ' off' : ''}${miss.length ? ' missing' : ''}`}>
            {canMove && <span className="mv">
              <button className="a-icon-btn sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="למעלה"><ChevronUp size={15} /></button>
              <button className="a-icon-btn sm" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="למטה"><ChevronDown size={15} /></button>
            </span>}
            <button className="row-main" onClick={() => setEditing(r)}>
              <Thumb src={p.images[0]} emoji={p.emoji} />
              <span className="grow"><b className="nm">{p.name}</b>
                {miss.length > 0 && <span className="miss-line">חסר: {miss.join(', ')}</span>}
                <span className="badges">
                  <span className="badge b-rose">{p.price ? `₪${p.price}` : 'לפי הצעה'}</span>
                  {catLabel(p.category) ? <span className="badge b-slate">{catLabel(p.category)}</span> : <span className="badge b-bad">בלי קטגוריה</span>}
                  {p.stock !== null && p.stock <= 0 && <span className="badge b-bad">אזל</span>}
                  {p.stock !== null && p.stock > 0 && p.stock <= 3 && <span className="badge b-amber">נשארו {p.stock}</span>}
                  {p.dealQty && p.dealPrice ? <span className="badge b-amber">{p.dealQty} ב־{p.dealPrice}</span> : null}
                  {isFeat && <span className="badge b-ok"><Star size={11} /> נבחר</span>}
                </span></span>
            </button>
            <span className="swl"><Switch checked={!p.hidden} onChange={(v) => run(() => ops.saveRow(sheet, { 'מזהה': p.id, 'מוצג': v ? '' : 'לא' }), v ? 'מוצג באתר ✓' : 'הוסתר מהאתר')} />מוצג</span>
          </div>
        );
      })}
      {!list.length && <div className="empty"><Package size={40} /><div>{term ? 'לא נמצאו מוצרים' : 'אין מוצרים כאן עדיין'}</div></div>}
      {editing && <ProductEditor sheet={sheet} row={editing === 'new' ? null : editing} cats={cats}
        defaultCat={!['all', '_none', '_missing'].includes(cat) ? cat : ''} onClose={() => setEditing(null)} onSaved={(m) => ed.showToast(m)} />}
    </div>
  );
}

/* ─────────────── מבצעים ─────────────── */
function DealsTab() {
  const { raw, site } = useApp();
  const ed = useEdit();
  const [editing, setEditing] = useState(null);
  const cats = site.allCats.map(c => ({ id: c.id, label: c.label || c.id }));
  const rows = (raw.products || []).filter(r => r['שם']).map(r => ({ r, p: rowToProduct(r) })).filter(({ p }) => p.dealQty && p.dealPrice);
  const groups = {};
  rows.forEach(x => { const g = x.p.dealGroup || `__${x.p.id}`; (groups[g] = groups[g] || []).push(x); });
  return (
    <div>
      <div className="how">
        <b>איך עובדים מבצעים?</b> נכנסים למוצר ← מפעילים "מבצע" ← כמות ומחיר (למשל 2 ב־₪200).
        מוצרים עם אותו <b>שם קבוצה</b> נספרים יחד בסל. ההנחה מחושבת אוטומטית בסל הקניות.
      </div>
      {Object.entries(groups).map(([g, items]) => (
        <div key={g} className="box">
          <h4><Tag size={16} /> {g.startsWith('__') ? 'מבצע על מוצר בודד' : `קבוצה: ${g}`}
            <span className="badge b-amber" style={{ marginInlineStart: 'auto' }}>{items[0].p.dealQty} ב־₪{items[0].p.dealPrice}</span></h4>
          {items.map(({ r, p }) => (
            <button key={p.id} className="row-main" style={{ width: '100%', padding: '6px 0', borderTop: '1px solid var(--a-border)' }} onClick={() => setEditing(r)}>
              <Thumb src={p.images[0]} emoji={p.emoji} />
              <span className="grow"><b className="nm">{p.name}</b><span className="small muted">₪{p.price}{p.dealType ? ` · סוג: ${p.dealType}` : ''}{p.dealLabel ? ` · "${p.dealLabel}"` : ''}</span></span>
            </button>
          ))}
        </div>
      ))}
      {!rows.length && <div className="empty"><Tag size={40} /><div>אין כרגע מבצעים פעילים</div></div>}
      {editing && <ProductEditor sheet="products" row={editing} cats={cats} onClose={() => setEditing(null)} onSaved={(m) => ed.showToast(m)} />}
    </div>
  );
}
