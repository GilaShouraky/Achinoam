/**
 * GOOGLE SHEETS INTEGRATION
 * ─────────────────────────
 * 1. צרו Google Sheet חדש
 * 2. הוסיפו שני עמודות: "key" ו-"value"
 * 3. מלאו את הנתונים לפי המבנה שבדוגמא
 * 4. פרסמו את הגיליון: File → Share → Publish to web → CSV
 * 5. הדביקו את ה-URL בתוך SHEETS_CSV_URL למטה
 * 6. ה-SHEET_ID נמצא ב-URL של הגיליון שלכם
 *
 * דוגמא לשורות בגיליון:
 * key                    | value
 * banner_text            | משלוח חינם בקנייה מעל 150 ש"ח
 * hero_subtitle           | מחפשים מתנה לעצמכם? לאהובים עליכם?
 * hero_title             | הגעתם למקום הנכון
 * about_text             | הי, אני אחינועם...
 * contact_phone          | 054-8838607
 * contact_email          | Achinoamharkochav@gmail.com
 * contact_address        | רחוב התבור, בית שמש
 */

export const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1TO_yfSLpdZobY_TvWatOkZrunVqwuERBynBonOOEU6o/edit?usp=sharing'; // הדביקו כאן את ה-URL מ-Google Sheets

// ─── ברירות מחדל ─────────────────────────────────────────────
export const defaultContent = {
  banner_text: '🚚 משלוח חינם בקנייה מעל 150 ש"ח',

  hero_subtitle: 'מחפשים מתנה לעצמכם? לאהובים עליכם?',
  hero_title: 'הגעתם למקום הנכון',

  about_text: `הי, אני אחינועם הר כוכב, יוצרת, גרפיקאית, ואוהבת מאוד אומנות
יצרתי את העסק שלי מתוך צורך לשדרג את שולחן השבת של ההורים שלי ומשם זה התפתח לרצון של אנשים סביבי לרכוש את המוצרים גם לבית שלהם
פה בשביל להגשים לכם וליצור עבורכם מתנות לעצמיכם ולסובבים אתכם
כאן לכל שאלה, בקשה, הערה והארה`,

  about_signature: 'אחינועם',

  contact_phone: '054-8838607',
  contact_email: 'Achinoamharkochav@gmail.com',
  contact_address: 'רחוב התבור, בית שמש',

  
  whatsapp_number: '9720548838607',

  graphics_intro: 'כמה מילים ממני… כל עבודה מעוצבת עם אהבה ותשומת לב לפרטים הקטנים. צרו איתי קשר ונתאים יחד את העיצוב המושלם עבורכם.',

  footer_credit: 'כל הזכויות שמורות © אחינועם הר כוכב',
};

// ─── פונקציית טעינה מ-Google Sheets ─────────────────────────
export async function loadContentFromSheets() {
  if (!SHEETS_CSV_URL) return defaultContent;

  try {
    const res = await fetch(SHEETS_CSV_URL);
    const text = await res.text();
    const lines = text.split('\n').slice(1); // דלג על שורת הכותרת
    const content = { ...defaultContent };

    lines.forEach(line => {
      const [key, ...rest] = line.split(',');
      const value = rest.join(',').replace(/^"|"$/g, '').trim();
      if (key && value) {
        content[key.trim()] = value;
      }
    });

    return content;
  } catch (err) {
    console.warn('Could not load from Google Sheets, using defaults.', err);
    return defaultContent;
  }
}
