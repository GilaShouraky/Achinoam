import React from 'react';
import { useApp } from '../context/AppContext';

export default function TopBanner() {
  const { content } = useApp();
  return (
    <div style={{
      background: 'var(--deep-sage)',
      color: 'white',
      textAlign: 'center',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.3px',
    }}>
      {content.banner_text}
    </div>
  );
}
