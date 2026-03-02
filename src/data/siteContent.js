// ═══════════════════════════════════════════════════════
//  Google Sheets – קישורי ה-CSV של הגיליון שלך
// ═══════════════════════════════════════════════════════
const SHEET_ID = '2PACX-1vTzHSA8raPYkB3EaYN8ovRX_LU1wYhKXJ4LjNSjFl8LSDOlj1osu4ziirzAoHkJ_VDsWxo-FcDI65qv';

export const SHEETS = {
  settings:  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=0&single=true&output=csv`,
  products:  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=1740173305&single=true&output=csv`,
  graphics:  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=1174110383&single=true&output=csv`,
  workshops: `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=1001488632&single=true&output=csv`,
  // גיליון "קטגוריות ראשיות" – תעדכני את ה-gid אחרי שתוסיפי את הגיליון
  subCategories: `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=2111774314&single=true&output=csv`,
};

// CORS proxy – מאפשר לדפדפן לקרוא את הגיליון
const PROXY = 'https://corsproxy.io/?';

// ─── ערכי ברירת מחדל למלל בלבד (לא מוצרים) ─────────────────
export const defaultContent = {
  banner_text:     '',
  hero_subtitle:   'מחפשים מתנה לעצמכם? לאהובים עליכם?',
  hero_title:      'הגעתם למקום הנכון',
  about_text:      'הי, אני אחינועם הר כוכב, יוצרת, גרפיקאית, ואוהבת מאוד אומנות\nיצרתי את העסק שלי מתוך צורך לשדרג את שולחן השבת של ההורים שלי ומשם זה התפתח לרצון של אנשים סביבי לרכוש את המוצרים גם לבית שלהם\nפה בשביל להגשים לכם וליצור עבורכם מתנות לעצמיכם ולסובבים אתכם\nכאן לכל שאלה, בקשה, הערה והארה',
  about_signature: 'אחינועם',
  contact_phone:   '054-8838607',
  contact_email:   'Achinoamharkochav@gmail.com',
  contact_address: 'רחוב התבור, בית שמש',
  whatsapp_number: '9720548838607',
  graphics_intro:  'כמה מילים ממני… כל עבודה מעוצבת עם אהבה ותשומת לב לפרטים הקטנים. צרו איתי קשר ונתאים יחד את העיצוב המושלם עבורכם.',
  footer_credit:   'כל הזכויות שמורות © אחינועם הר כוכב',
  // תמונות לכרטיסי קטגוריה (אופציונלי – אם ריק יוצג האמוג'י)
  cat_products_image:  '',
  cat_graphics_image:  '',
  cat_workshops_image: '',
  // פס תחתון: קישור לתמונה = מציג תמונה, טקסט = מציג טקסט, ריק = לא מוצג
  bottom_banner:       '',
  // כותרות עמודי קטגוריה (ניתן לעריכה בגוגל שיטס)
  products_page_title:  'המוצרים שלי',
  graphics_page_title:  'עבודות גרפיקה',
  workshops_page_title: 'סדנאות אומנות',
  workshops_title:      'סדנאות אומנות',
  // תמונות תת-קטגוריות (נטענות מגיליון "קטגוריות ראשיות")
  subcat_pesach:        '',
  subcat_sof_shana:     '',
  subcat_chagim:        '',
  subcat_notebooks:     '',
  subcat_embroidery:    '',
  subcat_under100:      '',
  subcat_bride:         '',
  subcat_invitations:   '',
  subcat_flyers:        '',
  subcat_branding:      '',
  subcat_macrame:       '',
  subcat_embroidery_ws: '',
  subcat_art_general:   '',
  // מזהי מוצרים נבחרים (מופרדים בפסיק, לדוגמה: 1,3,5,7)
  featured_ids:        '',
};

// ─── פירוק שורת CSV ──────────────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ─── קריאת CSV דרך proxy ──────────────────────────────────────
async function fetchCSV(url) {
  let text;
  let source = 'direct';

  console.log('🔄 מנסה לטעון:', url);

  try {
    const res = await fetch(url);
    console.log('📡 סטטוס ישיר:', res.status);
    text = await res.text();
    console.log('📄 100 תווים ראשונים:', text.substring(0, 100));
    if (text.trim().startsWith('<')) {
      console.warn('⚠️ קיבלתי HTML - עובר ל-proxy');
      throw new Error('got HTML');
    }
  } catch (e) {
    source = 'proxy';
    console.log('🔀 מנסה דרך proxy...');
    try {
      const proxyUrl = PROXY + encodeURIComponent(url);
      const res2 = await fetch(proxyUrl);
      console.log('📡 סטטוס proxy:', res2.status);
      text = await res2.text();
      console.log('📄 proxy - 100 תווים:', text.substring(0, 100));
    } catch (e2) {
      console.error('❌ גם proxy נכשל:', e2.message);
      throw e2;
    }
  }

  const lines = text.trim().split('\n').filter(l => l.trim());
  console.log('✅ מקור:', source, '| שורות:', lines.length);

  if (lines.length < 2) {
    console.warn('⚠️ גיליון ריק');
    return [];
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  console.log('📋 כותרות:', headers);

  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  });
}


// ─── המרות שורה → אובייקט ────────────────────────────────────

function rowToProduct(row) {
  const emojiKey = Object.keys(row).find(k => k.includes('אמוג'));
  const rawPrice = (row['מחיר'] || '').trim();
  const rawPriceNote = (row['הערת מחיר'] || '').trim();
  const price = rawPrice ? Number(rawPrice) : 0;

  // אם יש מחיר – הוא תמיד גובר. הערת מחיר רלוונטית רק כשאין מחיר.
  const priceNote = price > 0 ? '' : (rawPriceNote || 'מחיר לפי הצעה');

  return {
    id:          (row['מזהה'] || '').trim()    || String(Math.random()),
    category:    (row['קטגוריה'] || '').trim() || '',
    name:        (row['שם'] || '').trim()       || '',
    description: (row['תיאור'] || '').trim()    || '',
    price,
    priceNote,
    emoji:       (emojiKey && row[emojiKey].trim()) || '🎁',
    images:      [row['תמונה1'], row['תמונה2'], row['תמונה3']].filter(Boolean),
  };
}

function rowToWorkshop(row) {
  const emojiKey = Object.keys(row).find(k => k.includes('אמוג'));
  return {
    id:          row['מזהה']       || '',
    label:       row['כותרת']      || '',
    description: row['תיאור']      || '',
    details:     row['פרטים']      || '',
    priceNote:   row['הערת מחיר'] || '',
    emoji:       (emojiKey && row[emojiKey]) || '✂️',
    images:      [row['תמונה1'], row['תמונה2'], row['תמונה3']].filter(Boolean),
  };
}

function rowToSetting(row) {
  // תומך גם בכותרות אנגלית (key/value) וגם עברית (מפתח/ערך)
  return {
    key:   row['key']   || row['מפתח'] || '',
    value: row['value'] || row['ערך']  || '',
  };
}

// ─── פונקציות טעינה ציבוריות ────────────────────────────────

// ─── טעינת תמונות קטגוריות ראשיות ─────────────────────────────
export async function loadSubCategoriesFromSheets() {
  // קורא מגיליון ההגדרות הקיים — שורות שהמפתח שלהן מתחיל ב-subcat_
  try {
    const rows = await fetchCSV(SHEETS.settings);
    const result = {};
    rows.forEach(row => {
      const { key, value } = rowToSetting(row);
      if (key && key.startsWith('subcat_') && value && value.startsWith('http')) {
        result[key] = value;
      }
    });
    console.log('[subcat] loaded from settings:', result);
    return result;
  } catch (err) {
    console.warn('שגיאה בטעינת subcat:', err);
    return {};
  }
}

export async function loadContentFromSheets() {
  try {
    const rows = await fetchCSV(SHEETS.settings);
    const content = { ...defaultContent };
    rows.forEach(row => {
      const { key, value } = rowToSetting(row);
      if (key && value) content[key] = value;
    });
    return content;
  } catch (err) {
    console.warn('שגיאה בטעינת הגדרות:', err);
    return defaultContent;
  }
}

export async function loadProductsFromSheets() {
  try {
    const rows = await fetchCSV(SHEETS.products);
    return rows.filter(r => r['שם']).map(rowToProduct);
  } catch (err) {
    console.warn('שגיאה בטעינת מוצרים:', err);
    return [];
  }
}

export async function loadGraphicsFromSheets() {
  try {
    const rows = await fetchCSV(SHEETS.graphics);
    return rows.filter(r => r['שם']).map(rowToProduct);
  } catch (err) {
    console.warn('שגיאה בטעינת גרפיקה:', err);
    return [];
  }
}

export async function loadWorkshopsFromSheets() {
  try {
    const rows = await fetchCSV(SHEETS.workshops);
    return rows.filter(r => r['כותרת']).map(rowToWorkshop);
  } catch (err) {
    console.warn('שגיאה בטעינת סדנאות:', err);
    return [];
  }
}
