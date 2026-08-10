'use client';
import React, { useState } from 'react';
import type { BillRecord } from '@/types';
import { Letterhead } from '@/components/shared/Letterhead';
import { SignatureBlock } from '@/components/shared/SignatureBlock';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { today, mkRef, fmtN, words, pf } from '@/lib/utils';
import { BILL_STATUSES, SURVEY_TYPES, KP } from '@/lib/constants';
import { exportBillExcel } from '@/lib/exportExcel';
import { exportToPDF, printDocument } from '@/lib/exportPdf';
import { Printer, FileSpreadsheet, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

const blankBill = (): BillRecord => ({
  id: Date.now(),
  billNo: mkRef('FEES', 1),
  date: today(),
  insurer: '',
  insuredName: '',
  vehicleNo: '',
  policyNo: '',
  claimNo: '',
  dateLoss: '',
  dateSurvey: today(),
  surveyType: 'Physical Survey',
  profFees: '',
  conveyance: '500',
  railAir: '0',
  incidental: '0',
  photoCnt: '0',
  rephoto: '0',
  cdCnt: '0',
  haltage: '0',
  sgstPct: '9',
  igstPct: '0',
  status: 'Unpaid',
});

export function FeeBill() {
  const [f, sf] = useState<BillRecord>(blankBill());
  const [certText, setCertText] = useState(
    'I hereby certify that the professional fee and expenses claimed above are true, correct and in accordance with IRDAI scale of fees and guidelines.'
  );
  const [sigPlace, setSigPlace] = useState('Jamshedpur');
  const [ok, setOk] = useState('');

  const s = <K extends keyof BillRecord>(k: K, v: BillRecord[K]) =>
    sf((p) => ({ ...p, [k]: v }));

  const fees = pf(f.profFees);
  const conv = pf(f.conveyance);
  const rail = pf(f.railAir);
  const inc = pf(f.incidental);
  const photo = pf(f.photoCnt) * 10 + pf(f.rephoto) * 10 + pf(f.cdCnt) * 50;
  const halt = pf(f.haltage);
  const sub = fees + conv + rail + inc + photo + halt;
  const sgst = (sub * pf(f.sgstPct)) / 100;
  const igst = (sub * pf(f.igstPct)) / 100;
  const total = sub + sgst + igst;

  const handleSave = (status: BillRecord['status']) => {
    s('status', status);
    setOk(`✔ Bill ${f.billNo} marked ${status}`);
    setTimeout(() => setOk(''), 3000);
  };

  const handleExportExcel = () => {
    exportBillExcel({ ...f, total });
  };

  const handleExportPDF = () => {
    exportToPDF('feebill-print-area', `FeeBill_${f.billNo.replace(/\//g, '-')}`);
  };

  const handlePrint = () => {
    printDocument('feebill-print-area');
  };

  const handleNew = () => {
    sf(blankBill());
    setCertText(
      'I hereby certify that the professional fee and expenses claimed above are true, correct and in accordance with IRDAI scale of fees and guidelines.'
    );
    setSigPlace('Jamshedpur');
  };

  return (
    <div className="card" id="feebill-print-area">
      <Letterhead
        refN={f.billNo}
        date={f.date}
        title="Survey Fee Invoice"
        onRefNChange={(v) => s('billNo', v)}
      />

      {/* BILL DETAILS */}
      <SectionHeader title="Bill Reference & Policy Details" icon="🧾" />
      <div className="form-grid form-grid-3 mb-8">
        <FormField label="Invoice No." val={f.billNo} set={(v) => s('billNo', v)} />
        <FormField label="Date" val={f.date} set={(v) => s('date', v)} />
        <FormField
          label="Payment Status"
          val={f.status}
          set={(v) => s('status', v as BillRecord['status'])}
          opts={BILL_STATUSES}
          yellow
        />
        <FormField
          label="Insurance Company (Billed To)"
          val={f.insurer}
          set={(v) => s('insurer', v)}
          ph="M/s Insurance Co. Ltd."
        />
        <FormField label="Insured Name" val={f.insuredName} set={(v) => s('insuredName', v)} />
        <FormField label="Vehicle No." val={f.vehicleNo} set={(v) => s('vehicleNo', v)} />
        <FormField label="Policy No." val={f.policyNo} set={(v) => s('policyNo', v)} />
        <FormField label="Claim No." val={f.claimNo} set={(v) => s('claimNo', v)} />
        <FormField
          label="Survey Type"
          val={f.surveyType}
          set={(v) => s('surveyType', v)}
          opts={SURVEY_TYPES}
        />
      </div>

      {/* FEE SCHEDULE */}
      <SectionHeader title="Fee Schedule & Charges" icon="💰" />
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '16px' }}>
        <div className="fee-row">
          <div className="fee-row-label">
            <div>Professional Survey Fees ₹ ★</div>
            <div className="fee-row-detail">Survey / Loss Assessment fee as per scale</div>
          </div>
          <input
            type="number"
            value={f.profFees}
            onChange={(e) => s('profFees', e.target.value)}
            placeholder="0.00"
            className="inline-input"
            style={{ background: 'var(--gold-l)', fontWeight: 700 }}
          />
        </div>

        <div className="fee-row">
          <div className="fee-row-label">
            <div>Conveyance Charges ₹</div>
            <div className="fee-row-detail">Local travel for inspection</div>
          </div>
          <input
            type="number"
            value={f.conveyance}
            onChange={(e) => s('conveyance', e.target.value)}
            className="inline-input"
          />
        </div>

        <div className="fee-row">
          <div className="fee-row-label">
            <div>Rail / Air / Outstation Travel ₹</div>
            <div className="fee-row-detail">Outstation inspection charges</div>
          </div>
          <input
            type="number"
            value={f.railAir}
            onChange={(e) => s('railAir', e.target.value)}
            className="inline-input"
          />
        </div>

        <div className="fee-row">
          <div className="fee-row-label">
            <div>Incidental Charges ₹</div>
            <div className="fee-row-detail">Postage, printing & administrative</div>
          </div>
          <input
            type="number"
            value={f.incidental}
            onChange={(e) => s('incidental', e.target.value)}
            className="inline-input"
          />
        </div>

        <div className="fee-row">
          <div className="fee-row-label">
            <div>Photo & Documentation Charges</div>
            <div className="fee-row-detail flex gap-12 align-center mt-4">
              <span>
                Photos:{' '}
                <input
                  type="number"
                  value={f.photoCnt}
                  onChange={(e) => s('photoCnt', e.target.value)}
                  className="inline-input-sm"
                />{' '}
                @ ₹10
              </span>
              <span>
                Re-inspection photos:{' '}
                <input
                  type="number"
                  value={f.rephoto}
                  onChange={(e) => s('rephoto', e.target.value)}
                  className="inline-input-sm"
                />{' '}
                @ ₹10
              </span>
              <span>
                CD/Media:{' '}
                <input
                  type="number"
                  value={f.cdCnt}
                  onChange={(e) => s('cdCnt', e.target.value)}
                  className="inline-input-sm"
                />{' '}
                @ ₹50
              </span>
            </div>
          </div>
          <div className="fee-row-value">₹{fmtN(photo)}</div>
        </div>

        <div className="fee-row">
          <div className="fee-row-label">
            <div>Haltage Charges ₹</div>
            <div className="fee-row-detail">Overnight stay / halt if applicable</div>
          </div>
          <input
            type="number"
            value={f.haltage}
            onChange={(e) => s('haltage', e.target.value)}
            className="inline-input"
          />
        </div>

        <div className="fee-subtotal">
          <span>Sub Total</span>
          <span>₹{fmtN(sub)}</span>
        </div>

        <div className="fee-row" style={{ fontSize: '11px' }}>
          <span>
            SGST @{' '}
            <input
              type="number"
              value={f.sgstPct}
              onChange={(e) => s('sgstPct', e.target.value)}
              className="inline-input-sm"
            />
            %
          </span>
          <span className="font-bold text-navy">₹{fmtN(sgst)}</span>
        </div>

        <div className="fee-row" style={{ fontSize: '11px' }}>
          <span>
            IGST @{' '}
            <input
              type="number"
              value={f.igstPct}
              onChange={(e) => s('igstPct', e.target.value)}
              className="inline-input-sm"
            />
            %
          </span>
          <span className="font-bold text-navy">₹{fmtN(igst)}</span>
        </div>

        <div className="fee-total">
          <span>TOTAL PAYABLE</span>
          <span className="text-gold">₹{fmtN(total)}</span>
        </div>
      </div>

      {/* AMOUNT IN WORDS & BANK DETAILS */}
      <div className="amount-words-box">
        <b className="text-navy">Amount in Words: </b>
        <span style={{ fontStyle: 'italic' }}>Rupees {words(Math.round(total))}</span>
        <div className="text-muted mt-4">
          Payment via NEFT/RTGS to <b>{KP.bank}</b> | A/C: <b>{KP.account}</b> | IFSC:{' '}
          <b>{KP.ifsc}</b> | PAN: <b>{KP.pan}</b>
        </div>
      </div>

      <SignatureBlock
        date={f.date}
        certText={certText}
        sigPlace={sigPlace}
        onCertTextChange={setCertText}
        onSigPlaceChange={setSigPlace}
      />

      {/* ACTION BUTTONS */}
      <div className="btn-actions no-print">
        <Button label="Save (Unpaid)" onClick={() => handleSave('Unpaid')} variant="muted" size="sm" />
        <Button label="Mark Paid" onClick={() => handleSave('Paid')} variant="success" icon={<CheckCircle2 size={16} />} />
        <Button label="Export Excel" onClick={handleExportExcel} variant="gold" icon={<FileSpreadsheet size={16} />} />
        <Button label="Export PDF" onClick={handleExportPDF} variant="navy" icon={<FileText size={16} />} />
        <Button label="Print" onClick={handlePrint} variant="primary" icon={<Printer size={16} />} />
        <Button label="New Bill" onClick={handleNew} variant="muted" size="sm" icon={<RotateCcw size={14} />} />
      </div>

      {ok && <div className="text-right mt-8"><span className="toast">{ok}</span></div>}
    </div>
  );
}
