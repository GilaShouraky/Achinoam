import React from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

export default function HomePage() {
  const { content, navigate } = useApp();

  const recentProducts = products.slice(0, 4);
  const customProducts = products.filter(p => p.category === 'notebooks' || p.category === 'embroidery').slice(0, 4);
  const under100 = products.filter(p => p.price > 0 && p.price <= 100).slice(0, 4);
  const brideProducts = products.filter(p => p.category === 'bride').slice(0, 4);

  const mainCats = [
    { key: 'products', page: 'category', pageData: 'products', icon: '🎁', title: 'המוצרים שלי', desc: 'קולקציות עונתיות, מתנות ממותגות ופריטים בעיצוב אישי', color: 'var(--terracotta)' },
    { key: 'graphics', page: 'category', pageData: 'graphics', icon: '🎨', title: 'עבודות גרפיקה', desc: 'הזמנות, פלאיירים ומיתוגים לעסק ולאירועים', color: 'var(--deep-sage)' },
    { key: 'workshops', page: 'category', pageData: 'workshops', icon: '✂️', title: 'סדנאות אומנות', desc: 'סדנאות מקרמה, ריקמה ואומנות לכל הגילאים', color: 'var(--gold)' },
  ];

  const productRows = [
    { title: 'מוצרים שרכשו כאן לאחרונה', items: recentProducts },
    { title: 'מוצרים בייצור ועיצוב אישי', items: customProducts },
    { title: 'מתנות עד 100 ש"ח', items: under100 },
    { title: 'חבילת כלה', items: brideProducts },
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ padding: '70px 30px 50px', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: 'var(--sage)', color: 'white',
          padding: '6px 20px', borderRadius: '20px', fontSize: '13px',
          fontWeight: '500', marginBottom: '22px', letterSpacing: '0.5px',
        }}>
          🌿 עיצוב אישי | מתנות | סדנאות
        </div>

        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)',
          fontWeight: '500',
          color: 'var(--mid)',
          marginBottom: '10px',
        }}>
          {content.hero_subtitle}
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 62px)',
          fontWeight: '900', color: 'var(--heading-color)', lineHeight: '1.2',
          marginBottom: '48px',
        }}>
          {content.hero_title}
        </h1>

        <div style={{
          background: 'white', border: '1px solid var(--light-border)',
          borderRadius: '20px', padding: '36px 40px', textAlign: 'right',
          maxWidth: '660px', margin: '0 auto', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '5px', height: '100%',
            background: 'linear-gradient(to bottom, var(--sage), var(--terracotta))',
          }} />
          <p style={{ fontSize: '15px', lineHeight: '2', color: 'var(--mid)', whiteSpace: 'pre-line' }}>
            {content.about_text}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--deep-sage)', marginTop: '16px', fontWeight: '700' }}>
            {content.about_signature}
          </p>
        </div>
      </section>

      {/* 3 Main Category Cards – clean, no sub-tags */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '22px',
        maxWidth: '900px',
        margin: '0 auto 80px',
        padding: '0 30px',
      }}>
        {mainCats.map(cat => (
          <div
            key={cat.key}
            onClick={() => navigate(cat.page, cat.pageData)}
            style={{
              background: 'white', border: '1px solid var(--light-border)',
              borderRadius: '22px', padding: '40px 28px 32px',
              cursor: 'pointer', transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: cat.color }} />
            <div style={{ fontSize: '54px', marginBottom: '16px' }}>{cat.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900', color: 'var(--dark)', marginBottom: '10px' }}>
              {cat.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.7', marginBottom: '22px' }}>
              {cat.desc}
            </p>
            <div style={{
              display: 'inline-block', padding: '8px 22px', borderRadius: '20px',
              background: cat.color, color: 'white', fontSize: '13px', fontWeight: '600',
            }}>
              לצפייה ←
            </div>
          </div>
        ))}
      </section>

      {/* Product Rows */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 30px 70px' }}>
        {productRows.map(row => row.items.length > 0 && (
          <div key={row.title} style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700',
              color: 'var(--dark)', marginBottom: '16px', paddingBottom: '10px',
              borderBottom: '2px solid var(--light-border)',
            }}>
              {row.title}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
              {row.items.map(p => <ProductCard key={p.id} product={p} size="small" />)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
