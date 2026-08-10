'use client';
import React from 'react';
import { KP } from '@/lib/constants';
import { today } from '@/lib/utils';

const DEFAULT_CERT =
  'I hereby certify that I have personally inspected the above vehicle and the assessment recorded herein is true, fair and correct to the best of my professional knowledge and judgement, prepared in accordance with IRDAI / IMT guidelines and policy terms & conditions.';

interface SignatureBlockProps {
  date?: string;
  certText?: string;
  sigPlace?: string;
  onCertTextChange?: (v: string) => void;
  onSigPlaceChange?: (v: string) => void;
}

export function SignatureBlock({
  date,
  certText,
  sigPlace,
  onCertTextChange,
  onSigPlaceChange,
}: SignatureBlockProps) {
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
        <div className="sig-box">[ Digital Signature ]</div>
        <div className="sig-name">{KP.name}</div>
        <div className="sig-lic">IRDAI Lic: {KP.lic}</div>
        <div className="sig-validity">Validity Date: {KP.validity}</div>
      </div>
    </div>
  );
}
