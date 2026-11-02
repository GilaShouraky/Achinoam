import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Package, PencilLine, ShoppingBag, Sheet, Activity, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { allTexts } from '../lib/texts';
import { rowToProduct, rowToCategory } from '../data/siteContent';
import { missingFields } from './catalog/missing';
import { greeting, parseDate, sameDay, statusOf, isOpen, money, num, orderFields } from './common';

export default function AdminHome() {
  const { raw, adminData, settings } = useApp();
  const nav = useNavigate();

  const s = useMemo(() => {
    const products = (raw.products || []).filter(r => r['שם']).map(rowToProduct);
    const cats = (raw.categories || []).map(rowToCategory).filter(c => c.key.startsWith('subcat_'));
    const orders = adminData?.orders || [];
    const f = orderFields(adminData?.info?.orders?.headers || Object.keys(orders[0] || {}));
    const now = new Date();
    const today = orders.filter(o => sameDay(parseDate(o[f.date]), now));
    const month = orders.filter(o => { const d = parseDate(o[f.date]); return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && statusOf(o) !== 'בוטלה'; });
    const visits = adminData?.visits || [];
    const vToday = visits.find(v => sameDay(parseDate(v['תאריך']), now));
    const texts = allTexts().filter(e => !['color', 'toggle'].includes(e.kind) && settings[e.key] !== undefined && settings[e.key] !== e.def).length;
    const info = adminData?.info || {};
    const broken = Object.entries(info).filter(([k, v]) => !v.ok && !['graphics', 'workshops'].includes(k)).map(([k]) => k);
    const catIds = cats.map(c => c.id);
    const missing = (raw.products || []).filter(r => r['שם'] && missingFields(r, catIds).length).length;
    return {
      missing,
      products: products.length,
      out: products.filter(p => p.stock !== null && p.stock <= 0 && !p.hidden).length,
      low: products.filter(p => p.stock !== null && p.stock > 0 && p.stock <= 3 && !p.hidden).length,
      noImgCats: cats.filter(c => !c.image && !c.hidden).length,
      newOrders: orders.filter(o => statusOf(o) === 'חדשה').length,
      openOrders: orders.filter(o => isOpen(statusOf(o))).length,
      today: today.length,
      revenue: month.reduce((a, o) => a + num(o[f.total]), 0),
      visitsToday: vToday ? num(vToday['כניסות']) : 0,
      texts, broken,
    };
  }, [raw, adminData, settings]);

  const cards = [
    { to: 'catalog', c: '#8B5A6B', icon: Package, title: 'קטלוג', sub: 'קטגוריות, מוצרים ומבצעים', pills: [
      [`${s.products} מוצרים`, 'info'],
      s.missing && [`${s.missing} מוצרים חסרי פרטים`, 'bad'],
      s.out && [`${s.out} אזלו מהמלאי`, 'bad'],
      s.low && [`${s.low} כמעט אזלו`, 'warn'],
      s.noImgCats && [`${s.noImgCats} קטגוריות בלי תמונה`, 'warn'],
    ] },
    { to: 'site', c: '#C4861A', icon: PencilLine, title: 'עריכת האתר', sub: 'כל הטקסטים, התמונות, פרטי הקשר והתשלום', pills: [s.texts && [`${s.texts} טקסטים שונו`, 'ok']] },
    { to: 'orders', c: '#5B8FA8', icon: ShoppingBag, title: 'הזמנות', sub: 'מעקב, סטטוס ונקודות איסוף', pills: [
      s.newOrders && [`${s.newOrders} חדשות`, 'bad'],
      s.openOrders - s.newOrders > 0 && [`${s.openOrders - s.newOrders} בטיפול`, 'warn'],
    ] },
    { to: 'sheets', c: '#2E7D4F', icon: Sheet, title: 'חיבור לגוגל שיטס', sub: 'הגיליונות שמהם האתר נטען', pills: [s.broken.length ? [`${s.broken.length} לשוניות לא נמצאו`, 'bad'] : ['הכול מחובר', 'ok']] },
    { to: 'tracking', c: '#7A6A9E', icon: Activity, title: 'מעקב', sub: 'כניסות, מוצרים נצפים ויומן שינויים' },
  ];

  return (
    <div>
      <h1 className="adm-title"><Sparkles size={22} /> {greeting()}, אחינועם</h1>
      <div className="adm-strip" onClick={() => nav('/admin/orders')} role="button">
        <span><b>{s.visitsToday}</b>כניסות היום</span>
        <span><b>{s.today}</b>הזמנות היום</span>
        <span className={s.openOrders ? 'hot' : ''}><b>{s.openOrders}</b>פתוחות</span>
        <span><b>{money(s.revenue)}</b>החודש</span>
      </div>
      <div className="adm-cards">
        {cards.map(c => (
          <div key={c.to} className="adm-card" style={{ '--c': c.c }} onClick={() => nav(`/admin/${c.to}`)} role="link">
            <span className="ic"><c.icon size={22} /></span>
            <span className="grow">
              <b>{c.title}</b>
              <span className="small muted">{c.sub}</span>
              {c.pills?.some(Boolean) && <span className="pills">{c.pills.filter(Boolean).map(([t, tone]) => <i key={t} className={`pill ${tone}`}>{t}</i>)}</span>}
            </span>
            <ChevronLeft size={18} className="muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
