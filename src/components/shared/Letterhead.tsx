'use client';
import React from 'react';
import { KP } from '@/lib/constants';

interface LetterheadProps {
  refN?: string;
  date?: string;
  title?: string;
  onRefNChange?: (v: string) => void;
}

export function Letterhead({ refN, date, title, onRefNChange }: LetterheadProps) {
  return (
    <div className="letterhead">
      <div className="lh-top">
        <div>
          <div className="lh-name">{KP.name}</div>
          <div className="lh-role">Surveyor &amp; Loss Assessor – Motor</div>
          <div className="lh-meta">
            <div>
              IRDAI Lic No: <b style={{ color: '#111' }}>{KP.lic}</b> &nbsp;|&nbsp; Validity Date:{' '}
              <b style={{ color: 'var(--red-d)' }}>{KP.validity}</b>
            </div>
            <div>
              Mob: {KP.mobile} &nbsp;|&nbsp; Email: {KP.email}
            </div>
            <div style={{ fontSize: '9px' }}>{KP.qual}</div>
          </div>
        </div>
        <div className="lh-right">
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Jamshedpur Office</div>
          <div style={{ fontSize: '9px', maxWidth: '230px', margin: '2px 0 2px auto' }}>{KP.address}</div>
          <div>
            <b>{KP.bank}</b>
          </div>
          <div>
            A/C: {KP.account} | IFSC: {KP.ifsc}
          </div>
          {refN !== undefined && (
            <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <span>Ref:</span>
              {onRefNChange ? (
                <input
                  type="text"
                  value={refN}
                  onChange={(e) => onRefNChange(e.target.value)}
                  className="lh-ref-input"
                  style={{
                    fontWeight: 700,
                    color: 'var(--navy)',
                    fontSize: '12px',
                    border: '1px solid #C5D0DC',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    width: '160px',
                    textAlign: 'right',
                    background: '#ffffff',
                  }}
                />
              ) : (
                <span>{refN}</span>
              )}
            </div>
          )}
          {date && <div>Date: {date}</div>}
        </div>
      </div>
      {title && (
        <div className="lh-title">
          <div className="lh-doc-title">{title}</div>
          <div className="lh-confidential">Private &amp; Confidential — Issued without prejudice</div>
        </div>
      )}
    </div>
  );
}
