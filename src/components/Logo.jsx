import React from 'react';

export default function Logo({ size = 'normal' }) {
  const logoUrl = 'https://i.ibb.co/6R35Qkzt/4.png';

  if (size === 'header') {
    return (
      <img src={logoUrl} alt="אחינועם"
        style={{ height: '22px', maxHeight: '22px', width: 'auto', objectFit: 'contain', display: 'block' }} />
    );
  }
  // סיידבר ופוטר
  return (
    <img src={logoUrl} alt="אחינועם"
      style={{ height: '90px', width: 'auto', objectFit: 'contain', display: 'block' }} />
  );
}
