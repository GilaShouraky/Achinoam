import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loadContentFromSheets, defaultContent,
  loadProductsFromSheets,
  loadGraphicsFromSheets,
  loadWorkshopsFromSheets,
} from '../data/siteContent';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [page, setPage]               = useState('home');
  const [pageData, setPageData]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart]               = useState([]);

  // מתחילים עם ריק – הנתונים מגיעים רק מגוגל שיטס
  const [content, setContent]     = useState(defaultContent);
  const [products, setProducts]   = useState([]);
  const [graphics, setGraphics]   = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      loadContentFromSheets(),
      loadProductsFromSheets(),
      loadGraphicsFromSheets(),
      loadWorkshopsFromSheets(),
    ]).then(([c, p, g, w]) => {
      setContent(c);
      setProducts(p);
      setGraphics(g);
      setWorkshops(w);
      setDataLoaded(true);
    }).catch(err => {
      console.error('שגיאה כללית בטעינת נתונים:', err);
      setDataLoaded(true);
    });
  }, []);

  const navigate = (pageName, data = null) => {
    setPage(pageName);
    setPageData(data);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  // מסך טעינה עד שהנתונים מגיעים
  if (!dataLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Heebo, sans-serif',
        gap: '16px',
        background: '#F5F0F2',
        direction: 'rtl',
      }}>
        <div style={{ fontSize: '48px' }}>🌿</div>
        <p style={{ fontSize: '18px', color: '#6B6B6B', fontWeight: 500 }}>
          טוענת את האתר…
        </p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      page, navigate,
      pageData,
      sidebarOpen, setSidebarOpen,
      cart, addToCart, removeFromCart, updateQuantity,
      cartCount, cartTotal,
      content,
      products,
      graphics,
      workshops,
      dataLoaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
