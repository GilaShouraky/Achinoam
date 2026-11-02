import React, { useState } from 'react';
import { Pencil, ChevronUp, ChevronDown, Eye, EyeOff, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useEdit } from '../../edit/EditContext';
import CategoryEditor from './CategoryEditor';

/** כלי עריכה על כרטיס קטגוריה בדף הבית (במצב עריכה) */
export default function HomeCategoryTools({ cat }) {
  const { site, ops, products, cols } = useApp();
  const ed = useEdit();
  const [open, setOpen] = useState(false);
  const all = site.allCats;
  const i = all.findIndex(c => c.key === cat.key);
  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
  const run = async (fn, ok) => { try { await fn(); ed.showToast(ok); } catch (e) { ed.showToast(e.message, 'bad'); } };

  const move = (d) => {
    const ids = all.map(c => c.key);
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run(() => ops.reorder('categories', ids), 'הסדר עודכן ✓');
  };
  const toggle = () => run(() => ops.saveRow('categories', { [cols.categories.id]: cat.key, 'מוצג': cat.hidden ? '' : 'לא' }), cat.hidden ? 'הקטגוריה מוצגת ✓' : 'הקטגוריה הוסתרה');

  const has = products.some(p => p.category === cat.id);
  const why = cat.hidden ? 'מוסתרת' : !cat.image ? 'חסרה תמונה – לא מוצגת' : !has ? 'אין מוצרים – לא מוצגת' : null;
  return (
    <>
      <div className="card-tools">
        <button className="lbl" onClickCapture={stop(() => setOpen(true))}><Pencil size={13} /> עריכה</button>
        <button onClickCapture={stop(() => move(-1))} disabled={i <= 0} aria-label="להקדים"><ChevronUp size={16} /></button>
        <button onClickCapture={stop(() => move(1))} disabled={i >= all.length - 1} aria-label="לאחר"><ChevronDown size={16} /></button>
        <button onClickCapture={stop(toggle)} aria-label={cat.hidden ? 'הצגה' : 'הסתרה'}>{cat.hidden ? <Eye size={16} /> : <EyeOff size={16} />}</button>
      </div>
      {why && <span className="card-hidden-badge">{why}</span>}
      {open && <CategoryEditor cat={cat} onClose={() => setOpen(false)} onSaved={() => ed.showToast('נשמר ✓')} />}
    </>
  );
}

HomeCategoryTools.Add = function AddCategory() {
  const ed = useEdit();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="add-card" onClick={() => setOpen(true)}><Plus size={18} /> קטגוריה חדשה</button>
      {open && <CategoryEditor cat={null} onClose={() => setOpen(false)} onSaved={() => ed.showToast('הקטגוריה נוספה ✓')} />}
    </>
  );
};
