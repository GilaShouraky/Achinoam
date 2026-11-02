import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/** לשוניות בתוך אזור – נשמרות בכתובת (?tab=) כדי שכפתור "חזרה" יעבוד */
export function useTab(tabs) {
  const [params, setParams] = useSearchParams();
  const cur = tabs.find(t => t === params.get('tab')) || tabs[0];
  return [cur, (t) => setParams({ tab: t }, { replace: true })];
}

export function Seg({ tabs, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}

/** מסך מלא שנפתח מעל הרשימה. Esc / חזרה בדפדפן סוגרים */
export function FullPage({ title, onBack, children, footer, extra }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onBack();
    window.addEventListener('keydown', k);
    // כפתור "חזרה" של הטלפון סוגר את המסך במקום לצאת מהניהול
    window.history.pushState({ fp: 1 }, '');
    const pop = () => onBack();
    window.addEventListener('popstate', pop);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      window.removeEventListener('popstate', pop);
      document.body.style.overflow = prev;
      if (window.history.state?.fp) window.history.back();
    };
  }, []);
  return (
    <div className="fullpage adm" role="dialog">
      <div className="fp-head">
        <button className="a-icon-btn" onClick={onBack} aria-label="חזרה"><ChevronRight size={22} /></button>
        <h2>{title}</h2>
        {extra}
      </div>
      <div className="fp-body"><div className="fp-inner">{children}</div></div>
      {footer && <div className="fp-foot"><div>{footer}</div></div>}
    </div>
  );
}

export function SectionHead({ title, onBack, children }) {
  return (
    <div className="adm-head">
      <button className="a-icon-btn" onClick={onBack} aria-label="חזרה" style={{ width: 38, height: 38 }}><ChevronRight size={22} /></button>
      <div className="grow"><small className="muted small">ניהול</small><h1>{title}</h1></div>
      {children}
    </div>
  );
}

/* ─── תאריכים ─── */
/** מפענח תאריכים בפורמטים שונים שמגיעים מהגיליון */
export function parseDate(s) {
  if (!s) return null;
  const str = String(s).trim();
  let m = str.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(y, Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0));
  }
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0));
  const d = new Date(str);
  return isNaN(d) ? null : d;
}
export const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function fmtDate(d) {
  if (!d) return '';
  const now = new Date();
  const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return `היום ${t}`;
  if (sameDay(d, y)) return `אתמול ${t}`;
  return `${d.getDate()}/${d.getMonth() + 1}${d.getFullYear() !== now.getFullYear() ? '/' + d.getFullYear() : ''}${d.getHours() || d.getMinutes() ? ' ' + t : ''}`;
}

export function greeting() {
  const h = new Date().getHours();
  const day = new Date().getDay();
  if (day === 5 && h >= 12) return 'שבת שלום';
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 18) return 'צהריים טובים';
  return 'ערב טוב';
}

/* ─── הזמנות ─── */
// הסקריפט הישן כותב את ההזמנות לגיליון – לא ידוע בדיוק באילו שמות עמודות, אז מזהים לפי מילים
const FIELD_HINTS = {
  name: [/^שם( מלא)?$/, /^name$/i, /שם הלקוח/, /שם/],
  phone: [/טלפון|פלאפון|נייד/, /^phone$/i],
  email: [/מייל|email|אימייל/i],
  total: [/סה"?כ|סכום|total|לתשלום/i],
  date: [/תאריך|זמן|timestamp|date|time/i],
  items: [/^(פריטים|מוצרים|items(list)?)$/i, /^(?!.*(כמות|count)).*(פריטים|מוצרים|items)/i],
  delivery: [/קבלה|משלוח|איסוף|delivery/i],
  receipt: [/אסמכתא|receipt|קבלה/i],
  payment: [/תשלום|payment/i],
  notes: [/הערות|notes/i],
  id: [/מספר הזמנה|^id$|מזהה/i],
};
export function orderFields(headers) {
  const out = {};
  const used = new Set();
  Object.entries(FIELD_HINTS).forEach(([k, pats]) => {
    for (const p of pats) {
      const h = headers.find(x => !used.has(x) && p.test(x) && !/סטטוס|הערה פנימית/.test(x) && !(k === 'name' && /משלוח|delivery/i.test(x)));
      if (h) { out[k] = h; used.add(h); break; }
    }
  });
  return out;
}

export const STATUSES = [
  { v: 'חדשה', cls: 'st-new' },
  { v: 'בטיפול', cls: 'st-work' },
  { v: 'מוכנה', cls: 'st-ready' },
  { v: 'נמסרה', cls: 'st-done' },
  { v: 'בוטלה', cls: 'st-cancel' },
];
const LEGACY = { 'ממתינה': 'חדשה', 'נשלחה': 'נמסרה' };
export const statusOf = (o) => { const s = String(o['סטטוס'] || '').trim(); return LEGACY[s] || s || 'חדשה'; };
export const statusCls = (s) => STATUSES.find(x => x.v === s)?.cls || 'st-new';
export const isOpen = (s) => s === 'חדשה' || s === 'בטיפול' || s === 'מוכנה';
export const money = (n) => `₪${Math.round(Number(n) || 0).toLocaleString('he-IL')}`;
export const num = (s) => Number(String(s ?? '').replace(/[^\d.-]/g, '')) || 0;

/** מספר טלפון ישראלי → קישור וואטסאפ */
export function waLink(phone, text = '') {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '972' + d.slice(1);
  if (!d) return null;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
