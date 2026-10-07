import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { textEntry } from '../lib/texts';
import { EMPTY_MARK } from '../data/siteContent';

const Ctx = createContext(null);
const MODE_KEY = 'ach_edit_mode';

/** מצב עריכה על האתר עצמו: טקסטים ותמונות */
export function EditProvider({ children }) {
  const { admin, settings, ops } = useApp();
  const [editMode, setEditModeRaw] = useState(() => { try { return sessionStorage.getItem(MODE_KEY) === '1'; } catch { return false; } });
  const [editing, setEditing] = useState(null);     // { key, kind: 'text' | 'image' }
  const [recent, setRecent] = useState([]);          // שינויים אחרונים בסשן
  const [toast, setToast] = useState(null);

  const setEditMode = useCallback((v) => {
    setEditModeRaw(v);
    try { sessionStorage.setItem(MODE_KEY, v ? '1' : ''); } catch { /* */ }
  }, []);
  useEffect(() => { if (!admin && editMode) setEditMode(false); }, [admin, editMode, setEditMode]);
  useEffect(() => {
    document.body.classList.toggle('edit-mode-on', !!(editMode && admin));
  }, [editMode, admin]);

  const showToast = useCallback((msg, tone = 'ok') => {
    setToast({ msg, tone, id: Date.now() });
    setTimeout(() => setToast(t => (t && Date.now() - t.id > 2400 ? null : t)), 2600);
  }, []);

  const remember = (key, value) => setRecent(r => [{ key, value, at: Date.now() }, ...r.filter(x => x.key !== key)].slice(0, 8));

  const save = useCallback(async (key, value) => {
    const e = textEntry(key);
    // חזרה בדיוק לנוסח המקורי = מחיקת השורה מהגיליון
    if (e && value === e.def && settings[key] !== undefined) { await ops.resetSettings([key]); remember(key, value); return; }
    if (e && value === e.def) return;
    await ops.saveSettings({ [key]: value === '' ? EMPTY_MARK : value });
    remember(key, value);
  }, [ops, settings]);

  const reset = useCallback(async (key) => {
    await ops.resetSettings([key]);
    remember(key, textEntry(key)?.def ?? '');
  }, [ops]);

  const value = useMemo(() => ({
    editMode: editMode && admin, setEditMode, canEdit: admin,
    editing, openText: (key) => setEditing({ key, kind: 'text' }), openImage: (key, opts = {}) => setEditing({ key, kind: 'image', ...opts }),
    close: () => setEditing(null), save, reset, recent, toast, showToast,
  }), [editMode, admin, setEditMode, editing, save, reset, recent, toast, showToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useEdit = () => useContext(Ctx);

/** תצוגה מקדימה: מציג רכיבים של האתר בלי מסגרות העריכה */
export function NoEdit({ children }) {
  const ed = useContext(Ctx);
  return <Ctx.Provider value={ed ? { ...ed, editMode: false } : ed}>{children}</Ctx.Provider>;
}
