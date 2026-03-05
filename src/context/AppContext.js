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

  // חישוב מחיר עם מבצעים
  const calcItemTotal = (item) => {
    const qty = item.quantity;
    const basePrice = Number(item.price);
    if (item.dealQty && item.dealPrice && qty >= item.dealQty) {
      const dealSets = Math.floor(qty / item.dealQty);
      const remainder = qty % item.dealQty;
      return dealSets * item.dealPrice + remainder * basePrice;
    }
    return basePrice * qty;
  };

  const calcItemSaving = (item) => {
    const qty = item.quantity;
    const basePrice = Number(item.price);
    if (item.dealQty && item.dealPrice && qty >= item.dealQty) {
      const dealSets = Math.floor(qty / item.dealQty);
      return dealSets * (item.dealQty * basePrice - item.dealPrice);
    }
    return 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const cartSavings = cart.reduce((sum, item) => sum + calcItemSaving(item), 0);

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
