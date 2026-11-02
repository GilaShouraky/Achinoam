import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLOR_KEYS, PRESETS, colorsFrom, applyTheme } from '../lib/theme';
import { Spinner } from '../ui/ui';

/**
 * עריכת צבעי האתר. כל שינוי מוצג מיד (תצוגה מקדימה), ונשמר רק בלחיצה על "שמירה".
 */
export default function ColorsEditor({ onDone, showToast }) {
  const { settings, ops } = useApp();
  const saved = useMemo(() => colorsFrom(settings), [settings]);
  const [draft, setDraft] = useState(saved);
  const [busy, setBusy] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // תצוגה מקדימה חיה על האתר; ביציאה בלי שמירה – חוזרים לשמור
  useEffect(() => {
    const changed = COLOR_KEYS.filter(({ key, def }) => draft[key].toLowerCase() !== def.toLowerCase());
    applyTheme({}, Object.fromEntries(changed.map(({ key }) => [key, draft[key]])));
  }, [draft]);
  useEffect(() => () => applyTheme(settingsRef.current), []);

  const dirty = COLOR_KEYS.filter(({ key }) => draft[key].toLowerCase() !== saved[key].toLowerCase());
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const preset = (p) => setDraft(Object.fromEntries(COLOR_KEYS.map(({ key, def }) => [key, p.c[key] || def])));

  const save = async () => {
    setBusy(true);
    try {
      const toSet = {}, toReset = [];
      COLOR_KEYS.forEach(({ key, def }) => {
        if (draft[key].toLowerCase() === def.toLowerCase()) { if (settings[key] !== undefined) toReset.push(key); }
        else if (draft[key].toLowerCase() !== (settings[key] || '').toLowerCase()) toSet[key] = draft[key];
      });
      if (Object.keys(toSet).length) await ops.saveSettings(toSet);
      if (toReset.length) await ops.resetSettings(toReset);
      showToast?.('הצבעים נשמרו ✓');
      onDone?.();
    } catch (e) { showToast?.(e.message, 'bad'); }
    setBusy(false);
  };

  return (
    <div className="colors-ed">
      <div className="ce-presets">
        <span className="a-label" style={{ width: '100%' }}>ערכות מוכנות</span>
        {PRESETS.map(p => {
          const c = { ...Object.fromEntries(COLOR_KEYS.map(k => [k.key, k.def])), ...p.c };
          return (
            <button key={p.name} type="button" className="ce-preset" onClick={() => preset(p)}>
              <span className="ce-dots">{['color.primary', 'color.accent', 'color.bg', 'color.footer'].map(k => <i key={k} style={{ background: c[k] }} />)}</span>
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="ce-sample" aria-hidden>
        <div className="ce-s-banner">פס עליון</div>
        <div className="ce-s-body">
          <b className="ce-s-title">כותרת באתר</b>
          <span className="ce-s-text">טקסט רגיל ותיאור מוצר</span>
          <span className="ce-s-row"><span className="ce-s-price">₪120</span><span className="ce-s-deal">מבצע! 2 ב־200</span></span>
          <span className="ce-s-btn">להשלמת ההזמנה</span>
        </div>
        <div className="ce-s-footer">פוטר</div>
      </div>

      {COLOR_KEYS.map(({ key, label, help, def }) => (
        <div key={key} className="ce-row">
          <label className="ce-swatch" style={{ background: draft[key] }}>
            <input type="color" value={draft[key]} onChange={(e) => set(key, e.target.value.toUpperCase())} aria-label={label} />
          </label>
          <span className="ce-txt"><b>{label}</b><small>{help}</small></span>
          <input className="a-input ce-hex" dir="ltr" value={draft[key]} maxLength={7}
            onChange={(e) => { const v = e.target.value.trim(); set(key, v.startsWith('#') ? v : '#' + v); }}
            onBlur={(e) => { if (!/^#[0-9a-f]{6}$/i.test(e.target.value)) set(key, saved[key]); }} />
          {draft[key].toLowerCase() !== def.toLowerCase() && <button type="button" className="a-icon-btn sm" title="לצבע המקורי" onClick={() => set(key, def)}><RotateCcw size={14} /></button>}
        </div>
      ))}

      <div className="ce-actions">
        <button type="button" className="a-btn primary wide" onClick={save} disabled={busy || !dirty.length}>{busy ? <Spinner /> : <><Check size={16} /> {dirty.length ? 'שמירת הצבעים' : 'אין שינויים'}</>}</button>
        {dirty.length > 0 && <button type="button" className="a-btn ghost" onClick={() => setDraft(saved)}>ביטול</button>}
      </div>
      <p className="a-hint">השינויים מוצגים מיד (רק אצלך). הגולשים יראו אותם רק אחרי "שמירה".</p>
    </div>
  );
}
