import React, { Suspense, lazy } from 'react';
import Accessibility from './components/Accessibility';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { EditProvider } from './edit/EditContext';
import EditLayer from './edit/EditBar';
import TopBanner from './components/TopBanner';
import Header from './components/Header';
import ContactBanner from './components/ContactBanner';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import './edit/edit.css';
import { applyTheme } from './lib/theme';

/** מחיל את צבעי האתר מההגדרות */
function ThemeApplier() {
  const { settings } = useApp();
  React.useEffect(() => { applyTheme(settings); }, [settings]);
  return null;
}

// מערכת הניהול נטענת רק כשנכנסים אליה – לא מכבידה על הגולשים
const AdminApp = lazy(() => import('./admin/AdminApp'));

// wrapper לעמוד מוצרים עם sub-category מה-URL
function ProductsPageWrapper() {
  const { subCat } = useParams();
  return <ProductsPage key={subCat} subCatOverride={subCat} />;
}

// wrapper לעמוד מוצר — טוען מוצר לפי ID
function ProductPageWrapper() {
  const { productId } = useParams();
  const { products } = useApp();
  const allProducts = products;
  let storedProduct = null;
  try { const stored = sessionStorage.getItem('currentProduct'); storedProduct = stored ? JSON.parse(stored) : null; } catch { /* */ }
  // הנתונים העדכניים מהגיליון גוברים, מה ששמור מוסיף רק את הקטגוריה שממנה הגיעו
  const baseProduct = allProducts.find(p => p.id === productId);
  const product = baseProduct
    ? { ...baseProduct, _fromSubCategory: storedProduct?.id === productId ? storedProduct._fromSubCategory : undefined }
    : storedProduct?.id === productId ? storedProduct : null;
  return <ProductPage key={productId} productOverride={product} />;
}

function SiteLayout() {
  return (
    <div className="site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBanner />
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/products/:subCat?"   element={<ProductsPageWrapper />} />
          <Route path="/product/:productId"  element={<ProductPageWrapper />} />
          <Route path="/cart"                element={<CartPage />} />
          <Route path="*"                    element={<HomePage />} />
        </Routes>
      </main>
      <ContactBanner />
      <Accessibility />
    </div>
  );
}

const AdminLoading = () => <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Heebo, sans-serif', color: '#8B5A6B', direction: 'rtl' }}>טוענת את מערכת הניהול…</div>;

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <EditProvider>
          <ThemeApplier />
          <Routes>
            <Route path="/admin/*" element={<Suspense fallback={<AdminLoading />}><AdminApp /></Suspense>} />
            <Route path="*" element={<SiteLayout />} />
          </Routes>
          <EditLayer />
        </EditProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
