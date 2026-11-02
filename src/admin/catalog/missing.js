import { NO_PRICE } from '../../data/siteContent';

const isNum = (s) => /^\d+(\.\d+)?$/.test(String(s ?? '').trim());
const isInt = (s) => /^\d+$/.test(String(s ?? '').trim());

/** אילו פרטי חובה חסרים במוצר (שורה מהגיליון). catIds = מזהי הקטגוריות הקיימות */
export function missingFields(row, catIds) {
  const out = [];
  if (!String(row['שם'] || '').trim()) out.push('שם');
  const cat = String(row['קטגוריה'] || '').trim();
  if (!cat || !catIds.includes(cat)) out.push('קטגוריה');
  const price = String(row['מחיר'] ?? '').trim();
  if (price && !isNum(price)) out.push('מחיר');
  if (!isInt(row['כמות_במלאי'])) out.push('מלאי');
  const dq = String(row['מבצע_כמות'] ?? '').trim(), dp = String(row['מבצע_מחיר'] ?? '').trim();
  if ((dq || dp) && (!isInt(dq) || !isNum(dp))) out.push('מבצע');
  return out;
}
export { NO_PRICE };
