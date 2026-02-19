import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/products';

export default function GraphicsPage() {
  const { navigate, content, pageData, graphics: products } = useApp();
  const [activeSubCat, setActiveSubCat] = useState(
    pageData?.subCategory || categories.graphics.subCategories[0].id
  );

  const filtered = products.filter(p => p.category === activeSubCat);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--light-border)', padding: '32px 36px 24px' }}>
        <div onClick={() => navigate('home')} style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '8px', cursor: 'pointer' }}>
          ← חזרה לדף הבית
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900', color: 'var(--dark)' }}>
          עבודות גרפיקה
        </h1>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 36px 0' }}>
        {/* "כמה מילים ממני" */}
        <div style={{
          background: 'white',
          border: '1px solid var(--light-border)',
          borderRadius: '20px',
          padding: '36px 40px',
          marginBottom: '28px',
          textAlign: 'right',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '5px', height: '100%',
            background: 'linear-gradient(to bottom, var(--terracotta), var(--gold))',
          }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', marginBottom: '14px', color: 'var(--dark)' }}>
            כמה מילים ממני…
          </h2>
          <p style={{ fontSize: '15px', lineHeight: '1.9', color: 'var(--mid)' }}>
            {content.graphics_intro}
          </p>
          <a
            href={`https://wa.me/${content.whatsapp_number}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#25D366',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '18px',
            }}
          >
            💬 להזמנה בוואטסאפ
          </a>
        </div>

        {/* Bride package banner */}
        <div
          onClick={() => navigate('products', { subCategory: 'bride' })}
          style={{
            background: 'linear-gradient(135deg, var(--terracotta), var(--gold))',
            borderRadius: '16px',
            padding: '28px 36px',
            cursor: 'pointer',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '6px' }}>חבילה מיוחדת</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '900', color: 'white' }}>
              חבילת כלה 👰
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginTop: '6px' }}>
              הזמנות, מגנטים, תיוקיות ועוד – הכל בסטייל אחד
            </p>
          </div>
          <span style={{ fontSize: '48px' }}>→</span>
        </div>
      </div>

      {/* Sub categories */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '0 36px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        {categories.graphics.subCategories.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubCat(sub.id)}
            style={{
              padding: '9px 20px',
              border: `2px solid ${activeSubCat === sub.id ? 'var(--terracotta)' : 'var(--light-border)'}`,
              borderRadius: '24px',
              background: activeSubCat === sub.id ? 'var(--terracotta)' : 'white',
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <p>אין עדיין פריטים בקטגוריה זו</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
