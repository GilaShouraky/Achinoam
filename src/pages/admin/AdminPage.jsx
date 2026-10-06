import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Settings, Package, Tag, MapPin,
  ShoppingBag, BarChart2, PencilLine, LogOut,
  ArrowRight, Plus, Save, Trash2, RefreshCw, Check,
  AlertCircle, Loader2, TrendingUp,
  ToggleLeft, ToggleRight, Lock, Search, X,
  DollarSign, FileText, Phone, Mail, MapPinned
} from '../../components/Icons';
import { useEdit } from '../../context/EditContext';

/* ─── constants ─── */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbPfyDjXaIPe1k6tuMUzLcIM1Ns-hjv0UWVGpajH2odLK_ZipOWrVvrcscd5nuFs-Q/exec';
const SHEET_ID   = '2PACX-1vTzHSA8raPYkB3EaYN8ovRX_LU1wYhKXJ4LjNSjFl8LSDOlj1osu4ziirzAoHkJ_VDsWxo-FcDI65qv';
const ADMIN_PASS = 'A13579';
const GID = { settings: 0, products: 1740173305, categories: 118345411, pickup: 58180684, orders: 650143375 };

const csv = id => `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${id}&single=true&output=csv`;
const proxy = url => `https://corsproxy.io/?${encodeURIComponent(url)}`;

async function fetchCSV(gid) {
  const r = await fetch(proxy(csv(gid)));
  const text = await r.text();
  const lines = text.trim().split('\n');
  const headers = parseCSVRow(lines[0]);
  return lines.slice(1).map(l => {
    const vals = parseCSVRow(l);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  }).filter(r => Object.values(r).some(v => v));
}

function parseCSVRow(row) {
  const result = []; let cur = ''; let inQ = false;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '"') { inQ = !inQ; }
    else if (row[i] === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += row[i]; }
  }
  result.push(cur);
  return result;
}

async function post(body) {
  const r = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(body) });
  return r.json().catch(() => ({}));
}

/* ─── design tokens ─── */
const T = {
  brand:'#5B2A3E', brandSoft:'#f5edf0',
  accent:'#C4861A', accentSoft:'#fdf3e0',
  slate:'#5B8FA8', slateSoft:'#e8f2f7',
  ok:'#2e7d4f', okSoft:'#e6f4ec',
  danger:'#c0392b', dangerSoft:'#fdecea',
  surface:'#ffffff', bg:'#f5f0f2',
  border:'#e8dde2', text:'#2d1a24', muted:'#9e7a88',
  navH: 60,
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;900&family=Cormorant+Garamond:ital,wght@0,600;1,600&display=swap');
.adm-root *,.adm-root *::before,.adm-root *::after{box-sizing:border-box}
.adm-root{font-family:'Heebo',sans-serif;direction:rtl;background:${T.bg};min-height:100vh}
.adm-topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:52px;background:${T.brand};color:#fff;border-bottom:3px solid ${T.accent}}
.adm-topbar-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600}
.adm-topbar-sub{font-size:11px;opacity:.7}
.adm-bottomnav{position:fixed;bottom:0;inset-inline:0;z-index:100;height:${T.navH}px;background:${T.surface};border-top:1px solid ${T.border};display:grid;grid-template-columns:repeat(5,1fr);align-items:center}
.adm-nav-btn{display:flex;flex-direction:column;align-items:center;gap:2px;border:none;background:none;cursor:pointer;font-size:10px;color:${T.muted};padding:4px 0;font-family:'Heebo',sans-serif;transition:color .15s}
.adm-nav-btn.active{color:${T.brand};font-weight:700}
.adm-nav-fab{width:52px;height:52px;margin:-20px auto 0;border-radius:50%;border:3px solid ${T.surface};background:${T.accent};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(196,134,26,.4);transition:transform .15s}
.adm-nav-fab:hover{transform:scale(1.05)}
.adm-body{padding:14px 16px 80px;max-width:720px;margin:0 auto}
.adm-card{display:flex;align-items:center;gap:12px;padding:14px;background:${T.surface};border-radius:14px;border-inline-start:4px solid var(--c,${T.accent});box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:10px}
.adm-card-icon{width:40px;height:40px;border-radius:10px;background:var(--cs,${T.accentSoft});display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--c,${T.accent})}
.adm-card-label{font-size:12px;color:${T.muted}}
.adm-card-val{font-size:20px;font-weight:900;color:${T.text};line-height:1.1}
.adm-section-title{font-size:13px;font-weight:700;color:${T.muted};letter-spacing:.5px;text-transform:uppercase;margin:20px 0 10px}
.seg-tabs{display:flex;background:#ece6e9;border-radius:12px;padding:3px;gap:2px;margin-bottom:14px}
.seg-tabs button{flex:1;padding:8px 4px;border:none;background:none;border-radius:10px;cursor:pointer;font-size:13px;font-family:'Heebo',sans-serif;color:${T.muted};transition:all .15s}
.seg-tabs button.on{background:${T.surface};color:${T.brand};font-weight:700;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.fullpage{position:fixed;inset:0;z-index:200;background:${T.bg};display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s ease}
.fullpage.open{transform:translateX(0)}
.fp-head{display:flex;align-items:center;gap:8px;padding:10px 14px;background:${T.surface};border-bottom:1px solid ${T.border};position:sticky;top:0;z-index:10}
.fp-back{border:none;background:${T.brandSoft};color:${T.brand};width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.fp-title{font-weight:700;font-size:16px;color:${T.text}}
.fp-body{flex:1;overflow-y:auto;padding:14px 16px 24px;max-width:720px;margin:0 auto;width:100%}
.fp-foot{background:${T.surface};border-top:1px solid ${T.border};padding:10px 16px;display:flex;gap:10px}
.btn{padding:11px 20px;border-radius:10px;border:none;cursor:pointer;font-size:15px;font-family:'Heebo',sans-serif;font-weight:700;display:flex;align-items:center;gap:6px;transition:opacity .15s}
.btn:disabled{opacity:.6;cursor:not-allowed}
.btn-primary{background:${T.brand};color:#fff;flex:1;justify-content:center}
.btn-secondary{background:${T.brandSoft};color:${T.brand}}
.btn-danger{background:${T.dangerSoft};color:${T.danger}}
.btn-accent{background:${T.accent};color:#fff}
.adm-input{width:100%;padding:11px 13px;border:1.5px solid ${T.border};border-radius:10px;font-size:15px;font-family:'Heebo',sans-serif;background:${T.surface};outline:none;transition:border .15s;direction:rtl}
.adm-input:focus{border-color:${T.brand}}
.adm-label{font-size:13px;font-weight:700;color:${T.muted};margin-bottom:5px;display:block}
.adm-field{margin-bottom:14px}
.adm-row{display:flex;gap:10px}
.adm-row .adm-field{flex:1}
.adm-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:12px;font-weight:700}
.badge-ok{background:${T.okSoft};color:${T.ok}}
.badge-warn{background:${T.accentSoft};color:${T.accent}}
.badge-danger{background:${T.dangerSoft};color:${T.danger}}
.badge-slate{background:${T.slateSoft};color:${T.slate}}
.adm-empty{text-align:center;padding:40px 20px;color:${T.muted}}
.adm-spinner{display:inline-block;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.adm-list-item{display:flex;align-items:center;gap:12px;padding:13px 14px;background:${T.surface};border-radius:12px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,.05);cursor:pointer;transition:box-shadow .15s}
.adm-list-item:hover{box-shadow:0 2px 8px rgba(0,0,0,.1)}
.adm-list-thumb{width:48px;height:48px;border-radius:8px;object-fit:cover;background:${T.bg};flex-shrink:0}
.adm-toast{position:fixed;bottom:80px;inset-inline:16px;z-index:9999;background:${T.ok};color:#fff;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,.2);animation:slideUp .25s ease}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
`;

/* ─── helpers ─── */
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m, dur = 2500) => { setMsg(m); setTimeout(() => setMsg(null), dur); }, []);
  const Toast = msg ? <div className="adm-toast"><Check size={16}/>{msg}</div> : null;
  return [Toast, show];
}
function Spinner() { return <Loader2 size={16} className="adm-spinner"/>; }

/* ─── Login ─── */
function Login({ onLogin }) {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false);
  const submit = () => pw === ADMIN_PASS ? onLogin() : (setErr(true), setTimeout(() => setErr(false), 1500));
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg,${T.brand} 0%,#3d1a2a 100%)`,padding:24,fontFamily:'Heebo,sans-serif',direction:'rtl'}}>
      <div style={{background:'#fff',borderRadius:24,padding:32,width:'100%',maxWidth:360,boxShadow:'0 20px 60px rgba(0,0,0,.3)',textAlign:'center'}}>
        <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:28,color:T.brand,fontWeight:600,marginBottom:4}}>אחינועם</div>
        <div style={{color:T.muted,fontSize:13,marginBottom:28}}>ממשק ניהול</div>
        <Lock size={40} color={T.brand} style={{margin:'0 auto 20px'}}/>
        <input type="password" placeholder="סיסמה" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} style={{width:'100%',padding:'13px 16px',border:`2px solid ${err?T.danger:T.border}`,borderRadius:12,fontSize:18,outline:'none',marginBottom:14,fontFamily:'Heebo,sans-serif',direction:'rtl',textAlign:'center',letterSpacing:4,transition:'border .2s'}} autoFocus/>
        {err && <div style={{color:T.danger,fontSize:13,marginBottom:10}}>סיסמה שגויה</div>}
        <button onClick={submit} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:T.brand,color:'#fff',fontSize:16,fontFamily:'Heebo,sans-serif',fontWeight:700,cursor:'pointer'}}>כניסה</button>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
function Dashboard({ orders, products, setTab }) {
  const pending = orders.filter(o => o['סטטוס']==='ממתינה'||!o['סטטוס']).length;
  const totalRevenue = orders.reduce((s,o) => s+(parseFloat(o['סכום'])||0), 0);
  const stats = [
    {label:'הזמנות',val:orders.length,c:T.brand,cs:T.brandSoft,Icon:ShoppingBag},
    {label:'ממתינות',val:pending,c:T.accent,cs:T.accentSoft,Icon:AlertCircle},
    {label:'מוצרים',val:products.length,c:T.slate,cs:T.slateSoft,Icon:Package},
    {label:'הכנסות ₪',val:totalRevenue.toLocaleString(),c:T.ok,cs:T.okSoft,Icon:TrendingUp},
  ];
  return (
    <div>
      <div className="adm-section-title">סיכום</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {stats.map(({label,val,c,cs,Icon})=>(
          <div key={label} className="adm-card" style={{'--c':c,'--cs':cs,flexDirection:'column',alignItems:'flex-start',gap:6}}>
            <div className="adm-card-icon"><Icon size={18}/></div>
            <div className="adm-card-label">{label}</div>
            <div className="adm-card-val">{val}</div>
          </div>
        ))}
      </div>
      <div className="adm-section-title">פעולות מהירות</div>
      {[
        {label:'הזמנות ממתינות',sub:`${pending} דורשות טיפול`,c:T.accent,cs:T.accentSoft,Icon:ShoppingBag,tab:4},
        {label:'ניהול מוצרים',sub:`${products.length} מוצרים`,c:T.slate,cs:T.slateSoft,Icon:Package,tab:2},
        {label:'הגדרות האתר',sub:'טקסטים, פרטי קשר',c:T.brand,cs:T.brandSoft,Icon:Settings,tab:1},
      ].map(({label,sub,c,cs,Icon,tab})=>(
        <div key={label} className="adm-card" style={{'--c':c,'--cs':cs,cursor:'pointer'}} onClick={()=>setTab(tab)}>
          <div className="adm-card-icon"><Icon size={18}/></div>
          <div style={{flex:1}}><div style={{fontWeight:700,color:T.text}}>{label}</div><div className="adm-card-label">{sub}</div></div>
          <ArrowRight size={16} style={{color:T.muted,transform:'rotate(180deg)'}}/>
        </div>
      ))}
    </div>
  );
}

/* ─── Settings ─── */
function SettingsPanel({ settings, reload }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [Toast, showToast] = useToast();
  useEffect(()=>{ setForm({...settings}); },[settings]);
  const fields = [
    {key:'banner_text',label:'טקסט באנר עליון',Icon:FileText},
    {key:'hero_title',label:'כותרת ראשית',Icon:FileText},
    {key:'hero_subtitle',label:'תת כותרת',Icon:FileText},
    {key:'about_text',label:'טקסט אודות',Icon:FileText,multiline:true},
    {key:'about_signature',label:'חתימה אודות',Icon:FileText},
    {key:'contact_phone',label:'טלפון',Icon:Phone},
    {key:'contact_email',label:'אימייל',Icon:Mail},
    {key:'contact_address',label:'כתובת',Icon:MapPinned},
    {key:'whatsapp_number',label:'ווצאפ',Icon:Phone},
    {key:'bottom_banner',label:'באנר תחתון',Icon:FileText},
  ];
  const save = async () => {
    setBusy(true);
    try { await post({type:'updateSettings',settings:form}); showToast('ההגדרות נשמרו'); reload(); }
    finally { setBusy(false); }
  };
  return (
    <div>
      {Toast}
      {fields.map(({key,label,Icon,multiline})=>(
        <div key={key} className="adm-field">
          <label className="adm-label"><Icon size={13} style={{verticalAlign:'middle',marginLeft:4}}/>{label}</label>
          {multiline
            ? <textarea className="adm-input" rows={3} value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{resize:'vertical'}}/>
            : <input className="adm-input" value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
          }
        </div>
      ))}
      <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?<Spinner/>:<Save size={16}/>} שמור הגדרות</button>
    </div>
  );
}

/* ─── Product Form ─── */
function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(product||{id:Date.now().toString(),name:'',price:'',description:'',image:'',category:'',stock:'',active:'כן'});
  const [busy, setBusy] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const save = async () => {
    setBusy(true);
    try { await post({type:product?'updateProduct':'addProduct',product:form}); onSave(); }
    finally { setBusy(false); }
  };
  return (
    <div className="fullpage open">
      <div className="fp-head"><button className="fp-back" onClick={onClose}><ArrowRight size={18}/></button><span className="fp-title">{product?'עריכת מוצר':'מוצר חדש'}</span></div>
      <div className="fp-body">
        <div className="adm-field"><label className="adm-label">שם מוצר</label><input className="adm-input" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
        <div className="adm-row">
          <div className="adm-field"><label className="adm-label">מחיר ₪</label><input className="adm-input" type="number" value={form.price} onChange={e=>set('price',e.target.value)}/></div>
          <div className="adm-field"><label className="adm-label">מלאי</label><input className="adm-input" type="number" value={form.stock} onChange={e=>set('stock',e.target.value)}/></div>
        </div>
        <div className="adm-field"><label className="adm-label">קטגוריה</label><input className="adm-input" value={form.category} onChange={e=>set('category',e.target.value)}/></div>
        <div className="adm-field"><label className="adm-label">תיאור</label><textarea className="adm-input" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} style={{resize:'vertical'}}/></div>
        <div className="adm-field"><label className="adm-label">כתובת תמונה (URL)</label><input className="adm-input" value={form.image} onChange={e=>set('image',e.target.value)}/></div>
        {form.image&&<img src={form.image} alt="" style={{width:'100%',maxHeight:200,objectFit:'cover',borderRadius:10,marginBottom:14}} onError={e=>e.target.style.display='none'}/>}
        <div className="adm-field">
          <label className="adm-label">פעיל</label>
          <div style={{display:'flex',gap:8}}>
            {['כן','לא'].map(v=>(
              <button key={v} onClick={()=>set('active',v)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${form.active===v?T.brand:T.border}`,background:form.active===v?T.brandSoft:T.surface,color:form.active===v?T.brand:T.muted,fontFamily:'Heebo,sans-serif',fontWeight:700,cursor:'pointer'}}>
                {v==='כן'?'✓ פעיל':'✗ מושבת'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="fp-foot">
        <button className="btn btn-secondary" onClick={onClose}>ביטול</button>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?<Spinner/>:<Save size={16}/>} שמור</button>
      </div>
    </div>
  );
}

/* ─── Products ─── */
function ProductsPanel({ products, reload }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [Toast, showToast] = useToast();
  const filtered = products.filter(p=>!search||(p.name||'').includes(search)||(p.category||'').includes(search));
  const onSave = () => { setEditing(null); setAdding(false); showToast('המוצר נשמר'); reload(); };
  const onDelete = async (id) => {
    if (!window.confirm('למחוק?')) return;
    setDeletingId(id); await post({type:'deleteProduct',id}); setDeletingId(null); showToast('נמחק'); reload();
  };
  return (
    <div>
      {Toast}
      {(adding||editing)&&<ProductForm product={editing} onSave={onSave} onClose={()=>{setEditing(null);setAdding(false);}}/>}
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <div style={{position:'relative',flex:1}}>
          <Search size={14} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:T.muted}}/>
          <input className="adm-input" style={{paddingRight:32}} placeholder="חיפוש..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-accent" onClick={()=>setAdding(true)} style={{flexShrink:0}}><Plus size={16}/></button>
      </div>
      {filtered.length===0&&<div className="adm-empty"><Package size={40} style={{margin:'0 auto 10px',opacity:.3}}/><div>אין מוצרים</div></div>}
      {filtered.map(p=>(
        <div key={p.id} className="adm-list-item" onClick={()=>setEditing(p)}>
          {p.image?<img src={p.image} alt="" className="adm-list-thumb" onError={e=>e.target.style.display='none'}/>:<div className="adm-list-thumb" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><Package size={20} color={T.muted}/></div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
            <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
              <span className="adm-badge badge-slate">₪{p.price}</span>
              {p.category&&<span className="adm-badge badge-warn">{p.category}</span>}
            </div>
          </div>
          <button onClick={e=>{e.stopPropagation();onDelete(p.id);}} style={{border:'none',background:T.dangerSoft,color:T.danger,borderRadius:8,padding:'6px 8px',cursor:'pointer'}}>
            {deletingId===p.id?<Spinner/>:<Trash2 size={15}/>}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Orders ─── */
function OrdersPanel({ orders, reload }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [Toast, showToast] = useToast();
  const filtered = filter==='all'?orders:orders.filter(o=>o['סטטוס']===filter);
  const statusColor = s => {
    if(s==='ממתינה') return {bg:T.accentSoft,c:T.accent};
    if(s==='בטיפול') return {bg:T.slateSoft,c:T.slate};
    if(s==='נשלחה') return {bg:T.okSoft,c:T.ok};
    if(s==='בוטלה') return {bg:T.dangerSoft,c:T.danger};
    return {bg:T.bg,c:T.muted};
  };
  const updateStatus = async (id, status) => {
    setBusy(true); await post({type:'updateOrderStatus',orderId:id,status}); showToast('עודכן'); setBusy(false); reload();
    setSelected(s=>s?{...s,'סטטוס':status}:null);
  };
  return (
    <div>
      {Toast}
      {selected&&(
        <div className="fullpage open">
          <div className="fp-head"><button className="fp-back" onClick={()=>setSelected(null)}><ArrowRight size={18}/></button><span className="fp-title">הזמנה #{selected['מספר הזמנה']||''}</span></div>
          <div className="fp-body">
            {Object.entries(selected).map(([k,v])=>v?(
              <div key={k} className="adm-card" style={{'--c':T.brand,'--cs':T.brandSoft,flexDirection:'column',alignItems:'flex-start',gap:2}}>
                <div style={{fontSize:11,color:T.muted}}>{k}</div><div style={{fontWeight:600,color:T.text}}>{v}</div>
              </div>
            ):null)}
            <div className="adm-section-title">עדכון סטטוס</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {['ממתינה','בטיפול','נשלחה','בוטלה'].map(s=>{
                const {bg,c} = statusColor(s); const active = selected['סטטוס']===s;
                return <button key={s} onClick={()=>updateStatus(selected['מספר הזמנה']||selected['id'],s)} disabled={busy} style={{padding:'11px 8px',borderRadius:10,border:`2px solid ${active?c:T.border}`,background:active?bg:T.surface,color:active?c:T.muted,fontFamily:'Heebo,sans-serif',fontWeight:700,cursor:'pointer',fontSize:14}}>{s}</button>;
              })}
            </div>
          </div>
        </div>
      )}
      <div className="seg-tabs">
        {['all','ממתינה','בטיפול','נשלחה','בוטלה'].map(s=>(
          <button key={s} className={filter===s?'on':''} onClick={()=>setFilter(s)}>{s==='all'?'הכל':s}</button>
        ))}
      </div>
      {filtered.length===0&&<div className="adm-empty"><ShoppingBag size={40} style={{margin:'0 auto 10px',opacity:.3}}/><div>אין הזמנות</div></div>}
      {filtered.map((o,i)=>{
        const {bg,c} = statusColor(o['סטטוס']);
        return (
          <div key={i} className="adm-list-item" onClick={()=>setSelected(o)}>
            <div style={{width:40,height:40,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><ShoppingBag size={18} color={c}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:T.text}}>{o['שם']||o['name']||'לא ידוע'}</div>
              <div style={{fontSize:12,color:T.muted}}>{o['תאריך']||''} · ₪{o['סכום']||'?'}</div>
            </div>
            <span className="adm-badge" style={{background:bg,color:c}}>{o['סטטוס']||'ממתינה'}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Categories ─── */
function CategoriesPanel({ categories, reload }) {
  const [form, setForm] = useState({name:'',description:'',image:''});
  const [busy, setBusy] = useState(false);
  const [Toast, showToast] = useToast();
  const save = async () => {
    if(!form.name) return; setBusy(true);
    await post({type:'updateCategories',categories:[...categories,form]}); showToast('נוספה'); setForm({name:'',description:'',image:''}); setBusy(false); reload();
  };
  return (
    <div>
      {Toast}
      <div className="adm-section-title">קטגוריות</div>
      {categories.length===0&&<div className="adm-empty"><Tag size={40} style={{margin:'0 auto 10px',opacity:.3}}/><div>אין קטגוריות</div></div>}
      {categories.map((c,i)=>(
        <div key={i} className="adm-card" style={{'--c':T.slate,'--cs':T.slateSoft}}>
          {c.image?<img src={c.image} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover'}}/>:<div className="adm-card-icon"><Tag size={16}/></div>}
          <div><div style={{fontWeight:700,color:T.text}}>{c.name}</div>{c.description&&<div className="adm-card-label">{c.description}</div>}</div>
        </div>
      ))}
      <div className="adm-section-title">הוסף קטגוריה</div>
      {['name:שם קטגוריה','description:תיאור','image:תמונה (URL)'].map(f=>{
        const [k,l] = f.split(':');
        return <div key={k} className="adm-field"><label className="adm-label">{l}</label><input className="adm-input" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>;
      })}
      <button className="btn btn-primary" onClick={save} disabled={busy||!form.name}>{busy?<Spinner/>:<Plus size={16}/>} הוסף</button>
    </div>
  );
}

/* ─── Pickup ─── */
function PickupPanel({ pickupPoints, reload }) {
  const [busy, setBusy] = useState(false);
  const [Toast, showToast] = useToast();
  const [form, setForm] = useState({name:'',address:'',phone:''});
  const del = async (i) => {
    setBusy(true); await post({type:'updatePickupPoints',points:pickupPoints.filter((_,idx)=>idx!==i)}); showToast('נמחקה'); setBusy(false); reload();
  };
  const add = async () => {
    if(!form.name) return; setBusy(true);
    await post({type:'updatePickupPoints',points:[...pickupPoints,form]}); showToast('נוספה'); setForm({name:'',address:'',phone:''}); setBusy(false); reload();
  };
  return (
    <div>
      {Toast}
      {pickupPoints.length===0&&<div className="adm-empty"><MapPin size={40} style={{margin:'0 auto 10px',opacity:.3}}/><div>אין נקודות</div></div>}
      {pickupPoints.map((p,i)=>(
        <div key={i} className="adm-card" style={{'--c':T.ok,'--cs':T.okSoft}}>
          <div className="adm-card-icon"><MapPin size={18}/></div>
          <div style={{flex:1}}><div style={{fontWeight:700,color:T.text}}>{p.name||p['שם']}</div><div className="adm-card-label">{p.address||p['כתובת']}</div></div>
          <button onClick={()=>del(i)} style={{border:'none',background:T.dangerSoft,color:T.danger,borderRadius:8,padding:'6px 8px',cursor:'pointer'}}><Trash2 size={15}/></button>
        </div>
      ))}
      <div className="adm-section-title">הוסף נקודת איסוף</div>
      {['name:שם','address:כתובת','phone:טלפון'].map(f=>{
        const [k,l] = f.split(':');
        return <div key={k} className="adm-field"><label className="adm-label">{l}</label><input className="adm-input" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>;
      })}
      <button className="btn btn-primary" onClick={add} disabled={busy||!form.name}>{busy?<Spinner/>:<Plus size={16}/>} הוסף</button>
    </div>
  );
}

/* ─── Visual Editor Panel ─── */
function VisualEditorPanel() {
  const { editMode, setEditMode } = useEdit();
  return (
    <div>
      <div className="adm-card" style={{'--c':T.accent,'--cs':T.accentSoft,flexDirection:'column',alignItems:'flex-start',gap:10}}>
        <div className="adm-card-icon"><PencilLine size={18}/></div>
        <div style={{fontWeight:700,color:T.text,fontSize:16}}>עריכה ויזואלית</div>
        <div className="adm-card-label">הפעל מצב עריכה ועבור לאתר — לחץ על כל טקסט לשינוי ישיר</div>
        <button onClick={()=>setEditMode(!editMode)} style={{width:'100%',padding:'11px 16px',borderRadius:10,border:'none',background:editMode?T.accent:T.brandSoft,color:editMode?'#fff':T.brand,fontFamily:'Heebo,sans-serif',fontWeight:700,fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {editMode?<ToggleRight size={20}/>:<ToggleLeft size={20}/>}
          {editMode?'מצב עריכה פעיל — כבה':'הפעל מצב עריכה'}
        </button>
      </div>
      {editMode&&(
        <div style={{background:T.accentSoft,border:`1.5px solid ${T.accent}`,borderRadius:14,padding:16,marginTop:12,direction:'rtl'}}>
          <div style={{fontWeight:700,color:T.accent,marginBottom:8,display:'flex',gap:6,alignItems:'center'}}><AlertCircle size={16}/> הוראות</div>
          <ul style={{margin:0,padding:0,listStyle:'none',color:T.text,fontSize:14,lineHeight:1.9}}>
            <li>• עבור לאתר דרך תפריט הניווט</li>
            <li>• טקסטים שניתנים לעריכה יקבלו מסגרת מקווקו</li>
            <li>• לחץ על כל טקסט לפתיחת עורך</li>
            <li>• השינויים נשמרים בגוגל שיטס</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Stats ─── */
function StatsPanel({ orders, products }) {
  const totalRevenue = orders.reduce((s,o) => s+(parseFloat(o['סכום'])||0), 0);
  return (
    <div>
      <div className="adm-section-title">הכנסות והזמנות</div>
      <div className="adm-card" style={{'--c':T.ok,'--cs':T.okSoft}}>
        <div className="adm-card-icon"><DollarSign size={18}/></div>
        <div><div className="adm-card-label">סה"כ הכנסות</div><div className="adm-card-val">₪{totalRevenue.toLocaleString()}</div></div>
      </div>
      <div className="adm-section-title">פילוח לפי סטטוס</div>
      {['ממתינה','בטיפול','נשלחה','בוטלה'].map(s=>{
        const count = orders.filter(o=>(o['סטטוס']||'ממתינה')===s).length;
        const pct = orders.length?Math.round(count/orders.length*100):0;
        return (
          <div key={s} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13,fontWeight:600,color:T.text}}>
              <span>{s}</span><span>{count} ({pct}%)</span>
            </div>
            <div style={{background:T.border,borderRadius:8,height:8,overflow:'hidden'}}>
              <div style={{width:`${pct}%`,height:'100%',background:T.brand,borderRadius:8,transition:'width .5s'}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Nav config ─── */
const NAV_TABS = [
  {id:0,label:'בית',Icon:LayoutDashboard},
  {id:1,label:'הגדרות',Icon:Settings},
  null, // FAB
  {id:2,label:'מוצרים',Icon:Package},
  {id:4,label:'הזמנות',Icon:ShoppingBag},
];

const FAB_ITEMS = [
  {id:3,label:'קטגוריות',Icon:Tag},
  {id:6,label:'נק׳ איסוף',Icon:MapPin},
  {id:5,label:'סטטיסטיקות',Icon:BarChart2},
  {id:7,label:'עריכה ויזואלית',Icon:PencilLine},
];

const TAB_LABELS = {0:'לוח בקרה',1:'הגדרות',2:'מוצרים',3:'קטגוריות',4:'הזמנות',5:'סטטיסטיקות',6:'נקודות איסוף',7:'עריכה ויזואלית'};

/* ─── AdminPage ─── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adm_ok')==='1');
  const [tab, setTab] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);
  const [data, setData] = useState({settings:{},products:[],categories:[],pickup:[],orders:[]});
  const [loading, setLoading] = useState(false);
  const { editMode } = useEdit();

  const login = () => { sessionStorage.setItem('adm_ok','1'); setAuthed(true); };
  const logout = () => { sessionStorage.removeItem('adm_ok'); setAuthed(false); };

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRows,products,categories,pickup,orders] = await Promise.all([
        fetchCSV(GID.settings), fetchCSV(GID.products), fetchCSV(GID.categories), fetchCSV(GID.pickup), fetchCSV(GID.orders),
      ]);
      const settings = {};
      settingsRows.forEach(r=>{ if(r.key) settings[r.key]=r.value; });
      setData({settings,products,categories,pickup,orders});
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(()=>{ if(authed) reload(); },[authed,reload]);

  if (!authed) return <><style>{CSS}</style><div className="adm-root"><Login onLogin={login}/></div></>;

  const changeTab = (t) => { setTab(t); setFabOpen(false); };

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-root">
        {/* Topbar */}
        <div className="adm-topbar">
          <div>
            <div className="adm-topbar-title">אחינועם ✦ ניהול</div>
            <div className="adm-topbar-sub">{TAB_LABELS[tab]}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {loading&&<Loader2 size={18} className="adm-spinner" style={{opacity:.6}}/>}
            {editMode&&<span style={{background:'rgba(196,134,26,.3)',color:'#ffe0a0',fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:8}}>עריכה פעילה</span>}
            <button onClick={reload} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',borderRadius:8,padding:'6px 8px',cursor:'pointer',display:'flex'}}><RefreshCw size={15}/></button>
            <button onClick={logout} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',borderRadius:8,padding:'6px 8px',cursor:'pointer',display:'flex'}}><LogOut size={15}/></button>
          </div>
        </div>

        {/* Content */}
        <div className="adm-body">
          {tab===0&&<Dashboard orders={data.orders} products={data.products} setTab={changeTab}/>}
          {tab===1&&<SettingsPanel settings={data.settings} reload={reload}/>}
          {tab===2&&<ProductsPanel products={data.products} reload={reload}/>}
          {tab===3&&<CategoriesPanel categories={data.categories} reload={reload}/>}
          {tab===4&&<OrdersPanel orders={data.orders} reload={reload}/>}
          {tab===5&&<StatsPanel orders={data.orders} products={data.products}/>}
          {tab===6&&<PickupPanel pickupPoints={data.pickup} reload={reload}/>}
          {tab===7&&<VisualEditorPanel/>}
        </div>

        {/* FAB popup */}
        {fabOpen&&<div style={{position:'fixed',inset:0,zIndex:140}} onClick={()=>setFabOpen(false)}/>}
        {fabOpen&&(
          <div style={{position:'fixed',bottom:T.navH+10,left:'50%',transform:'translateX(-50%)',zIndex:150,display:'flex',flexDirection:'column',gap:8,alignItems:'center'}}>
            {FAB_ITEMS.map(({id,label,Icon})=>(
              <button key={id} onClick={()=>changeTab(id)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:20,border:'none',background:tab===id?T.brand:T.surface,color:tab===id?'#fff':T.text,boxShadow:'0 2px 12px rgba(0,0,0,.15)',cursor:'pointer',fontFamily:'Heebo,sans-serif',fontWeight:700,fontSize:14,whiteSpace:'nowrap'}}>
                <Icon size={16}/>{label}
              </button>
            ))}
          </div>
        )}

        {/* Bottom nav */}
        <nav className="adm-bottomnav">
          {NAV_TABS.map((t,i) => t===null ? (
            <div key="fab" style={{display:'flex',justifyContent:'center'}}>
              <button className="adm-nav-fab" onClick={()=>setFabOpen(f=>!f)}>
                {fabOpen?<X size={22}/>:<BarChart2 size={22}/>}
              </button>
            </div>
          ) : (
            <button key={t.id} className={`adm-nav-btn${tab===t.id?' active':''}`} onClick={()=>changeTab(t.id)}>
              <t.Icon size={20}/>{t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
