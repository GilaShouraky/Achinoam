import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, ExternalLink, RefreshCw, Globe, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEdit } from '../edit/EditContext';
import { SectionHead, fmtDate } from './common';
import { Spinner } from '../ui/ui';
import { csvUrl } from '../data/siteContent';
import { GIDS } from '../config';

const LABELS = {
  settings: ['הגדרות וטקסטים', 'כל הטקסטים, התמונות ופרטי הקשר'],
  products: ['מוצרים', 'המוצרים שבאתר'],
  categories: ['קטגוריות', 'הקולקציות בדף הבית'],
  pickup: ['נקודות איסוף', 'בטופס ההזמנה'],
  orders: ['הזמנות', 'נכתבות מהאתר – לא צריך לפרסם'],
};

export default function Connections() {
  const nav = useNavigate();
  const { adminData, reload } = useApp();
  const ed = useEdit();
  const [pub, setPub] = useState({}); // האם כל לשונית פורסמה לאינטרנט (בשביל הגולשים)
  const [busy, setBusy] = useState(false);
  const info = adminData?.info || {};

  useEffect(() => {
    let alive = true;
    Object.entries(GIDS).forEach(async ([k, gid]) => {
      try {
        const r = await fetch(csvUrl(gid) + `&t=${Date.now()}`);
        const txt = await r.text();
        if (alive) setPub(p => ({ ...p, [k]: r.ok && !txt.trim().startsWith('<') }));
      } catch { if (alive) setPub(p => ({ ...p, [k]: null })); }
    });
    return () => { alive = false; };
  }, []);

  const keys = Object.keys(LABELS);
  const broken = keys.filter(k => info[k] && !info[k].ok);
  const unpublished = Object.keys(GIDS).filter(k => pub[k] === false);
  const tone = broken.length ? 'bad' : unpublished.length ? 'warn' : 'ok';
  const refresh = async () => { setBusy(true); const ok = await reload({ quiet: true }); setBusy(false); ed.showToast(ok ? 'נטען מחדש ✓' : 'הטעינה נכשלה', ok ? 'ok' : 'bad'); };

  return (
    <div>
      <SectionHead title="חיבור לגוגל שיטס" onBack={() => nav('/admin')} />
      <div className={`status ${tone}`}>
        <span className={`stdot ${tone === 'ok' ? '' : tone}`} />
        <span style={{ flex: 1 }}>{tone === 'ok' ? 'הכול מחובר ומתעדכן' : broken.length ? `${broken.length} לשוניות לא נמצאו בגיליון` : `${unpublished.length} לשוניות לא מפורסמות לאינטרנט`}</span>
        <span className="small" style={{ fontWeight: 400 }}>{adminData?.at ? fmtDate(new Date(adminData.at)) : ''}</span>
      </div>
      <details className="how">
        <summary>איך זה עובד?</summary>
        <p style={{ marginTop: 6 }}>האתר נטען מהגיליון <b>{adminData?.spreadsheetName || ''}</b>. כל שינוי שעושים כאן נכתב ישר לגיליון, וכל שינוי שעושים בגיליון מופיע כאן מיד.</p>
        <p>הגולשים רואים את הגרסה ש"פורסמה לאינטרנט" – גוגל מעדכן אותה לבד, בדרך כלל תוך כמה דקות.</p>
        <p>את הלשונית <b>הזמנות</b> עדיף <b>לא</b> לפרסם – יש בה פרטים אישיים של לקוחות, ומערכת הניהול קוראת אותה בלי פרסום.</p>
      </details>
      {keys.map(k => {
        const i = info[k];
        const p = pub[k];
        const ok = i?.ok;
        return (
          <div key={k} className="conn">
            <div className="h">
              <span className={`stdot ${!i ? 'idle' : !ok ? 'bad' : p === false ? 'warn' : ''}`} />
              <b>{LABELS[k][0]}</b>
              <Sheet size={16} color="#1E8E3E" />
            </div>
            <p>{!i ? '…' : !ok ? i.error : `${i.rows} שורות · לשונית "${i.name}"`}</p>
            {k in GIDS && <p>{p === undefined ? 'בודקת פרסום…' : p ? <><Globe size={12} style={{ verticalAlign: -1 }} /> מפורסם לאתר ✓</> : p === false ? <span style={{ color: 'var(--a-amber-d)' }}>לא מפורסם – הגולשים לא יראו שינויים (קובץ ← שיתוף ← פרסום באינטרנט)</span> : 'לא ניתן לבדוק כרגע'}</p>}
            {k === 'orders' && <p><Lock size={12} style={{ verticalAlign: -1 }} /> נקרא רק דרך מערכת הניהול</p>}
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {adminData?.spreadsheetUrl && <a className="a-btn ghost wide" href={adminData.spreadsheetUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> פתיחת הגיליון</a>}
        <button className="a-btn ghost wide" onClick={refresh} disabled={busy}>{busy ? <Spinner /> : <RefreshCw size={16} />} טעינה מחדש</button>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>גרסת הסקריפט: {adminData?.version || '?'}</p>
    </div>
  );
}
