'use client';
import React from 'react';
import { KP } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <b>{KP.name}</b> · Motor Surveyor &amp; Loss Assessor · IRDAI Lic: <b>{KP.lic}</b> (Validity Date: {KP.validity})
      </div>
      <div>
        PAN: {KP.pan} · {KP.qual} · {KP.city}
      </div>
    </footer>
  );
}
