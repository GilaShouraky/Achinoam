import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionHead, parseDate, sameDay, fmtDate, num } from './common';
import { ADMIN_SCRIPT_URL } from '../config';

const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export default function Tracking() {
  const nav = useNavigate();
  const { adminData, raw } = useApp();
  const visits = adminData?.visits || [];
  const views = adminData?.views || [];
  const log = adminData?.log || [];

  const series = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const row = visits.find(v => sameDay(parseDate(v['תאריך']), d));
      out.push({ d, n: row ? num(row['כניסות']) : 0, today: i === 0 });
    }
    return out;
  }, [visits]);
  const sumDays = (n) => {
    const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - (n - 1));
    return visits.reduce((a, v) => { const d = parseDate(v['תאריך']); return d && d >= from ? a + num(v['כניסות']) : a; }, 0);
  };
  const max = Math.max(1, ...series.map(s => s.n));
  const names = Object.fromEntries((raw.products || []).map(r => [String(r['מזהה']), r['שם']]));
  const top = [...views].sort((a, b) => num(b['צפיות']) - num(a['צפיות'])).slice(0, 10);

  return (
    <div>
      <SectionHead title="מעקב" onBack={() => nav('/admin')} />
      <div className="stat3">
        <div><b>{sumDays(1)}</b><span>היום</span></div>
        <div><b>{sumDays(7)}</b><span>7 ימים</span></div>
        <div><b>{sumDays(30)}</b><span>30 יום</span></div>
      </div>
      <div className="box">
        <h4>כניסות לאתר – שבועיים אחרונים</h4>
        <div className="bars" role="img" aria-label="גרף כניסות יומי">
          {series.map((s, i) => (
            <div key={i} className={`b${s.today ? ' today' : ''}`} title={`${s.d.getDate()}/${s.d.getMonth() + 1}: ${s.n}`}>
              {s.n > 0 && <em>{s.n}</em>}
              <i style={{ height: `${(s.n / max) * 100}%` }} />
              <small>{DAYS[s.d.getDay()]}</small>
            </div>
          ))}
        </div>
        {!visits.length && <p className="small muted" style={{ marginTop: 8 }}>{ADMIN_SCRIPT_URL ? 'הספירה מתחילה מהרגע שהסקריפט החדש חובר.' : ''} כניסות שלך (כשאת מחוברת) לא נספרות.</p>}
      </div>
      <div className="box">
        <h4><Eye size={16} /> המוצרים הנצפים ביותר</h4>
        {top.map((v, i) => (
          <div key={i} className="kv"><span>{i + 1}. {names[v['מזהה']] || v['שם'] || v['מזהה']}</span><span style={{ fontWeight: 700 }}>{num(v['צפיות'])}</span></div>
        ))}
        {!top.length && <p className="small muted">עוד אין נתונים.</p>}
      </div>
      <div className="box">
        <h4><History size={16} /> יומן שינויים</h4>
        {log.slice(0, 40).map((l, i) => (
          <div key={i} className="log-row"><small>{fmtDate(parseDate(l['תאריך']))} · {l['פעולה']}</small>{l['פרטים']}</div>
        ))}
        {!log.length && <p className="small muted">כל שינוי שתעשי במערכת יירשם כאן.</p>}
      </div>
    </div>
  );
}
