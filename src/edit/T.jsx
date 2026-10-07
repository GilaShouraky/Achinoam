import React from 'react';
import { Pencil, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEdit } from './EditContext';
import { textEntry, resolveText, Rich, withBreaks } from '../lib/texts';

/**
 * טקסט שאפשר לערוך.
 * רגיל: מוצג כרגיל. במצב עריכה: מסגרת מקווקוות + עיפרון, ולחיצה פותחת חלון עריכה
 * (במקום לבצע את הפעולה הרגילה של הכפתור/הקישור).
 */
export function T({ k, vars, block, className, style }) {
  const { settings } = useApp();
  const ed = useEdit();
  const e = textEntry(k);
  const text = resolveText(settings, k, vars);
  const rich = e?.rich;
  const content = rich ? <Rich text={text} /> : withBreaks(text);
  const changed = settings[k] !== undefined && settings[k] !== e?.def;

  if (!ed?.editMode) {
    if (!text) return null;
    if (block || rich) return <div className={`rich ${className || ''}`} style={style}>{content}</div>;
    return className || style ? <span className={className} style={style}>{content}</span> : <>{content}</>;
  }
  const Tag = block || rich ? 'div' : 'span';
  const open = (ev) => { ev.preventDefault(); ev.stopPropagation(); ed.openText(k); };
  return (
    <Tag
      className={`tx-edit${changed ? ' changed' : ''}${!text ? ' empty' : ''}${Tag === 'div' ? ' rich' : ''} ${className || ''}`}
      style={style} role="button" tabIndex={0} title={e ? `${e.group} · ${e.label}` : k}
      onClickCapture={open} onMouseDown={(ev) => ev.stopPropagation()}
      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') open(ev); }}
    >
      {text ? content : <i className="tx-hidden">(מוסתר)</i>}
      <span className="tx-pen" aria-hidden><Pencil size={10} /></span>
    </Tag>
  );
}

/** מחזיר את כתובת התמונה הנוכחית (מהגיליון או ברירת מחדל) */
export function useImg(k, def = '') {
  const { settings } = useApp();
  const v = settings[k];
  return v !== undefined ? v : (textEntry(k)?.def ?? def);
}

/** כפתור "החלפת תמונה" שמופיע רק במצב עריכה. ההורה צריך position: relative */
export function ImgEditBtn({ k, label = 'החלפת תמונה', style, className = '' }) {
  const ed = useEdit();
  if (!ed?.editMode) return null;
  return (
    <button type="button" className={`img-edit-btn ${className}`} style={style}
      onClickCapture={(ev) => { ev.preventDefault(); ev.stopPropagation(); ed.openImage(k); }}>
      <ImageIcon size={14} /> {label}
    </button>
  );
}

/** טקסט לשימוש בתוך מאפיינים (placeholder, alt) – בלי מסגרת עריכה */
export function useText() {
  const { t } = useApp();
  return t;
}
