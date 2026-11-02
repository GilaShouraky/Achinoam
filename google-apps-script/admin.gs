/**
 * ═══════════════════════════════════════════════════════════════
 *  אחינועם – סקריפט מערכת הניהול
 *  ---------------------------------------------------------------
 *  זה סקריפט נפרד ועצמאי. הוא לא נוגע בסקריפט הקיים של ההזמנות.
 *  מה צריך למלא (פעם אחת):
 *    1. SPREADSHEET_ID – המזהה של הגיליון (מתוך הכתובת שלו)
 *    2. ADMIN_PASSWORD – הסיסמה לכניסה למערכת הניהול
 *  ואז: פריסה ← פריסה חדשה ← אפליקציית אינטרנט
 *        הפעלה בתור: אני  |  גישה: כל אחד
 * ═══════════════════════════════════════════════════════════════
 */

var SPREADSHEET_ID = 'הדביקי_כאן_את_מזהה_הגיליון';
var ADMIN_PASSWORD = 'בחרי_סיסמה_חזקה';

/** הלשוניות בגיליון לפי gid (המספר שמופיע בכתובת אחרי gid=) */
var SHEETS = {
  settings:   { gid: 0,          name: 'הגדרות' },
  products:   { gid: 1740173305, name: 'מוצרים' },
  graphics:   { gid: 1174110383, name: 'גרפיקה' },
  workshops:  { gid: 1001488632, name: 'סדנאות' },
  categories: { gid: 118345411,  name: 'קטגוריות ראשיות' },
  pickup:     { gid: 58180684,   name: 'נקודות איסוף' },
  orders:     { gid: 650143375,  name: 'הזמנות' },
};
/** לשוניות שהסקריפט יוצר לבד אם הן לא קיימות */
var EXTRA = {
  log:    { name: 'יומן שינויים', headers: ['תאריך', 'פעולה', 'פרטים'] },
  visits: { name: 'כניסות', headers: ['תאריך', 'כניסות'] },
  views:  { name: 'צפיות במוצרים', headers: ['מזהה', 'שם', 'צפיות'] },
};
var DRIVE_FOLDER = 'תמונות לאתר אחינועם';
var SCRIPT_VERSION = '1.0';

/* ─────────────────────────── כניסה ─────────────────────────── */

function doGet() {
  return json({ ok: true, version: SCRIPT_VERSION, msg: 'הסקריפט של מערכת הניהול פעיל ✓' });
}

function doPost(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'בקשה לא תקינה' }); }
  try {
    // פעולות ציבוריות (מהאתר עצמו)
    if (data.type === 'countVisit') return json(countVisit());
    if (data.type === 'viewProduct') return json(viewProduct(data));
    if (data.type === 'ping') return json({ ok: true, version: SCRIPT_VERSION });

    // כל השאר – רק עם סיסמה
    var auth = checkPassword(data.password);
    if (auth) return json({ ok: false, error: auth, auth: true });

    switch (data.type) {
      case 'login':        return json({ ok: true, version: SCRIPT_VERSION });
      case 'getAll':       return json(getAll());
      case 'setSettings':  return json(withLock(function () { return setSettings(data.values || {}); }));
      case 'deleteSettings': return json(withLock(function () { return deleteSettings(data.keys || []); }));
      case 'saveRow':      return json(withLock(function () { return saveRow(data); }));
      case 'deleteRow':    return json(withLock(function () { return deleteRow(data); }));
      case 'reorder':      return json(withLock(function () { return reorder(data); }));
      case 'replaceRows':  return json(withLock(function () { return replaceRows(data); }));
      case 'orderUpdate':  return json(withLock(function () { return orderUpdate(data); }));
      case 'uploadImage':  return json(uploadImage(data));
      case 'changePassword': return json({ ok: false, error: 'את הסיסמה משנים בתוך הסקריפט עצמו (ADMIN_PASSWORD)' });
      default:             return json({ ok: false, error: 'פעולה לא מוכרת: ' + data.type });
    }
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** הגנה מניחוש סיסמה: אחרי 8 ניסיונות שגויים – חסימה ל־15 דקות */
function checkPassword(pw) {
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('fails') || 0);
  if (fails >= 8) return 'יותר מדי ניסיונות שגויים. נסי שוב בעוד רבע שעה.';
  if (String(pw || '') !== String(ADMIN_PASSWORD)) {
    cache.put('fails', String(fails + 1), 900);
    return 'סיסמה שגויה';
  }
  if (fails) cache.remove('fails');
  return null;
}

function withLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { var r = fn(); SpreadsheetApp.flush(); return r; } finally { lock.releaseLock(); }
}

/* ─────────────────────────── עזרים ─────────────────────────── */

function ss() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function sheetOf(key) {
  var def = SHEETS[key];
  var book = ss();
  if (def) {
    var all = book.getSheets();
    for (var i = 0; i < all.length; i++) if (all[i].getSheetId() === def.gid) return all[i];
    var byName = book.getSheetByName(def.name);
    if (byName) return byName;
    throw new Error('לא נמצאה לשונית "' + def.name + '" בגיליון');
  }
  var ex = EXTRA[key];
  if (!ex) throw new Error('לשונית לא מוכרת: ' + key);
  var sh = book.getSheetByName(ex.name);
  if (!sh) { sh = book.insertSheet(ex.name); sh.appendRow(ex.headers); sh.setFrozenRows(1); }
  return sh;
}

function headersOf(sh) {
  var lc = sh.getLastColumn();
  if (!lc) return [];
  return sh.getRange(1, 1, 1, lc).getValues()[0].map(function (h) { return String(h).trim(); });
}

/** מוסיף עמודות שחסרות בכותרת */
function ensureHeaders(sh, names) {
  var h = headersOf(sh);
  names.forEach(function (n) {
    if (n && n.charAt(0) !== '_' && h.indexOf(n) === -1) { h.push(n); sh.getRange(1, h.length).setValue(n); }
  });
  return h;
}

function cellStr(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  return v === null || v === undefined ? '' : String(v);
}


/** ערך לתא: מספר נשאר מספר, כל השאר נשמר כטקסט (כדי ש־054… או 1/2 לא ישתנו) */
function toCell(v) {
  if (v === null || v === undefined) return { v: '', f: 'General' };
  if (v instanceof Date) return { v: v, f: 'dd/MM/yyyy' };
  var s = String(v);
  if (/^(0|[1-9]\d{0,14})(\.\d+)?$/.test(s)) return { v: Number(s), f: 'General' };
  if (s.charAt(0) === '=') s = "'" + s;
  return { v: s, f: '@' };
}
function writeLine(sh, r, line) {
  var cells = line.map(toCell);
  var rg = sh.getRange(r, 1, 1, cells.length);
  rg.setNumberFormats([cells.map(function (c) { return c.f; })]);
  rg.setValues([cells.map(function (c) { return c.v; })]);
}

function readRows(sh) {
  var lr = sh.getLastRow(), lc = sh.getLastColumn();
  if (lr < 2 || !lc) return [];
  var h = headersOf(sh);
  var vals = sh.getRange(2, 1, lr - 1, lc).getValues();
  var out = [];
  vals.forEach(function (r, i) {
    if (!r.some(function (c) { return String(c).trim() !== ''; })) return;
    var o = { _row: i + 2 };
    h.forEach(function (k, j) { if (k) o[k] = cellStr(r[j]); });
    out.push(o);
  });
  return out;
}

function findRow(sh, col, id) {
  var h = headersOf(sh);
  var c = h.indexOf(col);
  if (c === -1) return -1;
  var lr = sh.getLastRow();
  if (lr < 2) return -1;
  var vals = sh.getRange(2, c + 1, lr - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]).trim() === String(id).trim()) return i + 2;
  return -1;
}

function log(action, details) {
  try {
    var sh = sheetOf('log');
    sh.insertRowAfter(1);
    sh.getRange(2, 1, 1, 3).setValues([[new Date(), action, String(details || '').slice(0, 500)]]);
    if (sh.getLastRow() > 600) sh.deleteRows(601, sh.getLastRow() - 600);
  } catch (e) { /* היומן לא אמור לעצור שמירה */ }
}

/* ───────────────────────── קריאת הכול ───────────────────────── */

function getAll() {
  var res = { ok: true, version: SCRIPT_VERSION, data: {}, info: {} };
  Object.keys(SHEETS).forEach(function (k) {
    try {
      var sh = sheetOf(k);
      res.data[k] = readRows(sh);
      res.info[k] = { name: sh.getName(), rows: res.data[k].length, headers: headersOf(sh), ok: true };
    } catch (e) {
      res.data[k] = [];
      res.info[k] = { ok: false, error: String(e.message || e) };
    }
  });
  ['log', 'visits', 'views'].forEach(function (k) {
    try { res.data[k] = readRows(sheetOf(k)).slice(0, k === 'log' ? 80 : 400); } catch (e) { res.data[k] = []; }
  });
  var book = ss();
  res.spreadsheetUrl = book.getUrl();
  res.spreadsheetName = book.getName();
  return res;
}

/* ───────────────────────── הגדרות וטקסטים ───────────────────────── */

function settingsCols(sh) {
  var h = headersOf(sh);
  var k = h.indexOf('key'); if (k === -1) k = h.indexOf('מפתח');
  var v = h.indexOf('value'); if (v === -1) v = h.indexOf('ערך');
  if (k === -1 || v === -1) {
    if (!h.length || !h[0]) { sh.getRange(1, 1, 1, 2).setValues([['key', 'value']]); return { k: 0, v: 1 }; }
    return { k: 0, v: 1 };
  }
  return { k: k, v: v };
}

function setSettings(values) {
  var sh = sheetOf('settings');
  var c = settingsCols(sh);
  var lr = sh.getLastRow();
  var keys = lr > 1 ? sh.getRange(2, c.k + 1, lr - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); }) : [];
  var changed = [];
  Object.keys(values).forEach(function (key) {
    var val = values[key] === null || values[key] === undefined ? '' : String(values[key]);
    var idx = keys.indexOf(key);
    if (idx === -1) {
      var row = sh.getLastRow() + 1;
      sh.getRange(row, c.k + 1).setValue(key);
      sh.getRange(row, c.v + 1).setNumberFormat('@').setValue(val);
      keys.push(key);
    } else {
      sh.getRange(idx + 2, c.v + 1).setNumberFormat('@').setValue(val);
    }
    changed.push(key);
  });
  log('עריכת טקסט', changed.map(function (k) { return k + ' = ' + String(values[k]).slice(0, 60); }).join(' | '));
  return { ok: true };
}

function deleteSettings(keysToDelete) {
  var sh = sheetOf('settings');
  var c = settingsCols(sh);
  var lr = sh.getLastRow();
  if (lr < 2) return { ok: true };
  var keys = sh.getRange(2, c.k + 1, lr - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); });
  for (var i = keys.length - 1; i >= 0; i--) if (keysToDelete.indexOf(keys[i]) !== -1) sh.deleteRow(i + 2);
  log('חזרה לנוסח המקורי', keysToDelete.join(', '));
  return { ok: true };
}

/* ───────────────────────── שורות (מוצרים, קטגוריות...) ───────────────────────── */

function nextId(sh, col) {
  var max = 0;
  readRows(sh).forEach(function (r) { var n = Number(r[col]); if (!isNaN(n) && n > max) max = n; });
  return String(max + 1);
}

/** שמירת שורה לפי מזהה. אם אין מזהה – נוצרת שורה חדשה */
function saveRow(d) {
  var sh = sheetOf(d.sheet);
  var col = d.idCol;
  var row = d.row || {};
  var h = ensureHeaders(sh, Object.keys(row).concat([col]));
  var isNew = !row[col];
  if (isNew) row[col] = d.newId || nextId(sh, col);
  var r = isNew ? -1 : findRow(sh, col, row[col]);
  var line;
  if (r === -1) {
    line = h.map(function (k) { return row[k] === undefined ? '' : row[k]; });
    if (d.position === 'top' && sh.getLastRow() >= 2) { sh.insertRowBefore(2); r = 2; }
    else r = sh.getLastRow() + 1;
  } else {
    line = sh.getRange(r, 1, 1, h.length).getValues()[0];
    h.forEach(function (k, i) { if (row[k] !== undefined) line[i] = row[k]; });
  }
  writeLine(sh, r, line);
  log(isNew ? 'הוספה' : 'עדכון', SHEETS[d.sheet] ? SHEETS[d.sheet].name + ': ' + (row['שם'] || row['כותרת'] || row['שם_קטגוריה'] || row[col]) : d.sheet);
  return { ok: true, id: row[col] };
}

function deleteRow(d) {
  var sh = sheetOf(d.sheet);
  var r = findRow(sh, d.idCol, d.id);
  if (r === -1) return { ok: false, error: 'השורה לא נמצאה (אולי כבר נמחקה)' };
  var h = headersOf(sh);
  var vals = sh.getRange(r, 1, 1, h.length).getValues()[0];
  var name = vals[h.indexOf('שם')] || vals[h.indexOf('כותרת')] || vals[h.indexOf('שם_קטגוריה')] || d.id;
  sh.deleteRow(r);
  log('מחיקה', (SHEETS[d.sheet] ? SHEETS[d.sheet].name : d.sheet) + ': ' + name);
  return { ok: true };
}

/** שינוי סדר השורות לפי רשימת מזהים (שורות שלא ברשימה נשארות בסוף) */
function reorder(d) {
  var sh = sheetOf(d.sheet);
  var lr = sh.getLastRow(), lc = sh.getLastColumn();
  if (lr < 3) return { ok: true };
  var h = headersOf(sh);
  var c = h.indexOf(d.idCol);
  if (c === -1) return { ok: false, error: 'עמודת מזהה לא נמצאה' };
  var range = sh.getRange(2, 1, lr - 1, lc);
  var vals = range.getValues();
  var fmls = range.getFormulas();
  var rows = vals.map(function (r, i) { return { id: String(r[c]).trim(), v: r.map(function (x, j) { return fmls[i][j] || x; }) }; });
  var order = (d.ids || []).map(String);
  rows.sort(function (a, b) {
    var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    if (ia === -1) ia = 1e6; if (ib === -1) ib = 1e6;
    return ia - ib;
  });
  range.setValues(rows.map(function (r) { return r.v; }));
  log('שינוי סדר', SHEETS[d.sheet] ? SHEETS[d.sheet].name : d.sheet);
  return { ok: true };
}

/** החלפת כל השורות בלשונית (משמש לנקודות איסוף) */
function replaceRows(d) {
  var sh = sheetOf(d.sheet);
  var rows = d.rows || [];
  var keys = {};
  rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (k.charAt(0) !== '_') keys[k] = 1; }); });
  var h = ensureHeaders(sh, Object.keys(keys));
  var lr = sh.getLastRow();
  if (lr > 1) sh.getRange(2, 1, lr - 1, Math.max(sh.getLastColumn(), 1)).clearContent();
  rows.forEach(function (r, i) { writeLine(sh, i + 2, h.map(function (k) { return r[k] === undefined ? '' : r[k]; })); });
  log('עדכון', (SHEETS[d.sheet] ? SHEETS[d.sheet].name : d.sheet) + ' (' + rows.length + ')');
  return { ok: true };
}

/* ───────────────────────── הזמנות ───────────────────────── */

function orderUpdate(d) {
  var sh = sheetOf('orders');
  var r = Number(d.row);
  if (!r || r < 2 || r > sh.getLastRow()) return { ok: false, error: 'ההזמנה לא נמצאה' };
  var h = headersOf(sh);
  // בדיקה שזו אותה הזמנה (אם בינתיים נוספו/נמחקו שורות)
  if (d.check) {
    var vals = sh.getRange(r, 1, 1, h.length).getValues()[0].map(cellStr);
    var same = Object.keys(d.check).every(function (k) { var i = h.indexOf(k); return i === -1 || vals[i] === d.check[k]; });
    if (!same) return { ok: false, error: 'ההזמנות בגיליון השתנו. רענני את הרשימה ונסי שוב.' };
  }
  var fields = d.fields || {};
  h = ensureHeaders(sh, Object.keys(fields));
  Object.keys(fields).forEach(function (k) { sh.getRange(r, h.indexOf(k) + 1).setValue(fields[k]); });
  log('הזמנה', 'שורה ' + r + ': ' + Object.keys(fields).map(function (k) { return k + ' = ' + fields[k]; }).join(', '));
  return { ok: true };
}

/* ───────────────────────── תמונות ───────────────────────── */

function folder() {
  var it = DriveApp.getFoldersByName(DRIVE_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER);
}

function uploadImage(d) {
  if (!d.data) return { ok: false, error: 'לא התקבלה תמונה' };
  var bytes = Utilities.base64Decode(String(d.data).replace(/^data:[^,]+,/, ''));
  if (bytes.length > 8 * 1024 * 1024) return { ok: false, error: 'התמונה גדולה מדי' };
  var blob = Utilities.newBlob(bytes, d.mime || 'image/jpeg', (d.name || 'image') + '');
  var file = folder().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  log('העלאת תמונה', file.getName());
  return { ok: true, id: file.getId(), url: 'https://lh3.googleusercontent.com/d/' + file.getId() };
}

/* ───────────────────────── מעקב (מהאתר) ───────────────────────── */

function today() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }

function countVisit() {
  return withLock(function () {
    var sh = sheetOf('visits');
    var t = today();
    var top = sh.getLastRow() >= 2 ? cellDate(sh.getRange(2, 1).getValue()) : '';
    if (top === t) sh.getRange(2, 2).setValue(Number(sh.getRange(2, 2).getValue() || 0) + 1);
    else { sh.insertRowAfter(1); sh.getRange(2, 1, 1, 2).setNumberFormat('@').setValues([[t, 1]]); sh.getRange(2, 2).setNumberFormat('0'); }
    return { ok: true };
  });
}
function cellDate(v) { return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(v); }

function viewProduct(d) {
  if (!d.id) return { ok: false };
  return withLock(function () {
    var sh = sheetOf('views');
    var r = findRow(sh, 'מזהה', d.id);
    if (r === -1) sh.appendRow([String(d.id), String(d.name || '').slice(0, 80), 1]);
    else sh.getRange(r, 3).setValue(Number(sh.getRange(r, 3).getValue() || 0) + 1);
    return { ok: true };
  });
}

/** להרצה ידנית מתוך העורך – בודק שהכול מחובר ונותן הרשאות */
function test() {
  var r = getAll();
  Logger.log('הגיליון: ' + r.spreadsheetName);
  Object.keys(r.info).forEach(function (k) { Logger.log(k + ': ' + JSON.stringify(r.info[k])); });
  Logger.log('תיקיית תמונות: ' + folder().getName());
}
