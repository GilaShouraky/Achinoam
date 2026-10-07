# אתר אחינועם הר כוכב 🌿
## מתנות | עיצוב אישי | סדנאות

---

## 🚀 הפעלה מהירה

```bash
# 1. כנס לתיקיית הפרויקט
cd achinoam-site

# 2. התקן dependencies
npm install

# 3. הפעל שרת פיתוח
npm start
```

האתר יפתח אוטומטית בכתובת: **http://localhost:3000**

---

## 🛠️ מערכת ניהול (חדש)

- כניסה: `כתובת-האתר/admin`
- התקנה וחיבור לגיליון: ראו **מדריך-התקנה.md**
- הסקריפט של מערכת הניהול: `google-apps-script/admin.gs`
- הכתובת שלו מודבקת ב־`src/config.js`

```
src/
├── config.js             ← כתובת הסקריפט + מזהי הגיליון
├── lib/textCatalog.js    ← כל הטקסטים באתר ונוסח ברירת המחדל שלהם
├── lib/api.js            ← דיבור עם הסקריפט, העלאת תמונות
├── edit/                 ← מצב עריכה על האתר (טקסטים ותמונות)
├── admin/                ← מערכת הניהול (קטלוג, הזמנות, טקסטים, חיבורים, מעקב)
└── ui/                   ← רכיבים משותפים (חלונות, מתגים, בחירת תמונה)
```

---

## 📁 מבנה הקבצים

```
src/
├── App.jsx                  ← ראוטר ראשי
├── index.js                 ← נקודת כניסה
├── index.css                ← סגנונות גלובליים + CSS Variables
│
├── context/
│   └── AppContext.js        ← ניהול state גלובלי (ניווט, סל קניות)
│
├── data/
│   ├── siteContent.js       ← ⭐ חיבור Google Sheets + תוכן ברירת מחדל
│   └── products.js          ← רשימת קטגוריות גיבוי (אם הגיליון לא נטען)
│
├── components/
│   ├── TopBanner.jsx        ← באנר "משלוח חינם"
│   ├── Header.jsx           ← הדר עם לוגו + המבורגר
│   ├── ContactBanner.jsx    ← פוטר עם פרטי יצירת קשר
│   └── ProductCard.jsx      ← כרטיס מוצר לשימוש חוזר
│
└── pages/
    ├── HomePage.jsx         ← דף בית
    ├── ProductsPage.jsx     ← רשימת מוצרים עם פילטר
    ├── ProductPage.jsx      ← עמוד מוצר בודד
    └── CartPage.jsx         ← סל קניות
```

---

## 🔗 חיבור Google Sheets (עריכת תוכן בזמן אמת)

### שלב 1 – צור Google Sheet

צור גיליון חדש עם שתי עמודות:

| key | value |
|-----|-------|
| banner_text | 🚚 משלוח חינם בקנייה מעל 150 ש"ח |
| hero_title | מחפשים מתנה לעצמכם? |
| about_text | הי, אני אחינועם... |
| about_signature | אחינועם |
| contact_phone | 054-8838607 |
| contact_email | Achinoamharkochav@gmail.com |
| contact_address | רחוב התבור, בית שמש |
| whatsapp_number | 9720548838607 |
| graphics_intro | כמה מילים ממני... |
| footer_credit | כל הזכויות שמורות © אחינועם הר כוכב |

### שלב 2 – פרסם את הגיליון

`File` → `Share` → `Publish to web` → בחר `Sheet1` ו-`CSV` → לחץ `Publish`

### שלב 3 – הדבק את ה-URL

בקובץ `src/data/siteContent.js`:
```js
export const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/...';
```

מעכשיו כל שינוי ב-Google Sheets יופיע באתר בטעינה הבאה! 🎉

---

## 🖼️ הוספת תמונות למוצרים

בקובץ `src/data/products.js`, לכל מוצר יש מערך `images`:

```js
{
  id: 1,
  name: 'קערת ליל הסדר',
  images: [
    '/images/products/seder-plate-1.jpg',
    '/images/products/seder-plate-2.jpg',
  ],
}
```

שים את התמונות בתיקיה `public/images/products/`.

---

## 🎨 שינוי צבעים

כל הצבעים נמצאים ב-`src/index.css`:

```css
:root {
  --deep-sage: #5A7A57;    /* ירוק כהה – ראשי */
  --terracotta: #C4775A;   /* חום-כתום – מחיר, כפתורים */
  --gold: #C9A84C;         /* זהב – אקסנטים */
  --cream: #FAF7F2;        /* רקע בהיר */
}
```

---

## 📦 בניה לפרודקשן

```bash
npm run build
```

הקבצים יווצרו בתיקיית `build/` ומוכנים לעלייה לאחסון.

---

**עוצב באהבה 🌿**
