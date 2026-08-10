'use client';
import React from 'react';

interface SectionHeaderProps {
  title: string;
  icon?: string;
  variant?: 'blue' | 'navy' | 'gold';
}

export function SectionHeader({ title, icon, variant = 'blue' }: SectionHeaderProps) {
  return (
    <div className={`section-header ${variant === 'navy' ? 'navy' : variant === 'gold' ? 'gold-bg' : ''}`}>
      {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
      <span>{title}</span>
    </div>
  );
}
