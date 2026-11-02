import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, PencilLine, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useEdit } from '../../edit/EditContext';
import { allTexts, textEntry } from '../../lib/texts';
import { Field, Spinner, Switch } from '../../ui/ui';
import ColorsEditor from '../../edit/ColorsEditor';
import { SectionHead, Seg, useTab } from '../common';

const FORM_GROUPS = { contact: 'פרטי קשר', pay: 'תשלום' };
const IMG_GROUP = 'תמונות ולוגו';

export default function SiteEdit() {
  const nav = useNavigate();
  const [tab, setTab] = useTab(['texts', 'design', 'images', 'contact', 'pay']);
  return (
    <div>
      <SectionHead title="עריכת האתר" onBack={() => nav('/admin')} />
      <Seg tabs={[['texts', 'טקסטים'], ['design', 'עיצוב'], ['images', 'תמונות'], ['contact', 'פרטי קשר'], ['pay', 'תשלום']]} value={tab} onChange={setTab} />
      {tab === 'texts' && <TextsList />}
      {tab === 'design' && <Design />}
      {tab === 'images' && <Images />}
      {tab === 'contact' && <GroupForm group={FORM_GROUPS.contact} />}
      {tab === 'pay' && <GroupForm group={FORM_GROUPS.pay} />}
    </div>
  );
}

function EditOnSite() {
  const ed = useEdit();
  const nav = useNavigate();
  return (
    <div className="callout">
      <span>הכי נוח: לערוך ישירות על האתר עצמו – לוחצים על כל מילה.</span>
      <button className="a-btn amber sm" onClick={() => { ed.setEditMode(true); nav('/'); }}><PencilLine size={15} /> לעריכה על האתר</button>
    </div>
  );
}

/** הרשימה המרכזית של כל הטקסטים, לפי עמודים */
function TextsList() {
  const { settings } = useApp();
  const ed = useEdit();
  const [q, setQ] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);
  const all = allTexts().filter(e => !['image', 'color', 'toggle'].includes(e.kind));
  const term = q.trim();
  const isChanged = (e) => settings[e.key] !== undefined && settings[e.key] !== e.def;
  const groups = useMemo(() => {
    const m = new Map();
    for (const e of all) {
      const val = settings[e.key] ?? e.def;
      if (onlyChanged && !isChanged(e)) continue;
      if (term && ![val, e.def, e.label, e.group].some(x => String(x).includes(term))) continue;
      if (!m.has(e.group)) m.set(e.group, []);
      m.get(e.group).push(e);
    }
    return [...m.entries()];
  }, [all, settings, onlyChanged, term]);
  const changedCount = all.filter(isChanged).length;

  return (
    <div>
      <EditOnSite />
      <div className="tools"><label className="search"><Search size={18} /><input type="search" placeholder="חיפוש טקסט… (למשל: משלוח)" value={q} onChange={e => setQ(e.target.value)} /></label></div>
      <label className="chk"><input type="checkbox" checked={onlyChanged} onChange={e => setOnlyChanged(e.target.checked)} /> רק מה ששיניתי ({changedCount})</label>
      {groups.map(([g, items], gi) => (
        <details key={g} className="txg" open={!!term || onlyChanged || gi === 0}>
          <summary><b>{g}</b>{items.some(isChanged) && <span className="dot" title="יש טקסטים ששונו" />}<span className="small muted">{items.length}</span><ChevronDown size={16} className="muted" /></summary>
          {items.map(e => {
            const val = settings[e.key] ?? e.def;
            return (
              <button key={e.key} className="txr" onClick={() => ed.openText(e.key)}>
                <span className="l">{e.label}{isChanged(e) && <span className="badge b-ok">שונה</span>}</span>
                <span className={`v${val ? '' : ' blank'}`}>{val || '(מוסתר / ריק)'}</span>
              </button>
            );
          })}
        </details>
      ))}
      {!groups.length && <div className="empty">לא נמצאו טקסטים</div>}
    </div>
  );
}

function Images() {
  const { settings, site } = useApp();
  const ed = useEdit();
  const imgs = allTexts().filter(e => e.group === IMG_GROUP);
  return (
    <div>
      <EditOnSite />
      <div className="img-grid">
        {imgs.map(e => {
          const v = settings[e.key] ?? e.def;
          return (
            <button key={e.key} className="img-card" onClick={() => ed.openImage(e.key)}>
              <div className="p">{v ? <img src={v} alt="" /> : 'אין תמונה'}</div>
              <span>{e.label}</span>
            </button>
          );
        })}
      </div>
      <div className="grp-h">תמונות הקטגוריות</div>
      <p className="small muted">את תמונות הקטגוריות והמוצרים מחליפים ב<Link to="/admin/catalog?tab=categories" style={{ color: 'var(--a-rose)', fontWeight: 700 }}>קטלוג</Link> ({site.allCats.length} קטגוריות).</p>
    </div>
  );
}

/** טופס לקבוצת הגדרות (פרטי קשר / תשלום) – שמירה של הכול ביחד */
function GroupForm({ group }) {
  const { settings, ops } = useApp();
  const ed = useEdit();
  const items = allTexts().filter(e => e.group === group);
  const initial = useMemo(() => Object.fromEntries(items.map(e => [e.key, settings[e.key] ?? e.def])), [settings]);
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = items.filter(e => (f[e.key] ?? '') !== (initial[e.key] ?? ''));
  const save = async () => {
    setBusy(true);
    try {
      const toSet = {}, toReset = [];
      dirty.forEach(e => { if (f[e.key] === e.def) toReset.push(e.key); else toSet[e.key] = f[e.key] === '' ? '(ריק)' : f[e.key]; });
      if (Object.keys(toSet).length) await ops.saveSettings(toSet);
      if (toReset.length) await ops.resetSettings(toReset);
      ed.showToast('נשמר ✓');
    } catch (x) { ed.showToast(x.message, 'bad'); }
    setBusy(false);
  };
  return (
    <div>
      {items.map(e => {
        const ltr = ['phone', 'link', 'number', 'email'].includes(e.kind);
        const ch = settings[e.key] !== undefined && settings[e.key] !== e.def;
        return (
          <Field key={e.key} label={<>{e.label}{ch && <span className="badge b-ok" style={{ marginInlineStart: 6 }}>שונה</span>}</>} hint={e.help || (e.vars?.length ? `אפשר לשלב: ${e.vars.map(v => `{${v}}`).join(' ')}` : null)}>
            {e.multiline || e.rich
              ? <textarea className="a-textarea" rows={e.rich ? 7 : 3} value={f[e.key] ?? ''} onChange={x => setF(s => ({ ...s, [e.key]: x.target.value }))} />
              : <input className="a-input" dir={ltr ? 'ltr' : 'rtl'} value={f[e.key] ?? ''} onChange={x => setF(s => ({ ...s, [e.key]: x.target.value }))} />}
            {ch && <button type="button" className="a-btn plain sm" style={{ marginTop: 4, paddingInline: 0 }} onClick={(x) => { x.preventDefault(); setF(s => ({ ...s, [e.key]: textEntry(e.key).def })); }}><RotateCcw size={13} /> למקור</button>}
          </Field>
        );
      })}
      <div style={{ position: 'sticky', bottom: 76, paddingTop: 8 }}>
        <button className="a-btn primary" style={{ width: '100%' }} onClick={save} disabled={busy || !dirty.length}>{busy ? <Spinner /> : <><Check size={17} /> {dirty.length ? `שמירת ${dirty.length} שינויים` : 'אין שינויים לשמירה'}</>}</button>
      </div>
    </div>
  );
}

/** עיצוב: אזורים בדף הבית + צבעים */
function Design() {
  const { settings, ops } = useApp();
  const ed = useEdit();
  const toggles = allTexts().filter(e => e.kind === 'toggle');
  const flip = async (e, on) => {
    try { if (on) await ops.resetSettings([e.key]); else await ops.saveSettings({ [e.key]: 'לא' }); ed.showToast(on ? 'מוצג ✓' : 'הוסתר'); }
    catch (x) { ed.showToast(x.message, 'bad'); }
  };
  return (
    <div>
      <div className="box">
        <h4>אזורים בדף הבית</h4>
        {toggles.map(e => (
          <div key={e.key} className="tg"><span>{e.label}</span><Switch checked={settings[e.key] !== 'לא'} onChange={(v) => flip(e, v)} /></div>
        ))}
      </div>
      <div className="box">
        <h4>צבעי האתר</h4>
        <p className="a-hint" style={{ marginTop: 0 }}>כדי לראות את הצבעים על האתר עצמו: "עריכה באתר" ← "צבעי האתר".</p>
        <ColorsEditor showToast={ed.showToast} />
      </div>
    </div>
  );
}
