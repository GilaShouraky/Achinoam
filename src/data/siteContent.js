// ═══════════════════════════════════════════════════════
//  טעינת הנתונים מ־Google Sheets
//  גולשים רגילים: קבצי CSV שפורסמו לאינטרנט
//  מנהלת מחוברת: ישירות מהסקריפט (בזמן אמת, בלי עיכוב)
// ═══════════════════════════════════════════════════════
import { PUBLISHED_SHEET_ID, GIDS } from '../config';

const PROXY = 'https://corsproxy.io/?';
export const csvUrl = (gid) => `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

/** סימון לטקסט שהוסתר בכוונה (שורה עם ערך ריק נחשבת "לא נערך") */
export const EMPTY_MARK = '(ריק)';
/** בעמודה "הערת מחיר": לא להציג מחיר בכלל */
export const NO_PRICE = '(ללא)';

// ─── ערכי ברירת מחדל ─────────────────
export const defaultContent = {
  banner_text: '',
  whatsapp_number: '9720548838607',
  featured_ids: '',
  under100_exclude: '',
};

// ─── פירוק CSV (כולל שורות חדשות בתוך תאים) ─────────────
export function parseCSV(raw) {
  const rows = [];
  let cur = [], field = '', inQ = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') {
      if (inQ && raw[i + 1] === '"') { field += '"'; i++; } else inQ = !inQ;
    } else if (ch === ',' && !inQ) { cur.push(field); field = ''; }
    else if ((ch === '\n' || (ch === '\r' && raw[i + 1] === '\n')) && !inQ) {
      if (ch === '\r') i++;
      cur.push(field); field = '';
      if (cur.some(f => f.trim())) rows.push(cur);
      cur = [];
    } else field += ch;
  }
  if (field || cur.length) { cur.push(field); if (cur.some(f => f.trim())) rows.push(cur); }
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map((row, i) => {
    const obj = { _row: i + 2 };
    headers.forEach((h, j) => { if (h) obj[h] = (row[j] || '').trim(); });
    return obj;
  });
}

async function fetchCSV(gid) {
  const url = csvUrl(gid);
  let text;
  try {
    const res = await fetch(url + `&t=${Date.now()}`);
    text = await res.text();
    if (text.trim().startsWith('<')) throw new Error('got HTML');
  } catch {
    const res2 = await fetch(PROXY + encodeURIComponent(url));
    text = await res2.text();
  }
  return parseCSV(text.trim());
}

/** טעינת כל הלשוניות הציבוריות */
export async function loadRawFromCSV() {
  const keys = Object.keys(GIDS);
  const results = await Promise.all(keys.map(k => fetchCSV(GIDS[k]).catch(() => [])));
  const raw = {};
  keys.forEach((k, i) => { raw[k] = results[i]; });
  return raw;
}

// ─── המרות ────────────────────────────────────────────
const v = (row, ...names) => {
  for (const n of names) if (row[n] !== undefined && String(row[n]).trim() !== '') return String(row[n]).trim();
  return '';
};
export const isHidden = (row) => /^(לא|no|false|0)$/i.test(v(row, 'מוצג'));

export function settingsMap(rows = []) {
  const m = {};
  rows.forEach(row => {
    const key = v(row, 'key', 'מפתח');
    const value = row.value ?? row['ערך'] ?? '';
    if (key && String(value).trim() !== '') m[key] = String(value) === EMPTY_MARK ? '' : String(value);
  });
  return m;
}

export function rowToProduct(row) {
  const emojiKey = Object.keys(row).find(k => k.includes('אמוג'));
  const rawPrice = v(row, 'מחיר');
  const price = rawPrice ? Number(rawPrice) || 0 : 0;
  const rawNote = v(row, 'הערת מחיר');
  const noPrice = price <= 0 && rawNote === NO_PRICE;
  const priceNote = price > 0 || noPrice ? '' : rawNote;
  const stockKey = Object.keys(row).find(k => k.trim() === 'כמות_במלאי');
  return {
    id: v(row, 'מזהה') || String(row._row),
    category: v(row, 'קטגוריה'),
    name: v(row, 'שם'),
    description: v(row, 'תיאור'),
    price,
    priceNote,
    noPrice,
    emoji: (emojiKey && String(row[emojiKey]).trim()) || '',
    images: [row['תמונה1'], row['תמונה2'], row['תמונה3'], row['תמונה4']].map(x => (x || '').trim()).filter(Boolean),
    dealQty: v(row, 'מבצע_כמות') ? Number(v(row, 'מבצע_כמות')) : null,
    dealPrice: v(row, 'מבצע_מחיר') ? Number(v(row, 'מבצע_מחיר')) : null,
    dealLabel: v(row, 'תיאור_מבצע') || null,
    dealGroup: v(row, 'שם_מבצע') || null,
    dealType: v(row, 'סוג_מבצע') || null,
    stock: stockKey && String(row[stockKey]).trim() !== '' ? Number(row[stockKey]) : null,
    hidden: isHidden(row),
  };
}

export function rowToWorkshop(row) {
  const emojiKey = Object.keys(row).find(k => k.includes('אמוג'));
  return {
    id: v(row, 'מזהה') || String(row._row),
    label: v(row, 'כותרת'),
    description: v(row, 'תיאור'),
    details: v(row, 'פרטים'),
    priceNote: v(row, 'הערת מחיר'),
    emoji: (emojiKey && row[emojiKey]) || '✂️',
    images: [row['תמונה1'], row['תמונה2'], row['תמונה3'], row['תמונה4']].map(x => (x || '').trim()).filter(Boolean),
    hidden: isHidden(row),
  };
}

export function rowToCategory(row) {
  const vals = Object.values(row).filter((x, i) => i > 0); // בלי _row
  const key = v(row, 'מזהה_קטגוריה', 'key', 'מפתח') || String(vals[0] || '').trim();
  const image = v(row, 'קישור_לתמונה', 'value', 'ערך') || String(vals[1] || '').trim();
  const label = v(row, 'שם_קטגוריה') || String(vals[2] || '').trim();
  return {
    key, id: key.replace(/^subcat_/, ''), label,
    image: /^https?:/.test(image) ? image : '',
    description: v(row, 'תיאור_קטגוריה'),
    hidden: isHidden(row),
  };
}

export function rowToPickup(row) {
  const vals = Object.values(row).filter((x, i) => i > 0);
  return {
    location: v(row, 'נקודות_מכירה', 'נקודת_מכירה') || String(vals[0] || '').trim(),
    name: v(row, 'שם') || String(vals[1] || '').trim(),
    phone: v(row, 'מספר_פלאפון') || String(vals[2] || '').trim(),
  };
}

/** מהנתונים הגולמיים → מה שהאתר מציג */
export function deriveSite(raw) {
  const settings = settingsMap(raw.settings);
  const content = { ...defaultContent, ...settings };
  const allCats = (raw.categories || []).map(rowToCategory).filter(c => c.key.startsWith('subcat_'));
  allCats.forEach(c => { content[c.key] = c.image; });
  const products = (raw.products || []).filter(r => v(r, 'שם')).map(rowToProduct);
  return {
    settings,
    content,
    allCats,
    subCats: allCats.filter(c => c.image && c.label && !c.hidden),
    products: products.filter(p => !p.hidden),
    pickupPoints: (raw.pickup || []).map(rowToPickup).filter(p => p.location),
  };
}
