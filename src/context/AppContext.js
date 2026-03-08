import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  loadContentFromSheets, defaultContent,
  loadProductsFromSheets,
  loadGraphicsFromSheets,
  loadWorkshopsFromSheets,
  loadSubCategoriesFromSheets,
} from '../data/siteContent';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart]               = useState([]);
  const [content, setContent]         = useState(defaultContent);
  const [products, setProducts]       = useState([]);
  const [graphics, setGraphics]       = useState([]);
  const [workshops, setWorkshops]     = useState([]);
  const [dataLoaded, setDataLoaded]   = useState(false);

  const reactNavigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      loadContentFromSheets(),
      loadProductsFromSheets(),
      loadGraphicsFromSheets(),
      loadWorkshopsFromSheets(),
      loadSubCategoriesFromSheets(),
    ]).then(([c, p, g, w, subcats]) => {
      setContent({ ...c, ...subcats });
      setProducts(p);
      setGraphics(g);
      setWorkshops(w);
      setDataLoaded(true);
    }).catch(err => {
      console.error('[AppContext] Error loading data:', err);
      setDataLoaded(true);
    });
  }, []);

  // ─── navigate helper: תומך בכל הסוגים ─────────────────────
  const navigate = (pageName, data = null) => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageName === 'home')      return reactNavigate('/');
    if (pageName === 'about')     return reactNavigate('/about');
    if (pageName === 'contact')   return reactNavigate('/contact');
    if (pageName === 'cart')      return reactNavigate('/cart');

    if (pageName === 'category')  return reactNavigate(`/category/${data}`);
    if (pageName === 'products')  return reactNavigate(`/products/${data?.subCategory || ''}`);
    if (pageName === 'graphics')  return reactNavigate(`/graphics/${data?.subCategory || ''}`);
    if (pageName === 'workshops') return reactNavigate(`/workshops/${data?.subCategory || ''}`);

    if (pageName === 'product') {
      // שומר את המוצר ב-sessionStorage לגישה מדף המוצר
      sessionStorage.setItem('currentProduct', JSON.stringify(data));
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

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ─── עזר: כמות כוללת של קבוצת מבצע בסל ─────────────────────
  const getGroupQty = (currentCart, groupName) =>
    currentCart.filter(i => i.dealGroup === groupName).reduce((sum, i) => sum + i.quantity, 0);

  // חישוב מחיר עם מבצעים (כולל מבצע קבוצתי)
  const calcItemTotal = (item, currentCart = cart) => {
    const qty = item.quantity;
    const basePrice = Number(item.price);

    if (item.dealQty && item.dealPrice) {
      // קבוצתי – סופר את כל הקבוצה
      const countQty = item.dealGroup
        ? getGroupQty(currentCart, item.dealGroup)
        : qty;

      const totalDiscounted = Math.floor(countQty / item.dealQty) * item.dealQty;
      if (totalDiscounted === 0) return basePrice * qty;

      const dealPricePerItem = item.dealPrice / item.dealQty;

      if (item.dealGroup) {
        // מחלק יחסית — כמה מהפריטים של המוצר הזה נופלים בתוך ה-totalDiscounted
        const ratio = totalDiscounted / countQty;
        const discountedQty = Math.min(qty, Math.floor(ratio * qty + 0.5));
        return discountedQty * dealPricePerItem + (qty - discountedQty) * basePrice;
      } else {
        // פרטני — ישן
        const dealSets = Math.floor(qty / item.dealQty);
        return dealSets * item.dealPrice + (qty % item.dealQty) * basePrice;
      }
    }

    return basePrice * qty;
  };

  const calcItemSaving = (item, currentCart = cart) => {
    const qty = item.quantity;
    const basePrice = Number(item.price);

    if (item.dealQty && item.dealPrice) {
      const countQty = item.dealGroup
        ? getGroupQty(currentCart, item.dealGroup)
        : qty;

      const totalDiscounted = Math.floor(countQty / item.dealQty) * item.dealQty;
      if (totalDiscounted === 0) return 0;

      const dealPricePerItem = item.dealPrice / item.dealQty;

      if (item.dealGroup) {
        const ratio = totalDiscounted / countQty;
        const discountedQty = Math.min(qty, Math.floor(ratio * qty + 0.5));
        return discountedQty * (basePrice - dealPricePerItem);
      } else {
        const dealSets = Math.floor(qty / item.dealQty);
        return dealSets * (item.dealQty * basePrice - item.dealPrice);
      }
    }

    return 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + calcItemTotal(item, cart), 0);
  const cartSavings = cart.reduce((sum, item) => sum + calcItemSaving(item, cart), 0);

  if (!dataLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Heebo, sans-serif', gap: '16px', background: '#F5F0F2', direction: 'rtl' }}>
        <div style={{ fontSize: '48px' }}>🌿</div>
        <p style={{ fontSize: '18px', color: '#6B6B6B', fontWeight: 500 }}>טוענת את האתר…</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      navigate, location,
      sidebarOpen, setSidebarOpen,
      cart, addToCart, removeFromCart, updateQuantity,
      cartCount, cartTotal, cartSavings, calcItemTotal, calcItemSaving,
      content, products, graphics, workshops, dataLoaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
