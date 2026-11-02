// ═══════════════════════════════════════════════════════════════
//  הגדרות חיבור – זה המקום היחיד שצריך לעדכן
// ═══════════════════════════════════════════════════════════════

/**
 * הכתובת של סקריפט מערכת הניהול (google-apps-script/admin.gs).
 * מקבלים אותה אחרי "פריסה ← פריסה חדשה ← אפליקציית אינטרנט".
 * כל עוד זה ריק – האתר עובד כרגיל, ומסך הניהול יציג הוראות חיבור.
 */
const PASTE_SCRIPT_URL_HERE = 'https://script.google.com/macros/s/AKfycbxDIjeb9cnO2dNq1VJpHAWO0WZ17XysY2ZyOcf7_7ndeKl2ABd5g1om03YRFX7r4PYN/exec';   // ← להדביק כאן, בין הגרשיים

export const ADMIN_SCRIPT_URL = PASTE_SCRIPT_URL_HERE || process.env.REACT_APP_ADMIN_SCRIPT_URL || '';

/** הסקריפט הקיים של ההזמנות והמלאי – לא לשנות */
export const ORDERS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmJ7b0E2NiuntAbE1XGk8UGGCarLNMsP3yPVN_n8wJXIhTljCZmTGj28A6zspRpdCP/exec';

/** המזהה של הגיליון כפי שפורסם לאינטרנט (קבצי CSV) */
export const PUBLISHED_SHEET_ID = '2PACX-1vTzHSA8raPYkB3EaYN8ovRX_LU1wYhKXJ4LjNSjFl8LSDOlj1osu4ziirzAoHkJ_VDsWxo-FcDI65qv';

export const GIDS = {
  settings: 0,
  products: 1740173305,
  categories: 118345411,
  pickup: 58180684,
};

/** שמות העמודות בגיליונות */
export const ID_COL = {
  products: 'מזהה',
  categories: 'מזהה_קטגוריה',
};

export const DEFAULT_LOGO = 'https://i.ibb.co/6R35Qkzt/4.png';
export const DEFAULT_HERO = 'https://i.ibb.co/CK4VYPTt/Whats-App-Image-2026-03-01-at-03-16-12.jpg';
export const DEFAULT_ABOUT_IMG = 'https://i.ibb.co/tGZ15BS/Whats-App-Image-2026-05-13-at-00-21-53.jpg';
