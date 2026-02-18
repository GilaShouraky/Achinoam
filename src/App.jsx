import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TopBanner from './components/TopBanner';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ContactBanner from './components/ContactBanner';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import GraphicsPage from './pages/GraphicsPage';
import WorkshopsPage from './pages/WorkshopsPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function Router() {
  const { page } = useApp();

  const pageMap = {
    home:      <HomePage />,
    category:  <CategoryPage />,   // ← intermediate sub-category selector
    products:  <ProductsPage />,
    product:   <ProductPage />,
    graphics:  <GraphicsPage />,
    workshops: <WorkshopsPage />,
    cart:      <CartPage />,
    about:     <AboutPage />,
    contact:   <ContactPage />,
  };

  return pageMap[page] || <HomePage />;
}

export default function App() {
  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBanner />
        <Header />
        <Sidebar />
        <main style={{ flex: 1 }}>
          <Router />
        </main>
        <ContactBanner />
      </div>
    </AppProvider>
  );
}
