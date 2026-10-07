import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MessageCircle, Phone, Mail, Receipt, MapPin, Plus, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useEdit } from '../../edit/EditContext';
import { Modal, Field, ErrorBox, Spinner } from '../../ui/ui';
import { SectionHead, Seg, useTab, FullPage, STATUSES, statusOf, statusCls, isOpen, orderFields, parseDate, fmtDate, money, num, waLink } from '../common';

export default function Orders() {
  const nav = useNavigate();
  const [tab, setTab] = useTab(['orders', 'pickup']);
  return (
    <div>
      <SectionHead title="הזמנות" onBack={() => nav('/admin')} />
      <Seg tabs={[['orders', 'הזמנות'], ['pickup', 'נקודות איסוף']]} value={tab} onChange={setTab} />
      {tab === 'orders' ? <OrdersList /> : <Pickup />}
    </div>
  );
}

function OrdersList() {
  const { adminData } = useApp();
  const [filter, setFilter] = useState('open');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const orders = adminData?.orders || [];
  const f = useMemo(() => orderFields(adminData?.info?.orders?.headers || Object.keys(orders[0] || {}).filter(k => k !== '_row')), [adminData, orders]);
  // החדשות למעלה
  const sorted = useMemo(() => [...orders].sort((a, b) => {
    const da = parseDate(a[f.date]), db = parseDate(b[f.date]);
    if (da && db) return db - da;
    return b._row - a._row;
  }), [orders, f]);
  const counts = { open: 0 };
  sorted.forEach(o => { const s = statusOf(o); counts[s] = (counts[s] || 0) + 1; if (isOpen(s)) counts.open++; });
  const term = q.trim();
  const list = sorted.filter(o => {
    const s = statusOf(o);
    if (filter === 'open' && !isOpen(s)) return false;
    if (filter !== 'open' && filter !== 'all' && s !== filter) return false;
    return !term || Object.values(o).some(v => String(v).includes(term));
  });
  const current = sel && orders.find(o => o._row === sel._row);

  return (
    <div>
      <div className="tools"><label className="search"><Search size={18} /><input type="search" placeholder="חיפוש לפי שם, טלפון, מוצר…" value={q} onChange={e => setQ(e.target.value)} /></label></div>
      <div className="chips">
        <button className={`chip${filter === 'open' ? ' on' : ''}`} onClick={() => setFilter('open')}>פתוחות<i>{counts.open}</i></button>
        {STATUSES.map(s => <button key={s.v} className={`chip${filter === s.v ? ' on' : ''}`} onClick={() => setFilter(s.v)}>{s.v}<i>{counts[s.v] || 0}</i></button>)}
        <button className={`chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>הכול<i>{orders.length}</i></button>
      </div>
      {list.map(o => {
        const s = statusOf(o);
        return (
          <div key={o._row} className="row" onClick={() => setSel(o)} style={{ cursor: 'pointer' }}>
            <span className={`ord-ic ${statusCls(s)}`}><ShoppingBag size={19} /></span>
            <span className="grow">
              <b className="nm">{o[f.name] || 'ללא שם'}</b>
              <span className="small muted">{fmtDate(parseDate(o[f.date])) || ''}{f.total ? ` · ${money(num(o[f.total]))}` : ''}</span>
              {f.items && <span className="small" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--a-mid)' }}>{o[f.items]}</span>}
            </span>
            <span className={`st ${statusCls(s)}`}>{s}</span>
          </div>
        );
      })}
      {!list.length && <div className="empty"><ShoppingBag size={40} /><div>{orders.length ? 'אין הזמנות בסינון הזה' : 'עדיין אין הזמנות בגיליון'}</div></div>}
      {current && <OrderPage order={current} f={f} onClose={() => setSel(null)} />}
    </div>
  );
}

function OrderPage({ order, f, onClose }) {
  const { ops } = useApp();
  const ed = useEdit();
  const s = statusOf(order);
  const [note, setNote] = useState(order['הערה פנימית'] || '');
  const [busy, setBusy] = useState(null);
  const update = async (fields, msg) => {
    setBusy(Object.keys(fields)[0]);
    try { await ops.orderUpdate(order, fields); ed.showToast(msg); } catch (e) { ed.showToast(e.message, 'bad'); }
    setBusy(null);
  };
  const name = order[f.name] || '';
  const first = name.split(' ')[0];
  const wa = waLink(order[f.phone], `היי ${first}, `);
  const receipt = f.receipt && /^https?:/.test(order[f.receipt]) ? order[f.receipt] : Object.values(order).find(v => /^https?:\/\/\S+(cloudinary|\.(jpg|png|jpeg|webp))/i.test(String(v)));
  const shown = new Set([f.name, f.phone, f.email, f.total, f.date, f.items, 'סטטוס', 'הערה פנימית', '_row']);
  const rest = Object.entries(order).filter(([k, v]) => !shown.has(k) && String(v).trim() && v !== receipt);

  return (
    <FullPage title={`הזמנה${order[f.id] ? ' #' + order[f.id] : ''}`} onBack={onClose}>
      <div className="box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div><div className="big-name">{name || 'ללא שם'}</div><div className="small muted">{fmtDate(parseDate(order[f.date]))}</div></div>
          {f.total && <div className="big-total">{money(num(order[f.total]))}</div>}
        </div>
        <div className="contact-btns">
          {wa && <a className="a-btn ok sm" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={15} /> וואטסאפ</a>}
          {order[f.phone] && <a className="a-btn ghost sm" href={`tel:${order[f.phone]}`}><Phone size={15} /> {order[f.phone]}</a>}
          {order[f.email] && <a className="a-btn ghost sm" href={`mailto:${order[f.email]}`}><Mail size={15} /> מייל</a>}
          {receipt && <a className="a-btn ghost sm" href={receipt} target="_blank" rel="noreferrer"><Receipt size={15} /> אסמכתא</a>}
        </div>
        {f.items && order[f.items] && <div style={{ background: 'var(--a-bg)', borderRadius: 12, padding: '10px 12px' }}>
          {String(order[f.items]).split(/,\s*(?=[^)]*(?:\(|$))/).map((it, i) => <div key={i} style={{ padding: '2px 0' }}>• {it}</div>)}
        </div>}
      </div>

      <div className="box">
        <h4>סטטוס</h4>
        <div className="st-grid">
          {STATUSES.map(x => (
            <button key={x.v} className={`st-btn ${x.cls}${s === x.v ? ' on' : ''}`} disabled={!!busy} onClick={() => s !== x.v && update({ 'סטטוס': x.v }, `סומנה כ"${x.v}"`)}
              style={s === x.v ? {} : { background: '#fff', color: 'var(--a-mid)' }}>{busy === 'סטטוס' && s !== x.v ? '…' : x.v}</button>
          ))}
        </div>
        {s === 'מוכנה' && wa && <a className="a-btn ghost sm" style={{ marginTop: 10 }} target="_blank" rel="noreferrer"
          href={waLink(order[f.phone], `היי ${first}, ההזמנה שלך מוכנה לאיסוף 🎁`)}><MessageCircle size={15} /> לשלוח הודעה שההזמנה מוכנה</a>}
      </div>

      <div className="box">
        <h4>הערה פנימית (רק את רואה)</h4>
        <textarea className="a-textarea" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="למשל: שולם, לארוז בנפרד, לאסוף ביום חמישי…" />
        {note !== (order['הערה פנימית'] || '') && <button className="a-btn primary sm" style={{ marginTop: 8 }} disabled={!!busy} onClick={() => update({ 'הערה פנימית': note }, 'ההערה נשמרה ✓')}>{busy ? <Spinner /> : 'שמירת הערה'}</button>}
      </div>

      {rest.length > 0 && <div className="box"><h4>כל הפרטים</h4>{rest.map(([k, v]) => <div key={k} className="kv"><span>{k}</span><span>{/^https?:/.test(v) ? <a href={v} target="_blank" rel="noreferrer" style={{ color: 'var(--a-rose)' }}>קישור</a> : v}</span></div>)}</div>}
    </FullPage>
  );
}

/* ─────────── נקודות איסוף ─────────── */
function Pickup() {
  const { raw, ops, adminData } = useApp();
  const ed = useEdit();
  const [editing, setEditing] = useState(null); // index | 'new'
  const headers = adminData?.info?.pickup?.headers?.filter(Boolean) || [];
  const H = {
    loc: headers.find(h => /נקוד/.test(h)) || headers[0] || 'נקודות_מכירה',
    name: headers.find(h => h === 'שם') || headers[1] || 'שם',
    phone: headers.find(h => /פלאפון|טלפון/.test(h)) || headers[2] || 'מספר_פלאפון',
  };
  const rows = (raw.pickup || []).filter(r => String(r[H.loc] || '').trim());
  const saveAll = async (next, msg) => {
    try { await ops.replaceRows('pickup', next.map(r => { const o = { ...r }; delete o._row; return o; })); ed.showToast(msg); }
    catch (e) { ed.showToast(e.message, 'bad'); }
  };
  const move = (i, d) => { const n = [...rows]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; saveAll(n, 'הסדר עודכן ✓'); };
  return (
    <div>
      <div className="tools">
        <p className="small muted" style={{ flex: 1 }}>הנקודות מופיעות בטופס ההזמנה, בסדר הזה.</p>
        <button className="a-btn amber sm" onClick={() => setEditing('new')}><Plus size={16} /> נקודה</button>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="row">
          <span className="mv">
            <button className="a-icon-btn sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="למעלה"><ChevronUp size={15} /></button>
            <button className="a-icon-btn sm" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="למטה"><ChevronDown size={15} /></button>
          </span>
          <button className="row-main" onClick={() => setEditing(i)}>
            <span className="thumb" style={{ background: 'var(--a-ok-soft)', color: 'var(--a-ok)' }}><MapPin size={22} /></span>
            <span className="grow"><b className="nm">{r[H.loc]}</b><span className="small muted">{[r[H.name], r[H.phone]].filter(Boolean).join(' · ')}</span></span>
            <Pencil size={15} className="muted" />
          </button>
        </div>
      ))}
      {!rows.length && <div className="empty"><MapPin size={40} /><div>אין נקודות איסוף. בטופס יוצג "איסוף מבית שמש".</div></div>}
      {editing !== null && <PickupEditor H={H} row={editing === 'new' ? null : rows[editing]} onClose={() => setEditing(null)}
        onSave={(r) => { const n = [...rows]; if (editing === 'new') n.push(r); else n[editing] = { ...rows[editing], ...r }; return saveAll(n, 'נשמר ✓'); }}
        onDelete={() => saveAll(rows.filter((_, i) => i !== editing), 'הנקודה נמחקה')} />}
    </div>
  );
}

function PickupEditor({ H, row, onClose, onSave, onDelete }) {
  const [f, setF] = useState({ [H.loc]: row?.[H.loc] || '', [H.name]: row?.[H.name] || '', [H.phone]: row?.[H.phone] || '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF(x => ({ ...x, [k]: e.target.value }));
  const save = async () => { if (!f[H.loc].trim()) { setErr('צריך לכתוב את המקום'); return; } setBusy(true); await onSave(f); onClose(); };
  return (
    <Modal title={row ? 'עריכת נקודת איסוף' : 'נקודת איסוף חדשה'} onClose={onClose} footer={<>
      <button className="a-btn primary wide" onClick={save} disabled={busy}>{busy ? <Spinner /> : 'שמירה'}</button>
      {row && <button className="a-btn danger-ghost icon" disabled={busy} onClick={async () => { if (window.confirm('למחוק את הנקודה?')) { setBusy(true); await onDelete(); onClose(); } }} aria-label="מחיקה"><Trash2 size={18} /></button>}
    </>}>
      <Field label="מקום" required><input className="a-input" value={f[H.loc]} onChange={set(H.loc)} placeholder="למשל: אלון שבות" autoFocus /></Field>
      <Field label="שם איש/אשת הקשר"><input className="a-input" value={f[H.name]} onChange={set(H.name)} /></Field>
      <Field label="טלפון"><input className="a-input" dir="ltr" inputMode="tel" value={f[H.phone]} onChange={set(H.phone)} /></Field>
      <ErrorBox message={err} />
    </Modal>
  );
}
