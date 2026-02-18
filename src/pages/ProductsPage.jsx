import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';

export default function ProductsPage() {
  const { navigate, pageData } = useApp();
  const [activeSubCat, setActiveSubCat] = useState(
    pageData?.subCategory || categories.products.subCategories[0].id
  );

  useEffect(() => {
    if (pageData?.subCategory) setActiveSubCat(pageData.subCategory);
  }, [pageData]);

  const filtered = products.filter(p => p.category === activeSubCat);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '32px 36px 24px' }}>
        <div
          onClick={() => navigate('home')}
          style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '8px', cursor: 'pointer' }}
        >
          ← חזרה לדף הבית
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900', color: 'var(--dark)' }}>
          המוצרים שלי
        </h1>
      </div>

      {/* Sub categories */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '24px 36px', maxWidth: '1100px', margin: '0 auto' }}>
        {categories.products.subCategories.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubCat(sub.id)}
            style={{
              padding: '9px 20px',
              border: `2px solid ${activeSubCat === sub.id ? 'var(--deep-sage)' : 'var(--light-border)'}`,
              borderRadius: '24px',
              background: activeSubCat === sub.id ? 'var(--deep-sage)' : 'white',
              color: activeSubCat === sub.id ? 'white' : 'var(--dark)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '20px',
        padding: '10px 36px 60px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        {filtered.length > 0
          ? filtered.map(p => <ProductCard key={p.id} product={p} />)
          : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--light)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p>אין עדיין מוצרים בקטגוריה זו</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
