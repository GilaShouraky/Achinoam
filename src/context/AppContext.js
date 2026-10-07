import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadRawFromCSV, deriveSite, settingsMap } from '../data/siteContent';
import { call, isAdmin as isAdminNow, setPassword, track } from '../lib/api';
import { resolveText } from '../lib/texts';
import { ORDERS_SCRIPT_URL, ADMIN_SCRIPT_URL, DEFAULT_LOGO, ID_COL } from '../config';
import '../lib/textCatalog';

const AppContext = createContext();
const EMPTY_RAW = { settings: [], products: [], categories: [], pickup: [] };

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [raw, setRaw] = useState(EMPTY_RAW);
  const [adminData, setAdminData] = useState(null); // הזמנות, יומן, כניסות... (רק למנהלת)
  const [live, setLive] = useState(false);          // true = הנתונים נטענו ישירות מהסקריפט
  const [admin, setAdmin] = useState(isAdminNow());
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const rawRef = useRef(raw);
  rawRef.current = raw;

  const reactNavigate = useNavigate();
  const location = useLocation();

  /** טעינה: מנהלת → מהסקריפט (בזמן אמת). אחרת → CSV שפורסם */
  const reload = useCallback(async ({ quiet } = {}) => {
    if (isAdminNow()) {
      try {
        const r = await call('getAll');
        const { orders = [], log = [], visits = [], views = [], ...sheets } = r.data;
        setRaw({ ...EMPTY_RAW, ...sheets });
        setAdminData({ orders, log, visits, views, info: r.info, spreadsheetUrl: r.spreadsheetUrl, spreadsheetName: r.spreadsheetName, version: r.version, at: Date.now() });
        setLive(true); setLoadError(null); setAdmin(true);
        return true;
      } catch (e) {
        if (e.auth) { setAdmin(false); setAdminData(null); }
        setLoadError(e.message);
        if (quiet) return false;
      }
    }
    const csv = await loadRawFromCSV();
    setRaw(csv); setLive(false);
    return true;
  }, []);

  useEffect(() => {
    reload().finally(() => setDataLoaded(true));
    let counted = false;
    try { counted = sessionStorage.getItem('ach_counted') === '1'; sessionStorage.setItem('ach_counted', '1'); } catch { /* */ }
    if (!isAdminNow() && !counted) {
      // ספירת כניסות (פעם אחת בכל ביקור)
      if (ADMIN_SCRIPT_URL) track('countVisit');
      else fetch(ORDERS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ type: 'countVisit' }) }).catch(() => {});
    }
  }, [reload]);

  const site = useMemo(() => deriveSite(raw), [raw]);

  /** שמות העמודות בפועל בלשונית הקטגוריות (יש גיליונות עם key/value) */
  const cols = useMemo(() => {
    const h = adminData?.info?.categories?.headers || Object.keys(raw.categories?.[0] || {}).filter(k => k !== '_row');
    const pick = (opts, i) => opts.find(o => h.includes(o)) || h[i] || opts[0];
    return {
      categories: { id: pick(['מזהה_קטגוריה', 'key', 'מפתח'], 0), image: pick(['קישור_לתמונה', 'value', 'ערך'], 1), label: pick(['שם_קטגוריה'], 2) },
    };
  }, [adminData, raw.categories]);
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const { content, products, subCats, pickupPoints, settings } = site;
  const t = useCallback((key, vars) => resolveText(settings, key, vars), [settings]);

  // ─── כניסה / יציאה של מנהלת ─────────────────────────────
  const login = useCallback(async (pw) => {
    await call('login', {}, { password: pw });
    setPassword(pw); setAdmin(true);
    await reload();
  }, [reload]);
  const logout = useCallback(() => { setPassword(''); setAdmin(false); setAdminData(null); setLive(false); }, []);

  // ─── פעולות עריכה (עדכון מיידי במסך + שמירה לגיליון) ─────────
  const patchRaw = useCallback((sheet, fn) => setRaw(r => ({ ...r, [sheet]: fn(r[sheet] || []) })), []);

  const ops = useMemo(() => {
    const idColOf = (sheet) => (sheet === 'categories' ? colsRef.current.categories.id : ID_COL[sheet]);
    const guard = async (fn, rollback) => {
      try { return await fn(); }
      catch (e) { if (rollback) setRaw(rollback); throw e; }
    };
    return {
      async saveSettings(values) {
        const before = rawRef.current;
        patchRaw('settings', rows => {
          const next = rows.map(r => ({ ...r }));
          Object.entries(values).forEach(([k, v]) => {
            const row = next.find(r => (r.key ?? r['מפתח']) === k);
            if (row) { if ('value' in row || !('ערך' in row)) row.value = v; else row['ערך'] = v; }
            else next.push({ key: k, value: v });
          });
          return next;
        });
        return guard(() => call('setSettings', { values }), before);
      },
      async resetSettings(keys) {
        const before = rawRef.current;
        patchRaw('settings', rows => rows.filter(r => !keys.includes(r.key ?? r['מפתח'])));
        return guard(() => call('deleteSettings', { keys }), before);
      },
      /** שמירת שורה (מוצר / קטגוריה / סדנה). מחזיר את המזהה */
      async saveRow(sheet, row, opts = {}) {
        const idCol = idColOf(sheet);
        const before = rawRef.current;
        const isNew = !row[idCol];
        if (!isNew) patchRaw(sheet, rows => rows.map(r => (String(r[idCol]) === String(row[idCol]) ? { ...r, ...row } : r)));
        const res = await guard(() => call('saveRow', { sheet, idCol, row, position: opts.position, newId: opts.newId }), before);
        if (isNew) {
          const full = { ...row, [idCol]: res.id };
          patchRaw(sheet, rows => (opts.position === 'top' ? [full, ...rows] : [...rows, full]));
        }
        return res.id;
      },
      async deleteRow(sheet, id) {
        const idCol = idColOf(sheet);
        const before = rawRef.current;
        patchRaw(sheet, rows => rows.filter(r => String(r[idCol]) !== String(id)));
        return guard(() => call('deleteRow', { sheet, idCol, id }), before);
      },
      async reorder(sheet, ids) {
        const idCol = idColOf(sheet);
        const before = rawRef.current;
        patchRaw(sheet, rows => [...rows].sort((a, b) => {
          let ia = ids.indexOf(String(a[idCol])), ib = ids.indexOf(String(b[idCol]));
          if (ia === -1) ia = 1e6; if (ib === -1) ib = 1e6;
          return ia - ib;
        }));
        return guard(() => call('reorder', { sheet, idCol, ids }), before);
      },
      async replaceRows(sheet, rows) {
        const before = rawRef.current;
        patchRaw(sheet, () => rows);
        return guard(() => call('replaceRows', { sheet, rows }), before);
      },
      async orderUpdate(order, fields) {
        const check = {};
        Object.keys(order).filter(k => !k.startsWith('_') && !(k in fields)).slice(0, 3).forEach(k => { check[k] = order[k]; });
        setAdminData(d => d && ({ ...d, orders: d.orders.map(o => (o._row === order._row ? { ...o, ...fields } : o)) }));
        return call('orderUpdate', { row: order._row, fields, check });
      },
    };
  }, [patchRaw]);

  // ─── navigate helper ─────────────────────────────────────
  const navigate = (pageName, data = null) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pageName === 'home') return reactNavigate('/');
    if (pageName === 'cart') return reactNavigate('/cart');
    // עמודים שהוסרו (קולקציות, גרפיקה, סדנאות, אודות, צור קשר) → המוצרים
    if (pageName === 'products' || pageName === 'category') return reactNavigate(`/products/${data?.subCategory || ''}`);
    if (pageName === 'product') {
      try { sessionStorage.setItem('currentProduct', JSON.stringify(data)); } catch { /* */ }
      return reactNavigate(`/product/${data.id}`);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.id !== productId));
  const clearCart = () => setCart([]);

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ─── עזר: כמות כוללת של קבוצת מבצע בסל ─────────────────────
  const getGroupQty = (currentCart, groupName) =>
    currentCart.filter(i => i.dealGroup === groupName).reduce((sum, i) => sum + i.quantity, 0);

  // כמה פריטים מוזלים מגיעים למוצר זה — לפי סדר בסל
  const getDiscountedQtyForItem = (item, currentCart) => {
    const groupQty = getGroupQty(currentCart, item.dealGroup);
    const totalDiscounted = Math.floor(groupQty / item.dealQty) * item.dealQty;
    if (totalDiscounted === 0) return 0;
    let remaining = totalDiscounted;
    for (const cartItem of currentCart) {
      if (cartItem.dealGroup !== item.dealGroup) continue;
      if (cartItem.id === item.id) {
        return Math.min(cartItem.quantity, Math.max(0, remaining));
      }
      remaining -= cartItem.quantity;
      if (remaining <= 0) return 0;
    }
    return 0;
  };

  // מבצע mix: כמות הסטים = מינימום בין תת-קבוצות (לפי סוג_מבצע)
  // לדוגמא: runner + challah — חייב לפחות אחד מכל סוג
  const getMixDealSets = (currentCart, groupName) => {
    const groupItems = currentCart.filter(i => i.dealGroup === groupName && i.dealType);
    const types = [...new Set(groupItems.map(i => i.dealType))];
    if (types.length < 2) return 0; // חייב לפחות 2 סוגים שונים
    // כמות לכל סוג = סכום הכמויות של כל המוצרים באותו סוג
    const qtyByType = {};
    groupItems.forEach(i => {
      qtyByType[i.dealType] = (qtyByType[i.dealType] || 0) + i.quantity;
    });
    return Math.min(...Object.values(qtyByType));
  };

  // חישוב מחיר עם מבצעים (כולל מבצע קבוצתי)
  const calcItemTotal = (item, currentCart = cart) => {
    const qty = item.quantity;
    const basePrice = Number(item.price);

    if (item.dealQty && item.dealPrice) {
      if (item.dealGroup && item.dealType && item.dealType !== '') {
        // מבצע mix: ההנחה לפי מינימום בין תת-קבוצות
        const sets = getMixDealSets(currentCart, item.dealGroup);
        const discountedQty = Math.min(qty, sets);
        const dealPricePerItem = item.dealPrice / item.dealQty;
        return discountedQty * dealPricePerItem + (qty - discountedQty) * basePrice;
      } else if (item.dealGroup) {
        const discountedQty = getDiscountedQtyForItem(item, currentCart);
        const dealPricePerItem = item.dealPrice / item.dealQty;
        return discountedQty * dealPricePerItem + (qty - discountedQty) * basePrice;
      } else {
        if (qty >= item.dealQty) {
          const dealSets = Math.floor(qty / item.dealQty);
          return dealSets * item.dealPrice + (qty % item.dealQty) * basePrice;
        }
      }
    }
    return basePrice * qty;
  };

  const calcItemSaving = (item, currentCart = cart) => {
    const qty = item.quantity;
    const basePrice = Number(item.price);

    if (item.dealQty && item.dealPrice) {
      if (item.dealGroup && item.dealType && item.dealType !== '') {
        const sets = getMixDealSets(currentCart, item.dealGroup);
        const discountedQty = Math.min(qty, sets);
        const dealPricePerItem = item.dealPrice / item.dealQty;
        return discountedQty * (basePrice - dealPricePerItem);
      } else if (item.dealGroup) {
        const discountedQty = getDiscountedQtyForItem(item, currentCart);
        const dealPricePerItem = item.dealPrice / item.dealQty;
        return discountedQty * (basePrice - dealPricePerItem);
      } else {
        if (qty >= item.dealQty) {
          const dealSets = Math.floor(qty / item.dealQty);
          return dealSets * (item.dealQty * basePrice - item.dealPrice);
        }
      }
    }
    return 0;
  };


  const cartTotal = cart.reduce((sum, item) => sum + calcItemTotal(item, cart), 0);
  const cartSavings = cart.reduce((sum, item) => sum + calcItemSaving(item, cart), 0);

  if (!dataLoaded) {
    const logo = settingsMap(raw.settings).logo_url || DEFAULT_LOGO;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Heebo, sans-serif', gap: '20px', background: '#F5F0F2', direction: 'rtl' }}>
        <img src={logo} alt="אחינועם" style={{ height: window.innerWidth <= 600 ? '180px' : '110px', width: 'auto', objectFit: 'contain' }} />
        <p style={{ fontSize: '18px', color: 'var(--rose)', fontWeight: 500 }}>האתר של אחינועם נטען...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      navigate, location,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, cartSavings, calcItemTotal, calcItemSaving,
      content, products, dataLoaded, subCats, pickupPoints,
      settings, t, site, raw, cols, adminData, live, admin, login, logout, reload, ops, loadError,
      formatPrice: (n) => Number.isInteger(n) ? n : parseFloat(Number(n).toFixed(1)),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
/** פונקציית טקסט: t('home.title') */
export const useT = () => useContext(AppContext).t;
