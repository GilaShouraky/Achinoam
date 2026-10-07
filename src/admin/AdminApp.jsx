import React, { useState } from 'react';
import { Routes, Route, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PencilLine, ShoppingBag, Globe, Eye, RefreshCw, LogOut, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEdit } from '../edit/EditContext';
import { adminConfigured } from '../lib/api';
import { Spinner, ErrorBox, Toast } from '../ui/ui';
import { TextEditorModal, ImageEditorModal } from '../edit/EditorModals';
import AdminHome from './AdminHome';
import Catalog from './catalog/Catalog';
import Orders from './orders/Orders';
import SiteEdit from './site/SiteEdit';
import Connections from './Connections';
import Tracking from './Tracking';
import '../ui/ui.css';
import './admin.css';

const TITLES = { '': 'ממשק ניהול', catalog: 'קטלוג', orders: 'הזמנות', site: 'עריכת האתר', sheets: 'חיבור לגוגל שיטס', tracking: 'מעקב' };

export default function AdminApp() {
  const { admin } = useApp();
  if (!adminConfigured()) return <Setup />;
  if (!admin) return <Login />;
  return <Shell />;
}

function Shell() {
  const { reload, logout } = useApp();
  const ed = useEdit();
  const nav = useNavigate();
  const loc = useLocation();
  const [busy, setBusy] = useState(false);
  const sec = loc.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const refresh = async () => { setBusy(true); const ok = await reload({ quiet: true }); setBusy(false); ed.showToast(ok ? 'הנתונים עודכנו מהגיליון' : 'לא הצלחתי לטעון מהגיליון', ok ? 'ok' : 'bad'); };
  const goEdit = () => { ed.setEditMode(true); nav('/'); };

  return (
    <div className="adm">
      <header className="adm-top">
        <div><div className="adm-brand">אחינועם</div><div className="adm-sub">{TITLES[sec] ?? 'ממשק ניהול'}</div></div>
        <span className="grow" />
        <Link className="adm-tb" to="/" title="לאתר"><Eye size={18} /></Link>
        <button className="adm-tb" onClick={refresh} title="טעינה מחדש מהגיליון">{busy ? <Spinner size={17} /> : <RefreshCw size={17} />}</button>
        <button className="adm-tb" onClick={() => { if (window.confirm('לצאת ממערכת הניהול במכשיר הזה?')) { logout(); nav('/'); } }} title="יציאה"><LogOut size={17} /></button>
      </header>
      <main className="adm-body">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="orders" element={<Orders />} />
          <Route path="site" element={<SiteEdit />} />
          <Route path="sheets" element={<Connections />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="*" element={<AdminHome />} />
        </Routes>
      </main>
      <nav className="adm-nav">
        <NavLink end to="/admin" className={({ isActive }) => (isActive ? 'on' : '')}><LayoutDashboard size={21} />בית</NavLink>
        <NavLink to="/admin/catalog" className={({ isActive }) => (isActive ? 'on' : '')}><Package size={21} />קטלוג</NavLink>
        <div><button className="adm-fab" onClick={goEdit} aria-label="עריכה על האתר"><PencilLine size={22} /></button><span className="adm-fab-l">עריכה באתר</span></div>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'on' : '')}><ShoppingBag size={21} />הזמנות</NavLink>
        <NavLink to="/admin/site" className={({ isActive }) => (isActive ? 'on' : '')}><Globe size={21} />טקסטים</NavLink>
      </nav>
      <TextEditorModal />
      <ImageEditorModal />
      <Toast toast={ed.toast} />
    </div>
  );
}

function Login() {
  const { login, loadError } = useApp();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true); setErr(null);
    try { await login(pw); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <div className="adm login">
      <form className="login-card" onSubmit={submit}>
        <div className="adm-brand">אחינועם</div>
        <p className="muted" style={{ marginBottom: 22 }}>ממשק ניהול</p>
        <Lock size={38} color="#8B5A6B" style={{ marginBottom: 16 }} />
        <input className="a-input" type="password" placeholder="סיסמה" value={pw} onChange={e => setPw(e.target.value)} autoFocus autoComplete="current-password" />
        <ErrorBox message={err || (loadError && !pw ? loadError : null)} />
        <button className="a-btn primary" style={{ width: '100%', marginTop: 12 }} disabled={busy}>{busy ? <Spinner /> : 'כניסה'}</button>
        <p className="small muted" style={{ marginTop: 14 }}>אחרי הכניסה המכשיר הזה יזכור אותך, ותוכלי לערוך ישירות על האתר.</p>
        <Link to="/" className="small" style={{ color: '#8B5A6B', display: 'inline-block', marginTop: 10 }}>← חזרה לאתר</Link>
      </form>
    </div>
  );
}

function Setup() {
  return (
    <div className="adm">
      <header className="adm-top"><div><div className="adm-brand">אחינועם</div><div className="adm-sub">חיבור מערכת הניהול</div></div></header>
      <div className="setup">
        <h1 className="adm-title">עוד צעד אחד וזה עובד ✨</h1>
        <div className="a-alert warn"><div>מערכת הניהול עדיין לא מחוברת לגיליון. החיבור לוקח בערך 10 דקות, פעם אחת בלבד.</div></div>
        <ol>
          <li>נכנסים ל־<b>script.google.com</b> ← <b>פרויקט חדש</b>.</li>
          <li>מוחקים את מה שכתוב, ומדביקים את כל התוכן של הקובץ <code>google-apps-script/admin.gs</code>.</li>
          <li>בשורות הראשונות ממלאים את <code>SPREADSHEET_ID</code> (מהכתובת של הגיליון) ואת <code>ADMIN_PASSWORD</code>.</li>
          <li>שומרים, בוחרים בפונקציה <b>test</b> ולוחצים <b>הפעלה</b> – ומאשרים את ההרשאות.</li>
          <li><b>פריסה</b> ← <b>פריסה חדשה</b> ← סוג: <b>אפליקציית אינטרנט</b>. הפעלה בתור: <b>אני</b>. גישה: <b>כל אחד</b>.</li>
          <li>מעתיקים את הכתובת שמתקבלת ומדביקים אותה בקובץ <code>src/config.js</code> בשורה <code>ADMIN_SCRIPT_URL</code>, ומעלים את האתר מחדש.</li>
        </ol>
        <p className="muted" style={{ marginTop: 12 }}>ההסבר המלא, צעד אחרי צעד, נמצא בקובץ "מדריך התקנה" שמצורף לפרויקט.</p>
        <Link to="/" className="a-btn ghost" style={{ marginTop: 16 }}>חזרה לאתר</Link>
      </div>
    </div>
  );
}
