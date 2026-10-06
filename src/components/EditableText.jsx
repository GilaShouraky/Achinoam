import React, { useState } from 'react';
import { useEdit } from '../context/EditContext';
import { useApp } from '../context/AppContext';
import { Pencil } from './Icons';

/* -------- modal -------- */
function EditorModal({ fieldKey, initial, onClose }) {
  const { save } = useEdit();
  const [val, setVal] = useState(initial);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    await save(fieldKey, val);
    setBusy(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 20,
        width: '100%', maxWidth: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,.25)',
        direction: 'rtl',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 8, fontFamily: 'Heebo, sans-serif' }}>
          עריכת: <b style={{ color: '#5B2A3E' }}>{fieldKey}</b>
        </div>
        <textarea
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          rows={4}
          style={{
            width: '100%', borderRadius: 8, border: '1.5px solid #d4b3c0',
            padding: '10px 12px', fontSize: 15, fontFamily: 'Heebo, sans-serif',
            resize: 'vertical', boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd',
            background: '#f5f5f5', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
          }}>ביטול</button>
          <button onClick={handleSave} disabled={busy} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#8B5A6B', color: '#fff', cursor: 'pointer',
            fontFamily: 'Heebo, sans-serif', fontWeight: 700,
            opacity: busy ? 0.7 : 1,
          }}>{busy ? 'שומר...' : 'שמור'}</button>
        </div>
      </div>
    </div>
  );
}

/* -------- EditableText -------- */
export default function EditableText({ fieldKey, tag: Tag = 'span', children, style, className }) {
  const { editMode, overrides } = useEdit();
  const { content } = useApp();
  const [editing, setEditing] = useState(false);

  const value = overrides[fieldKey] ?? content?.[fieldKey] ?? children;

  if (!editMode) {
    return <Tag style={style} className={className}>{value}</Tag>;
  }

  return (
    <>
      <Tag
        className={`tx-edit${className ? ' ' + className : ''}`}
        style={{ ...style, position: 'relative', cursor: 'pointer', paddingInlineEnd: '1.4em' }}
        onClick={() => setEditing(true)}
        title="לחץ לעריכה"
      >
        {value}
        <Pencil size={13} className="tx-pen" />
      </Tag>
      {editing && <EditorModal fieldKey={fieldKey} initial={value} onClose={() => setEditing(false)} />}
    </>
  );
}
