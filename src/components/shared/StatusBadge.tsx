'use client';
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, string> = {
    Final: 'var(--grn-d)',
    Draft: 'var(--muted)',
    'In Progress': '#1565C0',
    Repudiated: 'var(--red-d)',
    Paid: 'var(--grn-d)',
    Unpaid: 'var(--red-d)',
    Partial: 'var(--gold)',
  };

  const bg = map[status] || 'var(--muted)';

  return (
    <span className="status-badge" style={{ background: bg }}>
      {status}
    </span>
  );
}
