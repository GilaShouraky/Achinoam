import React from 'react';
import { useApp } from '../context/AppContext';
import { categories, workshops } from '../data/products';

// Sub-category visual data: emoji + gradient per sub-category
const subCatVisuals = {
  // Products
  pesach:       { emoji: '🍷', gradient: 'linear-gradient(135deg, #C9A0A0, #A06060)' },
  rosh_hashana: { emoji: '🍎', gradient: 'linear-gradient(135deg, #C9B87A, #A08040)' },
  chagim:       { emoji: '🕯️', gradient: 'linear-gradient(135deg, #B0A8C9, #7060A0)' },
  notebooks:    { emoji: '📓', gradient: 'linear-gradient(135deg, #8BA8C9, #4060A0)' },
  embroidery:   { emoji: '🌺', gradient: 'linear-gradient(135deg, #C9A8B0, #A06070)' },
  under100:     { emoji: '🎁', gradient: 'linear-gradient(135deg, #A8C9A0, #508050)' },
  bride:        { emoji: '👰', gradient: 'linear-gradient(135deg, #F5DFC0, #C9A070)' },
  // Graphics
  invitations:  { emoji: '✉️', gradient: 'linear-gradient(135deg, #8FB5C9, #406080)' },
  flyers:       { emoji: '📄', gradient: 'linear-gradient(135deg, #A8BCC9, #507090)' },
  branding:     { emoji: '🏷️', gradient: 'linear-gradient(135deg, #7A9CB0, #3A6080)' },
  // Workshops
  macrame:      { emoji: '🪢', gradient: 'linear-gradient(135deg, #C9B8A0, #907050)' },
  embroidery_ws:{ emoji: '🧵', gradient: 'linear-gradient(135deg, #C9A0B0, #906070)' },
  art_general:  { emoji: '🎨', gradient: 'linear-gradient(135deg, #A0B8C9, #507090)' },
};

const catConfig = {
  products: {
    title: 'המוצרים שלי',
    icon: '🎁',
    targetPage: 'products',
    subs: categories.products.subCategories,
  },
  graphics: {
    title: 'עבודות גרפיקה',
    icon: '🎨',
    targetPage: 'graphics',
    subs: categories.graphics.subCategories,
  },
  workshops: {
    title: 'סדנאות אומנות',
    icon: '✂️',
    targetPage: 'workshops',
    subs: workshops.map(w => ({ id: w.id, label: w.label })),
  },
};

export default function CategoryPage() {
  const { navigate, pageData } = useApp();
  const catKey = pageData || 'products';
  const cat = catConfig[catKey] || catConfig.products;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--light-border)',
        padding: '32px 36px 28px',
      }}>
        <button
          onClick={() => navigate('home')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: 'var(--mid)', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          ← חזרה לדף הבית
        </button>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '38px',
          fontWeight: '900',
          color: 'var(--dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span>{cat.icon}</span> {cat.title}
        </h1>
        <p style={{ color: 'var(--mid)', fontSize: '15px', marginTop: '8px' }}>
          בחרו קטגוריה להמשך
        </p>
      </div>

      {/* Sub-category grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        maxWidth: '1000px',
        margin: '36px auto 60px',
        padding: '0 30px',
      }}>
        {cat.subs.map(sub => {
          const visual = subCatVisuals[sub.id] || { emoji: '📦', gradient: 'linear-gradient(135deg, #ccc, #999)' };
          return (
            <div
              key={sub.id}
              onClick={() => navigate(cat.targetPage, { subCategory: sub.id })}
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid var(--light-border)',
                background: 'white',
                cursor: 'pointer',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Image area */}
              <div style={{
                width: '100%',
                paddingTop: '68%',
                background: visual.gradient,
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '52px',
                }}>
                  {visual.emoji}
                </span>
              </div>

              {/* Label */}
              <div style={{ padding: '14px 16px', textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--dark)',
                }}>
                  {sub.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
