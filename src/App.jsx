import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
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

// wrapper לעמוד קטגוריה — מקבל catKey מה-URL
function CategoryPageWrapper() {
  const { catKey } = useParams();
  const { products, graphics, workshops, content, navigate } = useApp();
  return <CategoryPage catKeyOverride={catKey} />;
}

// wrapper לעמוד מוצרים עם sub-category מה-URL
function ProductsPageWrapper() {
  const { subCat } = useParams();
  return <ProductsPage subCatOverride={subCat} />;
}
function GraphicsPageWrapper() {
  const { subCat } = useParams();
  return <GraphicsPage subCatOverride={subCat} />;
}
function WorkshopsPageWrapper() {
  const { subCat } = useParams();
  return <WorkshopsPage subCatOverride={subCat} />;
}

// wrapper לעמוד מוצר — טוען מוצר לפי ID
function ProductPageWrapper() {
  const { productId } = useParams();
  const { products, graphics } = useApp();
  const allProducts = [...products, ...graphics];
  // מנסה למצוא מה-state, אחרת מהנתונים
  const stored = sessionStorage.getItem('currentProduct');
  const storedProduct = stored ? JSON.parse(stored) : null;
  // מעדיף את הנתון מ-sessionStorage כי הוא מכיל _fromSubCategory
  const baseProduct = allProducts.find(p => p.id === productId);
  const product = (storedProduct?.id === productId)
    ? { ...baseProduct, ...storedProduct }
    : (baseProduct || storedProduct);
  return <ProductPage productOverride={product} />;
}

function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBanner />
      <Header />
      <Sidebar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/category/:catKey"    element={<CategoryPageWrapper />} />
          <Route path="/products/:subCat?"   element={<ProductsPageWrapper />} />
          <Route path="/graphics/:subCat?"   element={<GraphicsPageWrapper />} />
          <Route path="/workshops/:subCat?"  element={<WorkshopsPageWrapper />} />
          <Route path="/product/:productId"  element={<ProductPageWrapper />} />
          <Route path="/cart"                element={<CartPage />} />
          <Route path="*"                    element={<HomePage />} />
        </Routes>
      </main>
      <ContactBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}
