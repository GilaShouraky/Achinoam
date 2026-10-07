import React from 'react';

/**
 * כל טקסט באתר רשום כאן עם מפתח קבוע ונוסח ברירת מחדל.
 * נוסח שנערך נשמר בלשונית "הגדרות" בגיליון (key / value) וגובר על ברירת המחדל.
 */
const REG = new Map();
const ORDER = [];

/**
 * @param {string} group  קבוצה ברשימה (למשל "דף הבית")
 * @param {Array<{key:string,def:string,label:string,multiline?:boolean,rich?:boolean,vars?:string[],kind?:'text'|'image'|'link'|'phone'|'number'}>} entries
 */
export function registerTexts(group, entries) {
  for (const e of entries) {
    if (!REG.has(e.key)) ORDER.push(e.key);
    REG.set(e.key, { kind: 'text', ...e, group });
  }
}
export const allTexts = () => ORDER.map(k => REG.get(k));
export const textEntry = (k) => REG.get(k);

export function fill(s, vars) {
  if (!vars) return s;
  return String(s).replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/** הנוסח הנוכחי: מהגיליון אם נערך, אחרת ברירת המחדל */
export function resolveText(settings, key, vars) {
  const raw = settings[key] ?? REG.get(key)?.def ?? '';
  return fill(raw, vars);
}

/** טקסט עשיר פשוט: **מודגש**, שורות "- " כרשימה, שורה ריקה = פסקה חדשה */
export function Rich({ text }) {
  const blocks = [];
  const lines = String(text).replace(/\r/g, '').split('\n');
  let list = [], para = [];
  const flushList = () => { if (list.length) { blocks.push(<ul key={blocks.length} className="rich-list">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; } };
  const flushPara = () => { if (para.length) { blocks.push(<p key={blocks.length}>{para.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{inline(l)}</React.Fragment>)}</p>); para = []; } };
  for (const line of lines) {
    const m = line.match(/^\s*[-•]\s+(.*)$/);
    if (m) { flushPara(); list.push(m[1]); }
    else if (!line.trim()) { flushList(); flushPara(); }
    else { flushList(); para.push(line); }
  }
  flushList(); flushPara();
  return <>{blocks}</>;
}

export function inline(s) {
  const parts = String(s).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <b key={i}>{p.slice(2, -2)}</b> : <React.Fragment key={i}>{p}</React.Fragment>));
}

/** ירידות שורה ו**הדגשה** בטקסט רגיל */
export function withBreaks(s) {
  const str = String(s);
  if (!str.includes('\n')) return str.includes('**') ? inline(str) : str;
  return str.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{inline(line)}</React.Fragment>);
}
