import React, { createContext, useContext, useState, useCallback } from 'react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbPfyDjXaIPe1k6tuMUzLcIM1Ns-hjv0UWVGpajH2odLK_ZipOWrVvrcscd5nuFs-Q/exec';

const EditCtx = createContext(null);

export function EditProvider({ children }) {
  const [editMode, setEditMode] = useState(false);
  const [overrides, setOverrides] = useState({});
  const [saving, setSaving] = useState({});

  const save = useCallback(async (key, value) => {
    setOverrides(o => ({ ...o, [key]: value }));
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ type: 'updateSettings', settings: { [key]: value } }),
      });
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  }, []);

  return (
    <EditCtx.Provider value={{ editMode, setEditMode, overrides, saving, save }}>
      {children}
    </EditCtx.Provider>
  );
}

export const useEdit = () => useContext(EditCtx);
