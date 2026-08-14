'use client';
import React, { useState, useEffect } from 'react';
import type { Part, Labour, AssessmentRecord } from '@/types';
import { Letterhead } from '@/components/shared/Letterhead';
import { SignatureBlock } from '@/components/shared/SignatureBlock';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { PartsTable } from './PartsTable';
import { LabourTable } from './LabourTable';
import { today, mkRef, fmtN, words, pf, copyToClipboard } from '@/lib/utils';
import { KP, ASSESSMENT_LOSS_TYPES, VEHICLE_AGE_OPTIONS } from '@/lib/constants';
import { calcPart, calcLabour, computeNet, ageDepr } from '@/lib/calculations';
import { exportAssessmentExcel } from '@/lib/exportExcel';
import { exportToPDF, printDocument } from '@/lib/exportPdf';
import { parseMaintenanceExcel } from '@/lib/importExcel';
import { Printer, FileSpreadsheet, FileText, CheckCircle2, RotateCcw, Upload, Copy, Save } from 'lucide-react';

const DRAFT_KEY = 'kp_assessment_draft';

const blankPart = (id: number): Part => ({
  id,
  desc: '',
  mat: 'Metal / Steel',
  qty: '1',
  unit: 'Nos',
  oemRate: '',
  mktRate: '',
  appRate: '',
  salvage: '',
  rr: 'Replace',
});

const blankLab = (id: number): Labour => ({
  id,
  desc: '',
  sac: '998714',
  removalRefit: '',
  repair: '',
  painting: '',
  stdH: '',
  clmH: '',
  appH: '',
  rateH: '',
});

export function Assessment() {
  const [refN, setRefN] = useState(mkRef('AS', 1));
  const [date, setDate] = useState(today());
  const [insurer, setIns] = useState('');
  const [insured, setIsd] = useState('');
  const [claimNo, setClm] = useState('');
  const [policyNo, setPol] = useState('');
  const [regNo, setReg] = useState('');
  const [mm, setMM] = useState('');
  const [vehAge, setAge] = useState('');
  const [idv, setIdv] = useState('');
  const [coverageType, setCoverage] = useState<string>('Normal Calculation');
  const [lossType, setLT] = useState('Repair Loss');
  const [excess, setEx] = useState('');
  const [addlEx, setAx] = useState('');
  const [salvNet, setSV] = useState('');
  const [betterment, setBt] = useState('');
  const [towing, setTow] = useState('');

  const [parts, setParts] = useState<Part[]>(
    Array.from({ length: 10 }, (_, i) => blankPart(i + 1))
  );
  const [labs, setLabs] = useState<Labour[]>(
    Array.from({ length: 5 }, (_, i) => blankLab(i + 1))
  );
  const [stdRemarks, setStdRemarks] = useState<string[]>([
    'All original documents to be verified by Insurance Company.',
    'No supplementary estimate entertained.',
    'Salvage value as stated; all taxes & excess applicable.',
    'Subject to final approval of Insurance Company.',
  ]);
  const [certText, setCertText] = useState(
    'I hereby certify that I have personally inspected the above vehicle and the assessment recorded herein is true, fair and correct to the best of my professional knowledge and judgement, prepared in accordance with IRDAI / IMT guidelines and policy terms & conditions.'
  );
  const [sigPlace, setSigPlace] = useState('Jamshedpur');
  const [sigData, setSigData] = useState<string | null>(null);
  const [ok, setOk] = useState('');

  // Load initial draft from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.refN) setRefN(parsed.refN);
        if (parsed.date) setDate(parsed.date);
        if (parsed.insurer) setIns(parsed.insurer);
        if (parsed.insured) setIsd(parsed.insured);
        if (parsed.claimNo) setClm(parsed.claimNo);
        if (parsed.policyNo) setPol(parsed.policyNo);
        if (parsed.regNo) setReg(parsed.regNo);
        if (parsed.mm) setMM(parsed.mm);
        if (parsed.vehAge) setAge(parsed.vehAge);
        if (parsed.idv) setIdv(parsed.idv);
        if (parsed.coverageType) setCoverage(parsed.coverageType);
        if (parsed.lossType) setLT(parsed.lossType);
        if (parsed.excess) setEx(parsed.excess);
        if (parsed.addlEx) setAx(parsed.addlEx);
        if (parsed.salvNet) setSV(parsed.salvNet);
        if (parsed.betterment) setBt(parsed.betterment);
        if (parsed.towing) setTow(parsed.towing);
        if (parsed.parts?.length) setParts(parsed.parts);
        if (parsed.labs?.length) setLabs(parsed.labs);
        if (parsed.stdRemarks?.length) setStdRemarks(parsed.stdRemarks);
        if (parsed.certText) setCertText(parsed.certText);
        if (parsed.sigPlace) setSigPlace(parsed.sigPlace);
        if (parsed.sigData) setSigData(parsed.sigData);
        setOk('✔ Restored saved assessment draft');
        setTimeout(() => setOk(''), 3000);
      }
    } catch (e) {
      console.warn('Could not restore assessment draft', e);
    }
  }, []);

  // Auto-save draft state on changes
  useEffect(() => {
    try {
      const draftObj = {
        refN, date, insurer, insured, claimNo, policyNo, regNo, mm, vehAge, idv, coverageType, lossType,
        excess, addlEx, salvNet, betterment, towing, parts, labs, stdRemarks, certText, sigPlace, sigData, savedAt: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftObj));
    } catch (e) {
      console.warn('Failed to auto-save assessment draft', e);
    }
  }, [refN, date, insurer, insured, claimNo, policyNo, regNo, mm, vehAge, idv, coverageType, lossType, excess, addlEx, salvNet, betterment, towing, parts, labs, stdRemarks, certText, sigPlace, sigData]);

  const saveDraftOnError = (err: any) => {
    try {
      const draftObj = {
        refN, date, insurer, insured, claimNo, policyNo, regNo, mm, vehAge, idv, coverageType, lossType,
        excess, addlEx, salvNet, betterment, towing, parts, labs, stdRemarks, certText, sigPlace, sigData, savedAt: Date.now(), errorOccurred: true
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftObj));
      setOk('⚠️ Assessment saved as draft due to an error');
      setTimeout(() => setOk(''), 4000);
    } catch (e) {
      console.error('Save draft on error failed', e);
    }
  };

  const pCalc = parts.map((p) => calcPart(p, vehAge, lossType, coverageType));
  const lCalc = labs.map((l) => calcLabour(l, lossType));

  const pGross = pCalc.reduce((s, c) => s + c.total, 0);
  const pDepr = pCalc.reduce((s, c) => s + c.deprAmt, 0);
  const pNetD = pCalc.reduce((s, c) => s + c.netD, 0);
  const lGross = lCalc.reduce((s, c) => s + c.total, 0);
  const lAdm = lCalc.reduce((s, c) => s + c.adm, 0);

  const ex = pf(excess);
  const ax = pf(addlEx);
  const sv = pf(salvNet);
  const bt = pf(betterment);
  const tw = pf(towing);

  const { netRepair, netCash, netSalvage, NET } = computeNet(
    pCalc,
    lCalc,
    lossType,
    ex,
    ax,
    bt,
    tw,
    sv
  );

  const buildRecord = (): AssessmentRecord => ({
    id: Date.now(),
    refN,
    date,
    insurer,
    insured,
    claimNo,
    policyNo,
    regNo,
    mm,
    vehAge,
    idv,
    coverageType,
    lossType,
    excess,
    addlEx,
    salvNet,
    betterment,
    towing,
    parts,
    labs,
    net: NET,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await parseMaintenanceExcel(file);
      if (res.parts.length > 0) {
        setParts(res.parts);
      }
      if (res.labs.length > 0) {
        setLabs(res.labs);
      }
      setOk(`✔ Imported ${res.countParts} Parts and ${res.countLabs} Labour items from ${file.name}`);
      setTimeout(() => setOk(''), 5000);
    } catch (err: any) {
      saveDraftOnError(err);
      alert(`Error reading Excel file: ${err.message || 'Invalid format'}`);
    } finally {
      e.target.value = '';
    }
  };

  const setPart = (i: number, k: keyof Part, v: string) => {
    setParts((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });
  };

  const setLab = (i: number, k: keyof Labour, v: string) => {
    setLabs((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });
  };

  const handleSave = () => {
    try {
      handleCopyToClipboard();
      setOk(`✔ Assessment ${refN} saved & copied to clipboard`);
      setTimeout(() => setOk(''), 3000);
    } catch (err) {
      saveDraftOnError(err);
    }
  };

  const handleCopyToClipboard = async () => {
    const summary = [
      `=== MOTOR INSURANCE ASSESSMENT SHEET ===`,
      `Ref No: ${refN} | Date: ${date}`,
      `Insurer: ${insurer || 'N/A'} | Policy No: ${policyNo || 'N/A'} | Claim No: ${claimNo || 'N/A'}`,
      `Insured: ${insured || 'N/A'} | Reg No: ${regNo || 'N/A'} | Make/Model: ${mm || 'N/A'}`,
      `IDV: ₹${idv || 'N/A'} | Coverage: ${coverageType}`,
      `Loss Type: ${lossType} | Vehicle Age: ${vehAge || 'N/A'}`,
      `Parts Gross: ₹${fmtN(pGross)} | Depreciation: ₹${fmtN(pDepr)}`,
      `Labour Gross: ₹${fmtN(lGross)}`,
      `Policy Excess: ₹${fmtN(ex)} | Salvage: ₹${fmtN(sv)}`,
      `NET ADMISSIBLE AMOUNT: ₹${fmtN(NET)} (${words(Math.round(NET))})`,
      `Surveyor: ${KP.name} (Lic: ${KP.lic}, Expiry: ${KP.validity})`,
    ].join('\n');

    const success = await copyToClipboard(summary);
    if (success) {
      setOk('📋 Recent assessment copied to clipboard!');
      setTimeout(() => setOk(''), 3000);
    }
  };

  const handleExportExcel = () => {
    try {
      exportAssessmentExcel(buildRecord());
      handleCopyToClipboard();
    } catch (err) {
      saveDraftOnError(err);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF('assessment-print-area', `Assessment_${refN.replace(/\//g, '-')}`);
      handleCopyToClipboard();
    } catch (err) {
      saveDraftOnError(err);
    }
  };

  const handlePrint = () => {
    try {
      printDocument('assessment-print-area');
    } catch (err) {
      saveDraftOnError(err);
    }
  };

  const handleNew = () => {
    localStorage.removeItem(DRAFT_KEY);
    setRefN(mkRef('AS', 1));
    setDate(today());
    setIns('');
    setIsd('');
    setClm('');
    setPol('');
    setReg('');
    setMM('');
    setAge('');
    setIdv('');
    setCoverage('Normal Calculation');
    setLT('Repair Loss');
    setEx('');
    setAx('');
    setSV('');
    setBt('');
    setTow('');
    setParts(Array.from({ length: 10 }, (_, i) => blankPart(i + 1)));
    setLabs(Array.from({ length: 5 }, (_, i) => blankLab(i + 1)));
    setStdRemarks([
      'All original documents to be verified by Insurance Company.',
      'No supplementary estimate entertained.',
      'Salvage value as stated; all taxes & excess applicable.',
      'Subject to final approval of Insurance Company.',
    ]);
    setCertText(
      'I hereby certify that I have personally inspected the above vehicle and the assessment recorded herein is true, fair and correct to the best of my professional knowledge and judgement, prepared in accordance with IRDAI / IMT guidelines and policy terms & conditions.'
    );
    setSigPlace('Jamshedpur');
    setSigData(null);
    setOk('✔ Assessment form reset & draft removed');
    setTimeout(() => setOk(''), 3000);
  };

  return (
    <div className="card" id="assessment-print-area">
      <Letterhead
        refN={refN}
        date={date}
        title="Motor Insurance — Assessment Sheet"
        onRefNChange={setRefN}
      />

      {/* HEADER INFO */}
      <SectionHeader title="Claim & Vehicle Details" icon="🔖" />
      <div className="form-grid form-grid-4 mb-8">
        <FormField label="Assessment Ref No." val={refN} set={setRefN} />
        <FormField label="Date" val={date} set={setDate} />
        <FormField label="Claim No." val={claimNo} set={setClm} />
        <FormField label="Policy No." val={policyNo} set={setPol} />
        <FormField label="Insurance Company" val={insurer} set={setIns} />
        <FormField label="Insured Name" val={insured} set={setIsd} />
        <FormField label="Vehicle Reg No." val={regNo} set={setReg} />
        <FormField label="Make & Model" val={mm} set={setMM} />
        <FormField label="IDV (Insured Declared Value) ₹" val={idv} set={setIdv} yellow ph="e.g. 5,50,000" />
        <FormField
          label="Vehicle Age (IRDA Schedule)"
          val={vehAge}
          set={setAge}
          opts={VEHICLE_AGE_OPTIONS}
          yellow
        />
        <FormField
          label="Coverage / Depreciation Basis"
          val={coverageType}
          set={setCoverage}
          opts={['Normal Calculation', 'Zero Depreciation']}
          yellow
        />
        <FormField
          label="Loss Type"
          val={lossType}
          set={setLT}
          opts={ASSESSMENT_LOSS_TYPES}
          yellow
        />
      </div>

      {/* DEPRECIATION GUIDE PILLS */}
      <div className="depr-guide">
        <span className="font-bold text-navy" style={{ fontSize: '10px' }}>
          📌 IRDAI Depr Guide ({coverageType}):
        </span>
        {coverageType === 'Zero Depreciation' ? (
          <span className="depr-pill">
            <span className="text-muted">Nil Depreciation Add-On Cover:</span>{' '}
            <b style={{ color: 'var(--grn-d)' }}>0% Depreciation Applicable Across Parts</b>
          </span>
        ) : (
          [
            { lbl: 'Rubber/Plastic/Tyre/Battery/Airbag', val: '50% Flat', col: 'var(--red-d)' },
            { lbl: 'Fibre Glass', val: '30% Flat', col: '#7B3F00' },
            { lbl: 'Glass', val: 'NIL', col: 'var(--grn-d)' },
            { lbl: 'Painting', val: '50% on 25% of bill', col: '#5C0080' },
            { lbl: 'Metal/Other', val: 'Age-based →', col: '#003080' },
            ...(vehAge ? [{ lbl: `Age (${vehAge})`, val: `${ageDepr(vehAge)}%`, col: 'var(--navy)' }] : []),
          ].map((item) => (
            <span key={item.lbl} className="depr-pill">
              <span className="text-muted">{item.lbl}:</span>{' '}
              <b style={{ color: item.col }}>{item.val}</b>
            </span>
          ))
        )}
      </div>

      {/* UPLOAD EXCEL BANNER */}
      <div
        className="flex items-center justify-between gap-12 mb-16 p-12 rounded-lg no-print"
        style={{
          background: 'linear-gradient(135deg, #eef3fb 0%, #e3edfc 100%)',
          border: '1.5px dashed #4A7AB5',
        }}
      >
        <div className="flex items-center gap-10">
          <FileSpreadsheet size={24} className="text-navy" style={{ color: '#1E3A8A' }} />
          <div>
            <div className="font-bold text-navy" style={{ fontSize: '13px', color: '#1E3A8A' }}>
              Upload Maintenance &amp; Repair Excel Sheet
            </div>
            <div className="text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
              Import Part &amp; Labour records directly from Excel (.xlsx, .xls, .csv). Populates <b>Part/Component Name</b> and <b>HSN/SAC Code</b> into Section A &amp; B tables, leaving rate/charge columns empty for manual entry.
            </div>
          </div>
        </div>
        <label
          className="btn flex items-center gap-6 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#fff',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Upload size={16} />
          <span>Upload Excel Sheet</span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* SECTION A — PARTS */}
      <SectionHeader title="Section A — Parts / Materials" icon="🔩" />
      <PartsTable
        parts={parts}
        pCalc={pCalc}
        setPart={setPart}
        addPartRow={() => setParts((p) => [...p, blankPart(p.length + 1)])}
        removePartRow={(i) =>
          setParts((p) => p.filter((_, j) => j !== i).map((x, j) => ({ ...x, id: j + 1 })))
        }
      />

      {/* SECTION B — LABOUR */}
      <SectionHeader title="Section B — Labour / Operations (SAC 998714)" icon="🔧" />
      <LabourTable
        labs={labs}
        lCalc={lCalc}
        lossType={lossType}
        setLab={setLab}
        addLabRow={() => setLabs((l) => [...l, blankLab(l.length + 1)])}
        removeLabRow={(i) =>
          setLabs((l) => l.filter((_, j) => j !== i).map((x, j) => ({ ...x, id: j + 1 })))
        }
      />

      {/* SECTION C — DEDUCTIONS & SETTLEMENT */}
      <SectionHeader title="Section C — Deductions & Settlement" icon="⚖️" variant="navy" />
      <div className="deductions-grid">
        <FormField label="(−) Policy Excess ₹" val={excess} set={setEx} yellow />
        <FormField label="(−) Additional Excess ₹" val={addlEx} set={setAx} yellow />
        <FormField label="(−) Betterment ₹" val={betterment} set={setBt} yellow />
        <FormField label="(−) Towing Charges ₹" val={towing} set={setTow} yellow />
        <FormField label="(−) Salvage Realised ₹" val={salvNet} set={setSV} yellow />
      </div>

      {/* 3-PANEL SETTLEMENT — Filtered in PDF to show only active selected loss type */}
      <div className="settlement-grid">
        {[
          {
            t: 'REPAIR LOSS',
            net: netRepair,
            active: lossType === 'Repair Loss',
            col: 'var(--navy)',
          },
          {
            t: 'CASH LOSS',
            net: netCash,
            active: lossType === 'Cash Loss',
            col: 'var(--grn-d)',
          },
          {
            t: 'NET SALVAGE',
            net: netSalvage,
            active: lossType === 'Net on Salvage Basis',
            col: '#4A148C',
          },
        ].map((p) => (
          <div
            key={p.t}
            className={`settlement-card ${p.active ? 'active' : 'inactive-loss-card'}`}
            style={{ borderColor: p.active ? p.col : undefined }}
          >
            <div className="settlement-card-head" style={{ background: p.col }}>
              <span>{p.t}</span>
              {p.active && <span className="active-badge">ACTIVE</span>}
            </div>
            <div
              className="settlement-card-body"
              style={{ background: p.active ? '#f0f4ff' : 'var(--bg)' }}
            >
              {[
                ['Parts (incl.GST)', pGross],
                ['Labour (incl.GST)', p.t === 'CASH LOSS' ? 0 : lGross],
                ['(−) Depreciation', pDepr],
                ['(−) Excess', ex],
                ['(−) Add.Excess', ax],
                ['(−) Betterment', bt],
                ['(−) Towing', tw],
                ...(p.t === 'NET SALVAGE' ? [['(−) Salvage', sv] as [string, number]] : []),
              ].map(([l, v]) => (
                <div
                  key={l as string}
                  className={`settlement-row ${
                    (l as string).startsWith('(−)') && (v as number) > 0 ? 'minus' : ''
                  }`}
                >
                  <span>{l}</span>
                  <span className="font-bold">₹{fmtN(v as number)}</span>
                </div>
              ))}
              <div className="settlement-net" style={{ background: p.col }}>
                <span>NET</span>
                <span>₹{fmtN(p.net)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NET PAYABLE BOX */}
      <div className="net-box">
        <div>
          <div className="net-box-label">{lossType}</div>
          <div className="net-box-title">NET ADMISSIBLE AMOUNT (APPROX.)</div>
          <div className="net-box-words">{words(Math.round(NET))}</div>
        </div>
        <div className="net-box-amount">₹{fmtN(NET)}</div>
      </div>

      {/* SUMMARY TABLES */}
      <SectionHeader title="Summary of Assessment" icon="📊" />
      <div className="summary-grid">
        <div className="summary-table">
          {[
            ['Original Estimate (Parts+Labour)', pGross + lGross, '#f5f7fa', false],
            ['Assessed Parts (incl.GST)', pGross, '#fff', false],
            ['Assessed Labour (incl.GST)', lGross, '#f5f7fa', false],
            ['Total Assessed', pGross + lGross, '#e8edf5', false],
            ['Less: Depreciation', pDepr, '#fff', true],
            ['Net after Depreciation', pNetD + lAdm, '#eaf5ea', false],
            ['Less: Policy Excess', ex, '#fff', true],
            ['Less: Additional Excess', ax, '#f5f7fa', true],
            ['Less: Betterment', bt, '#fff', true],
            ['Less: Towing', tw, '#f5f7fa', true],
            ['Less: Salvage Realised', sv, '#fff', true],
          ].map(([l, v, rbg, minus]) => (
            <div
              key={l as string}
              className={`summary-row ${minus && (v as number) > 0 ? 'minus' : ''}`}
              style={{ background: rbg as string }}
            >
              <span>{l}</span>
              <span className="font-bold">
                {minus && (v as number) > 0 ? `−₹${fmtN(v as number)}` : `₹${fmtN(v as number)}`}
              </span>
            </div>
          ))}
          <div className="summary-total">
            <span>APPROX. NET LOSS</span>
            <span>₹{fmtN(NET)}</span>
          </div>
        </div>

        <div className="gst-panel">
          <div className="gst-panel-title">GST Breakup</div>
          {[
            ['Parts GST Total', pCalc.reduce((s, c) => s + c.gstAmt, 0)],
            ['Labour GST Total', lCalc.reduce((s, c) => s + c.gst, 0)],
            [
              'Total GST in Assessment',
              pCalc.reduce((s, c) => s + c.gstAmt, 0) + lCalc.reduce((s, c) => s + c.gst, 0),
            ],
          ].map(([l, v]) => (
            <div key={l as string} className="gst-row">
              <span>{l}</span>
              <span className="font-bold">₹{fmtN(v as number)}</span>
            </div>
          ))}

          <div className="gst-panel-title mt-16 mb-8">Standard Remarks</div>
          {stdRemarks.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  whiteSpace: 'nowrap',
                  minWidth: '18px',
                }}
              >
                {i + 1}.
              </span>
              <input
                className="td-input"
                value={r}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  border: '1px solid #C5D0DC',
                  borderRadius: '4px',
                  flex: 1,
                  background: '#ffffff',
                }}
                onChange={(e) => {
                  const updated = [...stdRemarks];
                  updated[i] = e.target.value;
                  setStdRemarks(updated);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <SignatureBlock
        date={date}
        certText={certText}
        sigPlace={sigPlace}
        sigData={sigData}
        onCertTextChange={setCertText}
        onSigPlaceChange={setSigPlace}
        onSigDataChange={setSigData}
      />

      {/* ACTION BUTTONS */}
      <div className="btn-actions no-print">
        <Button label="Save Draft" onClick={handleSave} variant="muted" size="sm" icon={<Save size={14} />} />
        <Button label="Finalise" onClick={handleSave} variant="success" icon={<CheckCircle2 size={16} />} />
        <Button label="Copy Clipboard" onClick={handleCopyToClipboard} variant="navy" size="sm" icon={<Copy size={14} />} />
        <Button label="Export Excel" onClick={handleExportExcel} variant="gold" icon={<FileSpreadsheet size={16} />} />
        <Button label="Export PDF" onClick={handleExportPDF} variant="navy" icon={<FileText size={16} />} />
        <Button label="Print" onClick={handlePrint} variant="primary" icon={<Printer size={16} />} />
        <Button label="New Assessment" onClick={handleNew} variant="muted" size="sm" icon={<RotateCcw size={14} />} />
      </div>

      {ok && <div className="text-right mt-8"><span className="toast">{ok}</span></div>}
    </div>
  );
}
