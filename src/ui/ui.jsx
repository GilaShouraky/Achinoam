import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Link2, Trash2, Loader2, AlertCircle, Check, ImageOff } from 'lucide-react';
import { uploadImage } from '../lib/api';
import './ui.css';

/** חלון: מגירה מלמטה בטלפון, חלון באמצע במחשב */
export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  return createPortal(
    <div className="a-modal-wrap" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`a-modal${wide ? ' wide' : ''}`} role="dialog" aria-label={title}>
        <div className="a-grab" />
        <div className="a-modal-head">
          <h3>{title}</h3>
          <button className="a-icon-btn" onClick={onClose} aria-label="סגירה"><X size={18} /></button>
        </div>
        <div className="a-modal-body">{children}</div>
        {footer && <div className="a-modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Spinner({ size = 16 }) { return <Loader2 size={size} className="a-spin" />; }

export function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="a-alert bad"><AlertCircle size={17} /><div>{message}</div></div>;
}

export function Toast({ toast }) {
  if (!toast) return null;
  return <div key={toast.id} className={`a-toast ${toast.tone}`}>{toast.tone === 'bad' ? <AlertCircle size={17} /> : <Check size={17} />}{toast.msg}</div>;
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className={`a-switch${disabled ? ' disabled' : ''}`}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-sw" aria-hidden />
      {label && <span className="a-sw-label">{label}</span>}
    </label>
  );
}

const isUrl = (s) => /^https?:\/\//.test(s || '');

/**
 * בחירת תמונה: העלאה מהטלפון/מחשב (נשמרת בגוגל דרייב), או הדבקת קישור.
 */
export function ImagePicker({ value, onChange, allowRemove = true, compact }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState('');
  const fileRef = useRef(null);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true); setErr(null);
    try { onChange(await uploadImage(file)); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <div className={`a-imgpick${compact ? ' compact' : ''}`}>
      <div className="a-imgpick-prev">
        {busy ? <span className="a-imgpick-empty"><Spinner size={22} /> מעלה…</span>
          : isUrl(value) ? <img src={value} alt="" onError={(e) => { e.currentTarget.style.opacity = 0.2; }} />
            : <span className="a-imgpick-empty"><ImageOff size={22} />אין תמונה</span>}
      </div>
      <div className="a-imgpick-actions">
        <button type="button" className="a-btn primary sm" disabled={busy} onClick={() => fileRef.current?.click()}><Upload size={15} /> העלאה מהמכשיר</button>
        <button type="button" className="a-btn ghost sm" disabled={busy} onClick={() => { setLinkMode(!linkMode); setLink(isUrl(value) ? value : ''); }}><Link2 size={15} /> קישור</button>
        {allowRemove && value && <button type="button" className="a-btn danger-ghost sm" disabled={busy} onClick={() => onChange('')}><Trash2 size={15} /> הסרה</button>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {linkMode && (
        <div className="a-row" style={{ marginTop: 8 }}>
          <input className="a-input" dir="ltr" placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} autoFocus />
          <button type="button" className="a-btn primary sm" onClick={() => { if (isUrl(link.trim())) { onChange(link.trim()); setLinkMode(false); } else setErr('קישור צריך להתחיל ב־https://'); }}>אישור</button>
        </div>
      )}
      <ErrorBox message={err} />
    </div>
  );
}

/** שדה טופס */
export function Field({ label, hint, children, required }) {
  return (
    <label className="a-field">
      <span className="a-label">{label}{required && <i className="a-req">*</i>}</span>
      {children}
      {hint && <small className="a-hint">{hint}</small>}
    </label>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, tone = 'ok') => {
    const id = Date.now();
    setToast({ msg, tone, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
  };
  return [toast, show];
}

/** שמירה עם הודעת הצלחה/שגיאה */
export async function attempt(fn, show, okMsg = 'נשמר ✓') {
  try { const r = await fn(); if (okMsg) show(okMsg); return r ?? true; }
  catch (e) { show(e.message || 'השמירה נכשלה', 'bad'); return false; }
}
