import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PencilLine, Check, X, List, LayoutDashboard, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEdit } from './EditContext';
import { textEntry } from '../lib/texts';
import { Toast, Modal } from '../ui/ui';
import ColorsEditor from './ColorsEditor';
import { TextEditorModal, ImageEditorModal } from './EditorModals';
import './edit.css';

const PAGES = [
  ['/', 'דף הבית'], ['/products/', 'מוצרים'], ['/cart', 'סל קניות'],
];

function ago(at) {
  const s = Math.round((Date.now() - at) / 1000);
  if (s < 60) return 'עכשיו';
  if (s < 3600) return `לפני ${Math.round(s / 60)} דק׳`;
  return `לפני ${Math.round(s / 3600)} שע׳`;
}

/** כל מה שמופיע על האתר עבור המנהלת: כפתור צף, פס/לוח עריכה, חלונות העריכה */
export default function EditLayer() {
  const ed = useEdit();
  const { admin, live } = useApp();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState(false);
  if (!admin || loc.pathname.startsWith('/admin')) return <>{ed && <Toast toast={ed.toast} />}</>;

  if (!ed.editMode) {
    return (
      <>
        <div className="adm-fab-wrap">
          <button className="adm-fab-btn edit" onClick={() => ed.setEditMode(true)}><PencilLine size={17} /> עריכה</button>
          <Link className="adm-fab-btn" to="/admin" aria-label="ניהול"><LayoutDashboard size={17} /></Link>
        </div>
        <Toast toast={ed.toast} />
      </>
    );
  }

  return (
    <>
      <aside className={`edit-panel${open ? ' open' : ''}`} aria-label="מצב עריכה">
        <div className="ep-bar">
          <PencilLine size={20} />
          <span className="ep-grow"><b>מצב עריכה</b><small>לוחצים על כל דבר מסומן כדי לשנות</small></span>
          <button className="ep-more" onClick={() => setColors(true)} aria-label="צבעים"><Palette size={17} /></button>
          <button className="ep-more" onClick={() => setOpen(!open)} aria-label="עוד">{open ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
          <button className="ep-done" onClick={() => ed.setEditMode(false)}><Check size={15} /> סיום</button>
          <button className="ep-close" onClick={() => ed.setEditMode(false)} aria-label="סגירה"><X size={20} /></button>
        </div>
        <div className="ep-body">
          <div className="ep-legend">
            <span><i className="lg-edit" />אפשר לערוך – לוחצים</span>
            <span><i className="lg-changed" />שונה מהנוסח המקורי</span>
          </div>
          {!live && <p className="ep-warn">הנתונים לא נטענו ישירות מהגיליון. רענני את הדף.</p>}
          <button className="a-btn ghost" style={{ width: '100%', marginTop: 10 }} onClick={() => setColors(true)}><Palette size={16} /> צבעי האתר</button>
          <div className="ep-h">מעבר לעמוד</div>
          <div className="ep-chips">
            {PAGES.map(([p, l]) => <button key={p} className={loc.pathname === p ? 'on' : ''} onClick={() => nav(p)}>{l}</button>)}
          </div>
          <div className="ep-h">שינויים אחרונים</div>
          {ed.recent.length === 0 && <p className="ep-muted">עוד לא שינית כלום בכניסה הזו.</p>}
          {ed.recent.map((r) => {
            const e = textEntry(r.key);
            return (
              <button key={r.key} className="ep-recent" onClick={() => (e?.kind === 'image' ? ed.openImage(r.key) : ed.openText(r.key))}>
                <small>{e ? `${e.group} · ${e.label}` : r.key} · {ago(r.at)}</small>
                <span>{e?.kind === 'image' ? 'תמונה חדשה' : (r.value || '(מוסתר)')}</span>
              </button>
            );
          })}
          <p className="ep-muted" style={{ marginTop: 14 }}>כל שינוי נשמר מיד בגוגל שיטס ומופיע לכל הגולשים תוך כמה דקות.</p>
          <div className="ep-actions">
            <Link className="a-btn ghost wide" to="/admin/site"><List size={16} /> כל הטקסטים</Link>
            <button className="a-btn primary wide" onClick={() => ed.setEditMode(false)}><Check size={16} /> סיום</button>
          </div>
        </div>
      </aside>
      <TextEditorModal />
      <ImageEditorModal />
      {colors && <Modal title="צבעי האתר" onClose={() => setColors(false)}><ColorsEditor onDone={() => setColors(false)} showToast={ed.showToast} /></Modal>}
      <Toast toast={ed.toast} />
    </>
  );
}
