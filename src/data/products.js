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
      { id: 'shabat',       label: 'קולקציית שבת' },
      { id: 'notebooks',    label: 'מחברות ניהול זמן' },
      { id: 'embroidery',   label: 'עבודות ריקמה' },
      { id: 'rikma',         label: 'ריקמה' },
      { id: 'erkat_rikma',   label: 'ערכות ריקמה' },
      { id: 'under100',     label: 'מתנות עד 100 ש"ח' },
      { id: 'bride',        label: 'חבילת כלה' },
    ],
  },
};
