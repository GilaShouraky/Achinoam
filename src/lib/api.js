import { ADMIN_SCRIPT_URL } from '../config';

const PW_KEY = 'ach_admin_pw';

export const adminConfigured = () => !!ADMIN_SCRIPT_URL;

export function getPassword() {
  try { return localStorage.getItem(PW_KEY) || ''; } catch { return ''; }
}
export function setPassword(pw) {
  try { pw ? localStorage.setItem(PW_KEY, pw) : localStorage.removeItem(PW_KEY); } catch { /* מצב פרטי */ }
}
export const isAdmin = () => adminConfigured() && !!getPassword();

/** קריאה לסקריפט. text/plain כדי שגוגל לא יחסום (בלי בקשת preflight) */
export async function call(type, payload = {}, { password } = {}) {
  if (!ADMIN_SCRIPT_URL) throw new Error('הסקריפט של מערכת הניהול עדיין לא חובר (config.js)');
  let res;
  try {
    res = await fetch(ADMIN_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, type, password: password ?? getPassword() }),
    });
  } catch {
    throw new Error('אין חיבור לגוגל. בדקי את האינטרנט ונסי שוב.');
  }
  let data;
  try { data = await res.json(); } catch { throw new Error('תשובה לא צפויה מהסקריפט. ודאי שהפריסה היא "אפליקציית אינטרנט" עם גישה ל"כל אחד".'); }
  if (!data.ok) {
    const err = new Error(data.error || 'שגיאה לא ידועה');
    err.auth = !!data.auth;
    if (data.auth && type !== 'login') setPassword('');
    throw err;
  }
  return data;
}

/** אירועים מהאתר (כניסה, צפייה במוצר) – בלי סיסמה, בלי לחכות לתשובה */
export function track(type, payload = {}) {
  if (!ADMIN_SCRIPT_URL || isAdmin()) return;
  try {
    fetch(ADMIN_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...payload, type }) }).catch(() => {});
  } catch { /* */ }
}

/** הקטנת תמונה לפני העלאה (עד 1600px) והחזרה כ־base64 */
export function shrinkImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) { reject(new Error('אפשר להעלות רק תמונות')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('לא הצלחתי לקרוא את הקובץ'));
    reader.onload = () => {
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') { resolve({ data: reader.result, mime: file.type }); return; }
      const img = new Image();
      img.onerror = () => reject(new Error('הקובץ לא נראה כמו תמונה'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        const ctx = c.getContext('2d');
        const png = file.type === 'image/png';
        if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve({ data: c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.86), mime: png ? 'image/png' : 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file) {
  const { data, mime } = await shrinkImage(file);
  const name = (file.name || 'image').replace(/\.[^.]+$/, '') + (mime === 'image/png' ? '.png' : '.jpg');
  const r = await call('uploadImage', { data, mime, name: `${new Date().toISOString().slice(0, 10)} ${name}` });
  return r.url;
}
