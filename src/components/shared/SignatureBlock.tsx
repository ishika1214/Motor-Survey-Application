'use client';
import React, { useState } from 'react';
import { KP } from '@/lib/constants';
import { today } from '@/lib/utils';
import { SignatureModal } from './SignatureModal';
import { Edit3, ShieldCheck, CheckCircle } from 'lucide-react';

const DEFAULT_CERT =
  'I hereby certify that I have personally inspected the above vehicle and the assessment recorded herein is true, fair and correct to the best of my professional knowledge and judgement, prepared in accordance with IRDAI / IMT guidelines and policy terms & conditions.';

interface SignatureBlockProps {
  date?: string;
  certText?: string;
  sigPlace?: string;
  sigData?: string | null;
  onCertTextChange?: (v: string) => void;
  onSigPlaceChange?: (v: string) => void;
  onSigDataChange?: (v: string | null) => void;
}

export function SignatureBlock({
  date,
  certText,
  sigPlace,
  sigData,
  onCertTextChange,
  onSigPlaceChange,
  onSigDataChange,
}: SignatureBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayCert = certText ?? DEFAULT_CERT;
  const displayPlace = sigPlace ?? KP.city;

  return (
    <div className="sig-block">
      <div className="sig-cert">
        {onCertTextChange ? (
          <textarea
            className="sig-cert-input"
            value={displayCert}
            rows={4}
            onChange={(e) => onCertTextChange(e.target.value)}
          />
        ) : (
          <span>{displayCert}</span>
        )}
        <div style={{ marginTop: '8px', fontStyle: 'normal', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span>Date: <b>{date || today()}</b></span>
          <span>&nbsp;|&nbsp;</span>
          <span>Place:&nbsp;</span>
          {onSigPlaceChange ? (
            <input
              className="sig-place-input"
              value={displayPlace}
              onChange={(e) => onSigPlaceChange(e.target.value)}
            />
          ) : (
            <span>{displayPlace}</span>
          )}
        </div>
      </div>

      <div className="sig-right">
        {sigData ? (
          <div className="sig-box custom-sig" onClick={() => onSigDataChange && setIsModalOpen(true)}>
            <img src={sigData} alt="Digital Signature" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
          </div>
        ) : (
          <div className="sig-box official-stamp" onClick={() => onSigDataChange && setIsModalOpen(true)}>
            <div className="sig-stamp-badge">
              <div className="sig-stamp-title">{KP.name}</div>
              <div className="sig-stamp-sub">
                <ShieldCheck size={11} className="inline text-gold" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />
                DIGITALLY SIGNED &amp; VERIFIED
              </div>
              <div className="sig-stamp-lic">IRDA Lic: {KP.lic}</div>
            </div>
          </div>
        )}

        {onSigDataChange && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="no-print"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--blue)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              marginBottom: '4px',
            }}
          >
            <Edit3 size={11} /> Change Signature
          </button>
        )}

        <div className="sig-name">{KP.name}</div>
        <div className="sig-lic">IRDAI Lic: {KP.lic}</div>
        <div className="sig-validity">Validity Date: {KP.validity}</div>
      </div>

      {onSigDataChange && (
        <SignatureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => onSigDataChange(data)}
          currentSig={sigData || null}
        />
      )}
    </div>
  );
}
