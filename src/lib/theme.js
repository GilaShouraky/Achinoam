// ═══ צבעי האתר – נשמרים בהגדרות ומוחלים על משתני ה־CSS ═══

export const COLOR_KEYS = [
  { key: 'color.primary', label: 'צבע ראשי', help: 'כותרות, פס עליון, כפתורים וקולקציות', def: '#8B5A6B' },
  { key: 'color.accent', label: 'צבע הדגשה', help: 'מחירים, תגיות מבצע ומתנות עד 100', def: '#C4861A' },
  { key: 'color.button', label: 'כפתורי ההזמנה', help: 'כפתורי "להמשיך" ו"להשלמת ההזמנה בוואטסאפ"', def: '#1A7A4A' },
  { key: 'color.bg', label: 'רקע האתר', help: 'הרקע הבהיר של כל העמודים', def: '#FAF6F2' },
  { key: 'color.text', label: 'צבע הטקסט', help: 'טקסט רגיל ותיאורים', def: '#2C1F1F' },
  { key: 'color.footer', label: 'רקע הפוטר', help: 'החלק הכהה בתחתית האתר', def: '#2C1F1F' },
];

export const PRESETS = [
  { name: 'המקורי', c: {} },
  { name: 'ורוד וזהב', c: { 'color.primary': '#B0607A', 'color.accent': '#C9A227', 'color.bg': '#FDF7F8', 'color.footer': '#3B2430' } },
  { name: 'ירוק מרווה', c: { 'color.primary': '#5A7A57', 'color.accent': '#C4775A', 'color.bg': '#F7F6F0', 'color.footer': '#26332A', 'color.button': '#3E6B4A' } },
  { name: 'כחול ים', c: { 'color.primary': '#3D6F88', 'color.accent': '#D08C2E', 'color.bg': '#F5F8FA', 'color.footer': '#1E2C35' } },
  { name: 'שחור לבן', c: { 'color.primary': '#2B2B2B', 'color.accent': '#9C7A3C', 'color.bg': '#FAFAFA', 'color.text': '#1A1A1A', 'color.footer': '#111111', 'color.button': '#2B2B2B' } },
];

const valid = (c) => /^#[0-9a-f]{6}$/i.test(String(c || '').trim());
const toRgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** ערבוב צבע עם צבע אחר (amount = כמה מהצבע השני) */
export function mix(a, b, amount) {
  const x = toRgb(a), y = toRgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * amount));
}
const rgba = (h, a) => `rgba(${toRgb(h).join(',')},${a})`;

/** הצבעים בפועל: מה ששמור בהגדרות (או טיוטה), אחרת ברירת המחדל */
export function colorsFrom(settings = {}, draft = {}) {
  const out = {};
  COLOR_KEYS.forEach(({ key, def }) => {
    const v = draft[key] ?? settings[key];
    out[key] = valid(v) ? v.trim() : def;
  });
  return out;
}
export const isCustom = (settings = {}) => COLOR_KEYS.some(({ key }) => valid(settings[key]));

/** מחיל צבעים על האתר. כשלא שונה כלום – מחזיר את המקור בדיוק כמו שהיה */
export function applyTheme(settings = {}, draft = {}) {
  const root = document.documentElement.style;
  const custom = { ...settings, ...draft };
  const vars = {};
  const has = (k) => valid(custom[k]);
  const c = colorsFrom(settings, draft);
  if (has('color.primary')) {
    const p = c['color.primary'];
    Object.assign(vars, {
      '--rose': p, '--rose-light': mix(p, '#ffffff', 0.2), '--rose-pale': mix(p, '#ffffff', 0.85), '--rose-soft': mix(p, '#ffffff', 0.92),
      '--grad-rose': `linear-gradient(135deg, ${p} 0%, ${mix(p, '#000000', 0.22)} 100%)`,
      '--rose-header': `linear-gradient(135deg, ${mix(p, '#ffffff', 0.4)}, ${mix(p, '#ffffff', 0.22)})`,
      '--shadow-sm': `0 3px 14px ${rgba(p, 0.09)}`, '--shadow-md': `0 8px 28px ${rgba(p, 0.13)}`,
      '--shadow-lg': `0 18px 44px ${rgba(p, 0.17)}`, '--shadow-xl': `0 28px 60px ${rgba(p, 0.21)}`,
    });
  }
  if (has('color.accent')) {
    const a = c['color.accent'];
    Object.assign(vars, {
      '--amber': a, '--amber-light': mix(a, '#ffffff', 0.2), '--amber-pale': mix(a, '#ffffff', 0.8), '--amber-soft': mix(a, '#ffffff', 0.9),
      '--grad-amber': `linear-gradient(135deg, ${a} 0%, ${mix(a, '#000000', 0.22)} 100%)`,
    });
  }
  if (has('color.button')) {
    const b = c['color.button'];
    Object.assign(vars, { '--btn-wa': b, '--btn-wa-dark': mix(b, '#000000', 0.25), '--btn-wa-shadow': rgba(b, 0.3) });
  }
  if (has('color.bg')) {
    const g = c['color.bg'];
    Object.assign(vars, { '--linen': g, '--warm-white': mix(g, '#ffffff', 0.6), '--cream': mix(g, '#000000', 0.03), '--parchment': mix(g, '#000000', 0.07),
      '--border': mix(g, '#000000', 0.11), '--border-light': mix(g, '#000000', 0.07) });
  }
  if (has('color.text')) {
    const t = c['color.text'];
    Object.assign(vars, { '--dark': t, '--mid': mix(t, '#ffffff', 0.25), '--light': mix(t, '#ffffff', 0.5) });
  }
  if (has('color.footer')) {
    const f = c['color.footer'];
    vars['--footer-bg'] = `linear-gradient(160deg, ${f} 0%, ${mix(f, '#000000', 0.25)} 100%)`;
  }
  // מנקים משתנים שהוגדרו קודם ולא רלוונטיים יותר
  const ALL = ['--rose', '--rose-light', '--rose-pale', '--rose-soft', '--grad-rose', '--rose-header', '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl',
    '--amber', '--amber-light', '--amber-pale', '--amber-soft', '--grad-amber', '--btn-wa', '--btn-wa-dark', '--btn-wa-shadow',
    '--linen', '--warm-white', '--cream', '--parchment', '--border', '--border-light', '--dark', '--mid', '--light', '--footer-bg'];
  ALL.forEach(v => { if (!(v in vars)) root.removeProperty(v); });
  Object.entries(vars).forEach(([k, v]) => root.setProperty(k, v));
}
