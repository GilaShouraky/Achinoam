import { registerTexts } from './texts';
import { DEFAULT_LOGO, DEFAULT_HERO, DEFAULT_ABOUT_IMG } from '../config';
import { COLOR_KEYS } from './theme';

/**
 * כל הטקסטים והתמונות הקבועים באתר, עם נוסח ברירת המחדל.
 * המפתח (key) הוא מה שנשמר בלשונית "הגדרות" בגיליון.
 * kind: text (ברירת מחדל) | image | link | phone | number
 */

registerTexts('תמונות ולוגו', [
  { key: 'logo_url', kind: 'image', label: 'הלוגו (למעלה, בתפריט ובפוטר)', def: DEFAULT_LOGO, optional: false },
  { key: 'hero_image', kind: 'image', label: 'תמונת הרקע הגדולה בדף הבית', def: DEFAULT_HERO },
  { key: 'about_image', kind: 'image', label: 'התמונה העגולה שלי בדף הבית', def: DEFAULT_ABOUT_IMG },
  { key: 'תמונה_קופצת', kind: 'image', label: 'תמונה קופצת (מוצגת אחרי 3 שניות בכניסה לאתר)', def: '' },
]);

registerTexts('פס עליון וחיפוש', [
  { key: 'banner_text', label: 'פס הודעה בראש האתר (ריק = לא מוצג. אפשר גם קישור לתמונה)', def: '' },
  { key: 'header.search_empty', label: 'חיפוש – כשאין תוצאות', def: 'לא נמצאו מוצרים' },
]);

registerTexts('דף הבית', [
  { key: 'hero_subtitle', label: 'שורה מעל הכותרת הגדולה (מחשב)', def: 'מחפשים מתנה לעצמכם? לאהובים עליכם?' },
  { key: 'hero_subtitle_mobile', label: 'שורה מעל הכותרת הגדולה (טלפון)', def: 'מחפשים מתנה לעצמיכם?\nלאהובים עליכם?', multiline: true },
  { key: 'hero_title', label: 'הכותרת הגדולה על תמונת הרקע', def: 'הגעתם למקום הנכון' },
  { key: 'about_text', label: 'טקסט ההיכרות ליד התמונה שלי', multiline: true,
    def: 'הי, אני אחינועם הר כוכב, יוצרת, גרפיקאית, ואוהבת מאוד אומנות\nיצרתי את העסק שלי מתוך צורך לשדרג את שולחן השבת של ההורים שלי ומשם זה התפתח לרצון של אנשים סביבי לרכוש את המוצרים גם לבית שלהם\nפה בשביל להגשים לכם וליצור עבורכם מתנות לעצמיכם ולסובבים אתכם\nכאן לכל שאלה, בקשה, הערה והארה' },
  { key: 'about_signature', label: 'החתימה מתחת לטקסט', def: 'אחינועם' },
  { key: 'home.collections_title', label: 'כותרת הקולקציות', def: 'הקולקציות שלי' },
  { key: 'home.featured_title', label: 'כותרת המוצרים הנבחרים', def: 'מוצרים נבחרים' },
  { key: 'home.under100_title', label: 'כותרת המתנות הזולות', def: 'מתנות עד {max} ₪', vars: ['max'] },
  { key: 'home.under100_max', kind: 'number', label: 'מחיר מקסימלי ל"מתנות עד…"', def: '100' },
]);

registerTexts('עמוד המוצרים', [
  { key: 'page.products_title', label: 'כותרת עמוד המוצרים', def: 'המוצרים שלי' },
  { key: 'common.back_home', label: 'כפתור חזרה לדף הבית', def: '→ חזרה לדף הבית' },
  { key: 'products.empty', label: 'כשאין מוצרים בקטגוריה', def: 'אין מוצרים בקטגוריה זו עדיין' },
]);

registerTexts('כרטיס ועמוד מוצר', [
  { key: 'product.back', label: 'כפתור חזרה למוצרים', def: '→ חזרה למוצרים' },
  { key: 'product.deal_badge', label: 'תגית מבצע', def: 'מבצע!' },
  { key: 'product.price_note', label: 'כשאין מחיר למוצר', def: 'מחיר לפי הצעה' },
  { key: 'product.price_note_short', label: 'כשאין מחיר – על הכרטיס הקטן', def: 'לפי הצעה' },
  { key: 'product.add', label: 'כפתור הוספה לסל', def: 'הוספה לסל' },
  { key: 'product.added', label: 'אחרי הוספה לסל', def: ' נוסף לסל!' },
  { key: 'product.out', label: 'כשהמוצר אזל', def: 'אזל מהמלאי' },
  { key: 'product.low_stock', label: 'אזהרת מלאי נמוך', def: '⚠️ נשארו רק {n} במלאי', vars: ['n'] },
  { key: 'product.max_stock', label: 'כשבחרו את כל המלאי', def: 'הגעת למקסימום הזמין ({n})', vars: ['n'] },
  { key: 'product.low_stock_from', kind: 'number', label: 'מאיזו כמות להציג "נשארו רק…"', def: '5' },
]);

registerTexts('סל הקניות', [
  { key: 'cart.empty_title', label: 'סל ריק – כותרת', def: 'הסל ריק' },
  { key: 'cart.empty_text', label: 'סל ריק – הסבר', def: 'עדיין לא הוספת מוצרים לסל' },
  { key: 'cart.empty_btn', label: 'סל ריק – כפתור', def: 'לצפייה במוצרים ←' },
  { key: 'cart.back', label: 'כפתור חזרה', def: '→ חזרה לקנייה' },
  { key: 'cart.title', label: 'כותרת', def: 'סל הקניות' },
  { key: 'cart.saved_item', label: 'חיסכון על מוצר', def: 'חסכת ₪{n}', vars: ['n'] },
  { key: 'cart.saved_total', label: 'חיסכון כולל', def: '🎉 חסכת במבצעים:' },
  { key: 'cart.total', label: 'סה"כ', def: 'סה"כ לתשלום:' },
  { key: 'cart.continue', label: 'כפתור המשך', def: 'סיימתי, אני רוצה להמשיך' },
]);

registerTexts('טופס ההזמנה', [
  { key: 'order.title', label: 'כותרת החלון', def: 'רק עוד כמה פרטים אחרונים' },
  { key: 'order.name', label: 'שדה שם', def: 'שם מלא *' },
  { key: 'order.phone', label: 'שדה טלפון', def: 'מספר פלאפון *' },
  { key: 'order.email', label: 'שדה מייל', def: 'מייל *' },
  { key: 'order.delivery_title', label: 'כותרת אופן קבלה', def: 'איך אני רוצה לקבל את ההזמנה שלי?' },
  { key: 'order.delivery_error', label: 'שגיאה – לא נבחר אופן קבלה', def: 'יש לבחור אופן קבלה' },
  { key: 'order.notice', label: 'תיבת "חשוב!" הצהובה', multiline: true, def: '⚠️ חשוב! יש לוודא מלאי עם נקודת המכירה לפני התשלום.\nלמוצרים בעיצוב אישי – כתבו לי בווצאפ: אחינועם 054-8838607' },
  { key: 'order.pickup_prefix', label: 'לפני שם נקודת המכירה', def: "נק' מכירה" },
  { key: 'order.pickup_fallback', label: 'אפשרות איסוף כשאין נקודות בגיליון', def: 'איסוף מבית שמש – רחוב התבור' },
  { key: 'order.notes', label: 'שדה הערות', def: 'הערות להזמנה (לדוגמא אם אתם רוצים לארוז את המתנה בכמה שקיות נפרדות 🛍️)' },
  { key: 'order.pay_title', label: 'כותרת תשלום', def: 'איך אני משלמת? *' },
  { key: 'order.pay_error', label: 'שגיאה – לא נבחר תשלום', def: 'יש לבחור אמצעי תשלום' },
  { key: 'order.receipt', label: 'שדה אסמכתא', def: 'העלאת אסמכתא *' },
  { key: 'order.receipt_ok', label: 'אחרי העלאת אסמכתא', def: 'האסמכתא הועלתה בהצלחה' },
  { key: 'order.receipt_btn', label: 'כפתור העלאת אסמכתא', def: 'לחצי להעלאת תמונת אסמכתא' },
  { key: 'order.uploading', label: 'בזמן העלאה', def: 'מעלה...' },
  { key: 'order.upload_error', label: 'העלאה נכשלה', def: 'ההעלאה נכשלה, נסי שוב' },
  { key: 'order.submit', label: 'כפתור סיום ההזמנה', def: 'להשלמת ההזמנה בוואטסאפ' },
  { key: 'order.wa_intro', label: 'הודעת הוואטסאפ – שורה ראשונה', def: 'היי! אני רוצה להזמין:' },
]);

registerTexts('תשלום', [
  { key: 'pay.paybox_name', label: 'שם אמצעי תשלום 1', def: 'פייבוקס' },
  { key: 'pay.bank_name', label: 'שם אמצעי תשלום 2', def: 'העברה בנקאית' },
  { key: 'paybox_number', kind: 'phone', label: 'מספר פייבוקס', def: '054-8838607' },
  { key: 'pay.paybox_text', label: 'הסבר פייבוקס', def: 'העבירי את הסכום לנייד **{phone}** דרך פייבוקס', vars: ['phone'] },
  { key: 'pay.bank_details', label: 'פרטי הבנק', rich: true, def: '**פרטי בנק להעברה בנקאית:**\nאחינועם הר כוכב\nת.ז/ח.פ 315210989\nבנק יהב 04\nסניף בית שמש 461\nמס׳ חשבון 24154' },
]);

registerTexts('פרטי קשר', [
  { key: 'contact_phone', kind: 'phone', label: 'טלפון', def: '054-8838607' },
  { key: 'whatsapp_number', kind: 'phone', label: 'מספר וואטסאפ', def: '9720548838607', help: 'בפורמט בינלאומי: 972 ואז המספר בלי האפס. למשל 9720548838607', optional: false },
  { key: 'contact_email', kind: 'email', label: 'מייל', def: 'Achinoamharkochav@gmail.com', help: 'כתובת מייל רגילה.' },
  { key: 'contact_address', label: 'כתובת', def: 'רחוב התבור, בית שמש' },
  { key: 'instagram_handle', label: 'שם באינסטגרם', def: '@Achinoam_art_desigh' },
  { key: 'instagram_url', kind: 'link', label: 'קישור לאינסטגרם', def: 'https://www.instagram.com/achinoam_art_desigh?igsh=MTY5a204YTY2b3lnYg==' },
]);

registerTexts('פוטר (תחתית האתר)', [
  { key: 'footer.contact_h', label: 'כותרת צור קשר', def: 'צור קשר' },
  { key: 'footer.nav_h', label: 'כותרת ניווט', def: 'ניווט' },
  { key: 'footer.link_products', label: 'קישור – מוצרים', def: 'המוצרים שלי' },
  { key: 'footer.orders_h', label: 'כותרת להזמנות', def: 'להזמנות' },
  { key: 'footer.wa_btn', label: 'כפתור וואטסאפ', def: 'כתבי לי בוואטסאפ' },
  { key: 'footer.credit', label: 'שורת זכויות יוצרים', def: '© כל הזכויות שמורות לגילה שוראקי' },
]);

registerTexts('תפריט נגישות', [
  { key: 'a11y.title', label: 'כותרת', def: 'נגישות' },
  { key: 'a11y.font', label: 'גודל טקסט', def: 'גודל טקסט' },
  { key: 'a11y.contrast', label: 'ניגודיות', def: 'ניגודיות גבוהה' },
  { key: 'a11y.links', label: 'הדגשת קישורים', def: 'הדגשת קישורים' },
  { key: 'a11y.anim', label: 'עצירת אנימציות', def: 'עצירת אנימציות' },
  { key: 'a11y.reset', label: 'איפוס', def: 'איפוס הכל' },
]);

registerTexts('עיצוב', [
  { key: 'home.show_featured', kind: 'toggle', label: 'להציג את המוצרים הנבחרים בדף הבית', def: 'כן' },
  { key: 'home.show_under100', kind: 'toggle', label: 'להציג את המתנות הזולות בדף הבית', def: 'כן' },
  ...COLOR_KEYS.map(c => ({ ...c, kind: 'color' })),
]);
