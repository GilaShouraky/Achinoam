import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── קבועים (מסונכרנים עם AdminPage) ────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbPfyDjXaIPe1k6tuMUzLcIM1Ns-hjv0UWVGpajH2odLK_ZipOWrVvrcscd5nuFs-Q/exec';
const SHEET_ID   = '2PACX-1vTzHSA8raPYkB3EaYN8ovRX_LU1wYhKXJ4LjNSjFl8LSDOlj1osu4ziirzAoHkJ_VDsWxo-FcDI65qv';
const PROXY      = 'https://corsproxy.io/?';

const SHEET_URLS = {
  settings:  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=0&single=true&output=csv`,
  products:  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=1740173305&single=true&output=csv`,
  categories:`https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=118345411&single=true&output=csv`,
};

// ─── CSS משתנים ────────────────────────────────────────────
const EDIT_OUTLINE = '2px dashed #4F8EF7';
const EDIT_HOVER   = 'rgba(79,142,247,0.08)';
const EDIT_FOCUS   = 'rgba(79,142,247,0.15)';

// ─── CSV fetch ─────────────────────────────────────────────
async function fetchCSV(url) {
  let text;
  try {
    const res = await fetch(url + '&_=' + Date.now());
    text = await res.text();
    if (text.trim().startsWith('<')) throw new Error('HTML');
  } catch {
    const res2 = await fetch(PROXY + encodeURIComponent(url + '&_=' + Date.now()));
    text = await res2.text();
  }
  const rows = [];
  let cur = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i+1] === '"') { field += '"'; i++; } else inQ = !inQ;
    } else if (ch === ',' && !inQ) { cur.push(field); field = ''; }
    else if ((ch === '\n' || (ch === '\r' && text[i+1] === '\n')) && !inQ) {
      if (ch === '\r') i++;
      cur.push(field); field = '';
      if (cur.some(f => f.trim())) rows.push(cur);
      cur = [];
    } else { field += ch; }
  }
  if (field || cur.length) { cur.push(field); if (cur.some(f=>f.trim())) rows.push(cur); }
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/^"|"$/g, '').trim());
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (row[i] || '').replace(/^"|"$/g, '').trim(); });
    return obj;
  });
}

async function callScript(payload) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── Editable Text ──────────────────────────────────────────
function EditText({ value, onChange, tag = 'span', multiline = false, style = {}, className = '', placeholder = 'לחצי לעריכה…' }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const ref = useRef();

  const base = {
    outline: 'none',
    cursor: 'text',
    borderRadius: '4px',
    transition: 'background 0.15s, outline 0.15s',
    minWidth: '40px',
    display: 'inline-block',
    ...style,
    ...(hover  ? { background: EDIT_HOVER,  outline: EDIT_OUTLINE } : {}),
    ...(focus  ? { background: EDIT_FOCUS,  outline: EDIT_OUTLINE } : {}),
  };

  const Tag = tag;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={className}
      style={base}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => { setFocus(true); setHover(false); }}
      onBlur={e => {
        setFocus(false);
        const text = e.currentTarget.innerText;
        if (text !== value) onChange(text);
      }}
      onKeyDown={e => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); ref.current?.blur(); }
      }}
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
}

// ─── Editable Image ─────────────────────────────────────────
function EditImage({ src, onChange, style = {}, alt = '' }) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(src || '');

  const submit = () => {
    setEditing(false);
    if (url !== src) onChange(url);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {src
        ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: style.borderRadius || 0 }} />
        : <div style={{ width: '100%', height: '100%', background: '#EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>אין תמונה</div>
      }
      {hover && !editing && (
        <button onClick={() => setEditing(true)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
          borderRadius: style.borderRadius || 0,
        }}>
          <span style={{ fontSize: '22px' }}>🖼️</span> שינוי תמונה
        </button>
      )}
      {editing && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px', borderRadius: style.borderRadius || 0, zIndex: 10,
        }}>
          <input
            autoFocus value={url} onChange={e => setUrl(e.target.value)}
            placeholder="הדביקי קישור לתמונה…"
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: 'none', fontSize: '12px', direction: 'ltr', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
            <button onClick={submit} style={{ flex: 1, padding: '7px', background: '#4F8EF7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>שמור</button>
            <button onClick={() => { setEditing(false); setUrl(src||''); }} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Auto-save hook ──────────────────────────────────────────
function useAutoSave(settings, onSave) {
  const timer = useRef(null);
  const prev  = useRef(null);

  useEffect(() => {
    if (!settings || prev.current === null) { prev.current = settings; return; }
    if (JSON.stringify(settings) === JSON.stringify(prev.current)) return;
    prev.current = settings;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(settings), 1500);
    return () => clearTimeout(timer.current);
  }, [settings]);
}

// ════════════════════════════════════════════════════════════
//  VisualEditor – הרכיב הראשי
// ════════════════════════════════════════════════════════════
export default function VisualEditor({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'
  const [activeTab, setActiveTab] = useState('general'); // general | products | categories
  const [editingProduct, setEditingProduct] = useState(null);

  // טעינה ראשונית
  useEffect(() => {
    Promise.all([
      fetchCSV(SHEET_URLS.settings),
      fetchCSV(SHEET_URLS.products),
      fetchCSV(SHEET_URLS.categories),
    ]).then(([sRows, pRows, cRows]) => {
      const s = {};
      sRows.forEach(r => {
        const k = r['key'] || r['מפתח'] || '';
        const v = r['value'] || r['ערך'] || '';
        if (k) s[k] = v;
      });
      setSettings(s);
      setProducts(pRows);
      setCategories(cRows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // auto-save הגדרות
  const saveSettings = useCallback(async (s) => {
    setSaveStatus('saving');
    try {
      await callScript({ type: 'updateSettings', settings: s });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch { showToast('שגיאה בשמירה', 'error'); setSaveStatus(''); }
  }, []);

  useAutoSave(settings, saveSettings);

  const setSetting = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  // שמירת מוצר
  const saveProduct = async (product, isNew = false) => {
    try {
      await callScript({ type: isNew ? 'addProduct' : 'updateProduct', product });
      if (isNew) setProducts(prev => [...prev, product]);
      else setProducts(prev => prev.map(p => p['מזהה'] === product['מזהה'] ? product : p));
      setEditingProduct(null);
      showToast('נשמר ✓');
    } catch { showToast('שגיאה', 'error'); }
  };

  // שמירת קטגוריות
  const saveCategories = async (cats) => {
    try {
      await callScript({ type: 'updateCategories', categories: cats });
      showToast('קטגוריות נשמרו ✓');
    } catch { showToast('שגיאה', 'error'); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#9C8DA0', fontSize: '18px' }}>
      ⏳ טוען נתונים מהשיטס…
    </div>
  );

  const LOGO = 'https://i.ibb.co/6R35Qkzt/4.png';
  const s = settings;

  return (
    <div style={{ fontFamily: "'Heebo', sans-serif", direction: 'rtl' }}>

      {/* סרגל עליון */}
      <div style={{ background: '#1A0A1E', color: '#fff', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>✏️ מצב עריכה ויזואלית – לחצי על כל אלמנט כדי לערוך</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: saveStatus === 'saved' ? '#4ADE80' : saveStatus === 'saving' ? '#FBBF24' : 'rgba(255,255,255,0.4)' }}>
            {saveStatus === 'saving' ? '⏳ שומר…' : saveStatus === 'saved' ? '✓ נשמר!' : ''}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['general','products','categories'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                background: activeTab === tab ? '#4F8EF7' : 'rgba(255,255,255,0.1)',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.7)',
              }}>
                {tab === 'general' ? '🌐 כללי' : tab === 'products' ? '🎁 מוצרים' : '📂 קטגוריות'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ טאב כללי ════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div>

          {/* בנר עליון */}
          {s.banner_text !== undefined && (
            <div style={{ background: '#2D1B2E', color: '#E8C99A', textAlign: 'center', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
              <EditText value={s.banner_text} onChange={v => setSetting('banner_text', v)} placeholder="טקסט בנר עליון…" style={{ color: '#E8C99A', width: '100%' }} />
            </div>
          )}

          {/* Header mockup */}
          <div style={{ background: '#F5F0F2', borderRadius: '12px', padding: '16px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E8DDE2' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#8B3A5A' }}>
              <span>מוצרים | אודות | צור קשר</span>
            </div>
            <EditImage
              src={s.logo_url || LOGO}
              onChange={v => setSetting('logo_url', v)}
              style={{ width: '80px', height: '40px', borderRadius: '6px' }}
              alt="לוגו"
            />
          </div>

          {/* Hero */}
          <div style={{ background: 'linear-gradient(135deg, #2D1B2E 0%, #5B2D4E 100%)', borderRadius: '16px', padding: '48px 32px', marginBottom: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {s.hero_image && (
              <div style={{ position: 'absolute', inset: 0, background: `url(${s.hero_image}) center/cover`, opacity: 0.4 }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <EditImage
                src={s.hero_image}
                onChange={v => setSetting('hero_image', v)}
                style={{ width: '100%', height: '180px', position: 'absolute', top: 0, left: 0, borderRadius: '16px', opacity: 0 }}
              />
              <EditText
                value={s.hero_title || 'הגעתם למקום הנכון'}
                onChange={v => setSetting('hero_title', v)}
                tag="h1"
                style={{ color: '#fff', fontSize: '36px', fontWeight: '900', margin: '0 0 10px', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
              />
              <EditText
                value={s.hero_subtitle || 'מחפשים מתנה לעצמכם? לאהובים עליכם?'}
                onChange={v => setSetting('hero_subtitle', v)}
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', display: 'block' }}
              />
              <div style={{ marginTop: '16px', padding: '8px 20px', background: 'rgba(255,255,255,0.15)', display: 'inline-block', borderRadius: '30px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                🖼️ לחצי על רקע ה-hero לשינוי תמונה
              </div>
            </div>
            {/* כפתור שינוי תמונת hero */}
            <button onClick={() => {
              const url = prompt('קישור לתמונת Hero (השאירי ריק להסרה):');
              if (url !== null) setSetting('hero_image', url);
            }} style={{ position: 'absolute', bottom: '12px', left: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', zIndex: 2 }}>
              🖼️ שנה תמונת רקע
            </button>
          </div>

          {/* תמונה קופצת */}
          <div style={{ background: '#FFF8EC', border: '1px solid #F6D860', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontWeight: '700', color: '#92690F' }}>🖼️ תמונה קופצת (פופאפ)</span>
              <span style={{ fontSize: '12px', color: '#B08030' }}>מוצגת 3 שניות בכניסה. רוקני כדי לבטל.</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {s['תמונה_קופצת'] && (
                <img src={s['תמונה_קופצת']} alt="פופאפ" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display='none'} />
              )}
              <div style={{ flex: 1 }}>
                <input
                  value={s['תמונה_קופצת'] || ''}
                  onChange={e => setSetting('תמונה_קופצת', e.target.value)}
                  placeholder="קישור לתמונה קופצת…"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #F6D860', borderRadius: '8px', fontSize: '13px', direction: 'ltr', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* פרטי עסק */}
          <div style={{ background: '#fff', border: '1px solid #E8DDE2', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#8B3A5A', fontSize: '16px' }}>📞 פרטי יצירת קשר</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'טלפון', key: 'contact_phone', type: 'tel' },
                { label: 'מייל', key: 'contact_email', type: 'email' },
                { label: 'כתובת', key: 'contact_address', type: 'text' },
                { label: 'וואטסאפ (עם 972)', key: 'whatsapp_number', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#9C8DA0', display: 'block', marginBottom: '4px' }}>{label}</label>
                  <input
                    type={type}
                    value={s[key] || ''}
                    onChange={e => setSetting(key, e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E8DDE2', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', direction: type !== 'text' ? 'ltr' : 'rtl' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* אודות */}
          <div style={{ background: '#fff', border: '1px solid #E8DDE2', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#8B3A5A', fontSize: '16px' }}>👩‍🎨 עמוד אודות</h3>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#9C8DA0', display: 'block', marginBottom: '6px' }}>טקסט אודות</label>
            <div style={{ border: '1.5px solid #E8DDE2', borderRadius: '8px', padding: '10px', minHeight: '80px', outline: 'none', direction: 'rtl', fontSize: '14px', lineHeight: '1.7' }}>
              <EditText
                value={s.about_text || ''}
                onChange={v => setSetting('about_text', v)}
                tag="p"
                multiline
                style={{ display: 'block', width: '100%', margin: 0, lineHeight: '1.7', fontSize: '14px' }}
                placeholder="טקסט עמוד אודות…"
              />
            </div>
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#9C8DA0', display: 'block', marginBottom: '4px' }}>חתימה</label>
              <input
                value={s.about_signature || ''}
                onChange={e => setSetting('about_signature', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E8DDE2', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* בנר תחתי */}
          <div style={{ background: '#fff', border: '1px solid #E8DDE2', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#8B3A5A', fontSize: '16px' }}>🖼️ בנר תחתי</h3>
            <p style={{ fontSize: '12px', color: '#9C8DA0', margin: '0 0 10px' }}>קישור לתמונה = מציג תמונה | טקסט = מציג טקסט | ריק = לא מוצג</p>
            <input
              value={s.bottom_banner || ''}
              onChange={e => setSetting('bottom_banner', e.target.value)}
              placeholder="קישור לתמונה או טקסט…"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8DDE2', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
            />
            {s.bottom_banner && s.bottom_banner.startsWith('http') && (
              <img src={s.bottom_banner} alt="בנר" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} onError={e => e.target.style.display='none'} />
            )}
          </div>

          {/* פרטי תשלום */}
          <div style={{ background: '#fff', border: '1px solid #E8DDE2', borderRadius: '12px', padding: '20px', marginBottom: '4px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#8B3A5A', fontSize: '16px' }}>💳 פרטי תשלום</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'מספר פייבוקס', key: 'paybox_number' },
                { label: 'שם בעל חשבון', key: 'bank_name' },
                { label: 'בנק', key: 'bank_number' },
                { label: 'סניף', key: 'bank_branch' },
                { label: 'מספר חשבון', key: 'bank_account' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#9C8DA0', display: 'block', marginBottom: '4px' }}>{label}</label>
                  <input
                    value={s[key] || ''}
                    onChange={e => setSetting(key, e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E8DDE2', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ טאב מוצרים ════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div>
          <p style={{ color: '#9C8DA0', fontSize: '13px', marginBottom: '16px' }}>לחצי על מוצר לעריכה ישירה. כל שינוי נשמר אוטומטית לשיטס.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {products.map((product, idx) => (
              <ProductCard
                key={product['מזהה'] || idx}
                product={product}
                onSave={p => saveProduct(p, false)}
                onDelete={async () => {
                  if (!window.confirm('למחוק?')) return;
                  await callScript({ type: 'deleteProduct', productId: product['מזהה'] });
                  setProducts(prev => prev.filter((_,i) => i !== idx));
                }}
              />
            ))}
            {/* כרטיס הוספה */}
            <button onClick={() => {
              const id = String(Date.now());
              saveProduct({ 'מזהה': id, 'שם': 'מוצר חדש', 'מחיר': '0', 'קטגוריה': '', 'תיאור': '', 'תמונה1': '', 'כמות_במלאי': '' }, true);
            }} style={{ background: 'none', border: '2px dashed #C4861A', borderRadius: '16px', cursor: 'pointer', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#C4861A', fontSize: '15px', fontWeight: '700' }}>
              <span style={{ fontSize: '36px' }}>➕</span> הוספת מוצר
            </button>
          </div>
        </div>
      )}

      {/* ═══ טאב קטגוריות ════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div>
          <p style={{ color: '#9C8DA0', fontSize: '13px', marginBottom: '16px' }}>לחצי על כל שדה כדי לערוך. לחצי "שמור קטגוריות" אחרי השינויים.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {categories.map((cat, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid #E8DDE2', borderRadius: '16px', overflow: 'hidden' }}>
                <EditImage
                  src={cat['קישור_לתמונה']}
                  onChange={v => {
                    const next = categories.map((c,i) => i===idx ? { ...c, 'קישור_לתמונה': v } : c);
                    setCategories(next);
                  }}
                  style={{ width: '100%', height: '140px' }}
                  alt={cat['שם_קטגוריה']}
                />
                <div style={{ padding: '14px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#9C8DA0', fontWeight: '700' }}>שם קטגוריה</label>
                    <EditText
                      value={cat['שם_קטגוריה']}
                      onChange={v => {
                        const next = categories.map((c,i) => i===idx ? { ...c, 'שם_קטגוריה': v } : c);
                        setCategories(next);
                      }}
                      tag="div"
                      style={{ fontSize: '16px', fontWeight: '700', color: '#2D1B2E', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#9C8DA0', fontWeight: '700' }}>מזהה (לא לשנות!)</label>
                    <input
                      value={cat['מזהה_קטגוריה']}
                      onChange={e => {
                        const next = categories.map((c,i) => i===idx ? { ...c, 'מזהה_קטגוריה': e.target.value } : c);
                        setCategories(next);
                      }}
                      style={{ display: 'block', width: '100%', padding: '5px 8px', border: '1.5px solid #E8DDE2', borderRadius: '6px', fontSize: '12px', direction: 'ltr', boxSizing: 'border-box', marginTop: '4px' }}
                    />
                  </div>
                  <button onClick={() => { if(window.confirm('למחוק קטגוריה?')) setCategories(prev => prev.filter((_,i)=>i!==idx)); }}
                    style={{ marginTop: '10px', padding: '5px 10px', background: '#FFF0F0', color: '#E53E3E', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%' }}>
                    🗑️ מחיקה
                  </button>
                </div>
              </div>
            ))}
            {/* הוספת קטגוריה */}
            <button onClick={() => setCategories(prev => [...prev, { 'מזהה_קטגוריה': '', 'שם_קטגוריה': 'קטגוריה חדשה', 'קישור_לתמונה': '' }])}
              style={{ background: 'none', border: '2px dashed #C4861A', borderRadius: '16px', cursor: 'pointer', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#C4861A', fontSize: '15px', fontWeight: '700', minHeight: '260px', justifyContent: 'center' }}>
              <span style={{ fontSize: '36px' }}>➕</span> קטגוריה חדשה
            </button>
          </div>
          <button onClick={() => saveCategories(categories)} style={{ width: '100%', padding: '14px', background: '#8B3A5A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>
            💾 שמור קטגוריות לשיטס
          </button>
        </div>
      )}
    </div>
  );
}

// ─── כרטיס מוצר עם עריכה inline ───────────────────────────
function ProductCard({ product, onSave, onDelete }) {
  const [data, setData]     = useState({ ...product });
  const [expanded, setExpanded] = useState(false);
  const timer = useRef(null);

  const change = (key, val) => {
    const next = { ...data, [key]: val };
    setData(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(next), 1500);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E8DDE2', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      {/* תמונה */}
      <EditImage
        src={data['תמונה1']}
        onChange={v => change('תמונה1', v)}
        style={{ width: '100%', height: '160px' }}
        alt={data['שם']}
      />
      <div style={{ padding: '14px' }}>
        {/* שם */}
        <EditText
          value={data['שם']}
          onChange={v => change('שם', v)}
          tag="div"
          style={{ fontSize: '16px', fontWeight: '800', color: '#8B3A5A', marginBottom: '6px', display: 'block' }}
        />
        {/* מחיר */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px', color: '#6B5B6E' }}>₪</span>
          <EditText
            value={data['מחיר']}
            onChange={v => change('מחיר', v.replace(/[^0-9.]/g,''))}
            style={{ fontSize: '18px', fontWeight: '900', color: '#C4861A', minWidth: '40px' }}
          />
        </div>
        {/* מלאי */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9C8DA0' }}>מלאי:</span>
          <EditText
            value={data['כמות_במלאי'] || ''}
            onChange={v => change('כמות_במלאי', v.replace(/[^0-9]/g,''))}
            style={{ fontSize: '13px', color: Number(data['כמות_במלאי'])===0 ? '#E53E3E' : '#25A85A', fontWeight: '700', minWidth: '24px' }}
            placeholder="∞"
          />
          <span style={{ fontSize: '11px', color: '#9C8DA0' }}>יח' (ריק = ללא הגבלה)</span>
        </div>
        {/* קטגוריה */}
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: '#9C8DA0' }}>קטגוריה: </span>
          <EditText
            value={data['קטגוריה'] || ''}
            onChange={v => change('קטגוריה', v)}
            style={{ fontSize: '12px', color: '#8B3A5A', background: '#F0E8F4', padding: '2px 8px', borderRadius: '20px' }}
          />
        </div>
        {/* פתח/סגור פרטים נוספים */}
        <button onClick={() => setExpanded(p => !p)} style={{ width: '100%', padding: '6px', background: '#F8F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#6B5B6E', marginBottom: expanded ? '10px' : '0' }}>
          {expanded ? '▲ סגור' : '▼ פרטים נוספים'}
        </button>
        {expanded && (
          <div>
            <label style={{ fontSize: '11px', color: '#9C8DA0', display: 'block', marginBottom: '4px' }}>תיאור</label>
            <EditText
              value={data['תיאור'] || ''}
              onChange={v => change('תיאור', v)}
              tag="div"
              multiline
              style={{ fontSize: '13px', color: '#2D1B2E', lineHeight: '1.6', border: '1px solid #E8DDE2', borderRadius: '6px', padding: '8px', display: 'block', marginBottom: '10px', minHeight: '50px' }}
            />
            <label style={{ fontSize: '11px', color: '#9C8DA0', display: 'block', marginBottom: '4px' }}>תמונה 2 (URL)</label>
            <input value={data['תמונה2']||''} onChange={e=>change('תמונה2',e.target.value)} style={{ width:'100%', padding:'6px 8px', border:'1px solid #E8DDE2', borderRadius:'6px', fontSize:'12px', direction:'ltr', boxSizing:'border-box', marginBottom:'6px' }} />
            <label style={{ fontSize: '11px', color: '#9C8DA0', display: 'block', marginBottom: '4px' }}>תמונה 3 (URL)</label>
            <input value={data['תמונה3']||''} onChange={e=>change('תמונה3',e.target.value)} style={{ width:'100%', padding:'6px 8px', border:'1px solid #E8DDE2', borderRadius:'6px', fontSize:'12px', direction:'ltr', boxSizing:'border-box', marginBottom:'10px' }} />
            <div style={{ background: '#FFF8EC', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#92690F', margin: '0 0 8px' }}>⭐ מבצע</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[['שם_מבצע','שם מבצע'],['תיאור_מבצע','תיאור'],['מבצע_כמות','כמות'],['מבצע_מחיר','מחיר מבצע']].map(([k,l])=>(
                  <div key={k}>
                    <label style={{ fontSize: '10px', color: '#9C8DA0' }}>{l}</label>
                    <input value={data[k]||''} onChange={e=>change(k,e.target.value)} style={{ width:'100%', padding:'4px 6px', border:'1px solid #F6D860', borderRadius:'4px', fontSize:'12px', boxSizing:'border-box' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <button onClick={onDelete} style={{ width: '100%', padding: '6px', background: '#FFF0F0', color: '#E53E3E', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
          🗑️ מחיקה
        </button>
      </div>
    </div>
  );
}
