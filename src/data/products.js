// ─────────────────────────────────────────────────────────────
//  הגדרות קטגוריות בלבד – נתוני המוצרים עצמם נטענים מ-Google Sheets
//  ראו: src/data/siteContent.js להוראות הגדרה
// ─────────────────────────────────────────────────────────────

export const categories = {
  products: {
    label: 'המוצרים שלי',
    icon: '🎁',
    subCategories: [
      { id: 'pesach',       label: 'קולקציית פסח' },
      { id: 'sof_shana', label: 'קולקציית מתנות סוף שנה' },
      { id: 'chagim',       label: 'קולקציית חגים' },
      { id: 'notebooks',    label: 'מחברות ניהול זמן' },
      { id: 'embroidery',   label: 'עבודות ריקמה' },
      { id: 'under100',     label: 'מתנות עד 100 ש"ח' },
      { id: 'bride',        label: 'חבילת כלה' },
    ],
  },
  graphics: {
    label: 'עבודות גרפיקה',
    icon: '🎨',
    subCategories: [
      { id: 'invitations', label: 'הזמנות לאירועים' },
      { id: 'flyers',      label: 'פלאיירים' },
      { id: 'branding',    label: 'מיתוגים' },
    ],
  },
  workshops: {
    label: 'סדנאות אומנות',
    icon: '✂️',
    subCategories: [
      { id: 'macrame',       label: 'סדנת מקרמה' },
      { id: 'embroidery_ws', label: 'סדנת ריקמה' },
      { id: 'art_general',   label: 'סדנת אומנות כללי' },
    ],
  },
};
