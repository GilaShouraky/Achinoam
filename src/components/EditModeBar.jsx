import React from 'react';
import { PencilLine, X } from './Icons';
import { useEdit } from '../context/EditContext';

export default function EditModeBar() {
  const { editMode, setEditMode } = useEdit();
  if (!editMode) return null;
  return (
    <div style={{
      position: 'fixed',
      insetInline: 10,
      bottom: 10,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#C4861A',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: 14,
      boxShadow: '0 4px 20px rgba(0,0,0,.2)',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl',
    }}>
      <PencilLine size={18} />
      <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>מצב עריכה פעיל — לחצי על כל טקסט לשינוי</span>
      <button
        onClick={() => setEditMode(false)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          cursor: 'pointer',
          padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 13,
        }}
      >
        <X size={14} /> סגור עריכה
      </button>
    </div>
  );
}
