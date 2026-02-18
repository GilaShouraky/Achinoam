import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadContentFromSheets, defaultContent } from '../data/siteContent';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [page, setPage] = useState('home');          // current page
  const [pageData, setPageData] = useState(null);    // extra data for page
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [content, setContent] = useState(defaultContent);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Load content from Google Sheets on mount
  useEffect(() => {
    loadContentFromSheets().then(data => {
      setContent(data);
      setContentLoaded(true);
    });
  }, []);

  // Navigate to a page with optional data
  const navigate = (pageName, data = null) => {
    setPage(pageName);
    setPageData(data);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider value={{
      page, navigate,
      pageData,
      sidebarOpen, setSidebarOpen,
      cart, addToCart, removeFromCart, updateQuantity,
      cartCount, cartTotal,
      content, contentLoaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
