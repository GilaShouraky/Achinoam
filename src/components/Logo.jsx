import React from 'react';
import { useImg } from '../edit/T';

export default function Logo({ size = 'normal' }) {
  const logoUrl = useImg('logo_url');

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
