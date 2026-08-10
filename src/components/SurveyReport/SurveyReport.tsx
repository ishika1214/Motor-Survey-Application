'use client';
import React, { useState } from 'react';
import type { SurveyRecord } from '@/types';
import { Letterhead } from '@/components/shared/Letterhead';
import { SignatureBlock } from '@/components/shared/SignatureBlock';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FormField } from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { today, mkRef } from '@/lib/utils';
import {
  BODY_TYPES,
  SURVEY_STATUSES,
  LOSS_TYPES,
  NATURE_OF_ACCIDENT,
  DOC_STATUSES,
} from '@/lib/constants';
import { exportSurveyExcel } from '@/lib/exportExcel';
import { exportToPDF, printDocument } from '@/lib/exportPdf';
import { Printer, FileSpreadsheet, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

const blankSR = (): SurveyRecord => ({
  id: Date.now(),
  refN: mkRef('SR', 1),
  date: today(),
  insurer: '',
  policyNo: '',
  claimNo: '',
  coverNote: '',
  insuredName: '',
  insuredMobile: '',
  insuredAddr: '',
  regNo: '',
  dateOfReg: '',
  makeModel: '',
  bodyType: 'Motor Car',
  mfgYear: '',
  engineNo: '',
  chassisNo: '',
  colour: '',
  odometer: '',
  vehicleClass: 'Private Car',
  regLadenWt: '',
  unladenWt: '',
  preAccCond: 'Reported Normal',
  fitCertNo: '',
  fitCertFrom: '',
  fitCertTo: '',
  permitNo: '',
  permitFrom: '',
  permitTo: '',
  natPermitAuth: '',
  natPermitValidTo: '',
  permitType: '',
  routeArea: '',
  loadCapacityKg: '',
  taxReceiptNo: '',
  taxPaidUpTo: '',
  driverName: '',
  dlNo: '',
  dlIssueDate: '',
  dlValid: '',
  dlRenewUpTo: '',
  dlIssuingDTO: '',
  dlType: '',
  badgeNo: '',
  dlEndorsement: '',
  accDate: '',
  accTime: '',
  accPlace: '',
  nature: 'Collision',
  policeReport: '',
  thirdParty: 'No',
  workshop: '',
  surveyDate: today(),
  surveyPlace: 'Workshop',
  firNo: '',
  firDate: '',
  stationDiaryNo: '',
  stationDiaryDate: '',
  damages: '',
  causeOfLoss: '',
  lossType: 'Repair Loss',
  regCopy: 'Yes – Xerox',
  taxToken: 'Yes – Xerox',
  dlCopy: 'Yes – Xerox',
  fitCert: 'N/A',
  routePermit: 'N/A',
  remarks: '',
  declarations: [
    'All original documents verified as mentioned above. Xerox copies attached.',
    'No supplementary estimate has been entertained.',
    'No one injured; no TP vehicle / property damaged.',
    'All taxes, depreciation, policy excess & voluntary excess as applicable.',
  ],
  certText: 'I hereby certify that I have personally inspected the above vehicle and the assessment recorded herein is true, fair and correct to the best of my professional knowledge and judgement, prepared in accordance with IRDAI / IMT guidelines and policy terms & conditions.',
  sigPlace: 'Jamshedpur',
  status: 'Draft',
});

export function SurveyReport() {
  const [f, setF] = useState<SurveyRecord>(blankSR());
  const [ok, setOk] = useState('');

  const s = <K extends keyof SurveyRecord>(k: K, v: SurveyRecord[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const handleSave = (status: SurveyRecord['status']) => {
    s('status', status);
    setOk(`✔ Survey ${f.refN} updated as ${status}`);
    setTimeout(() => setOk(''), 3000);
  };

  const handleExportExcel = () => {
    exportSurveyExcel(f);
  };

  const handleExportPDF = () => {
    exportToPDF('survey-report-print-area', `Survey_${f.refN.replace(/\//g, '-')}`);
  };

  const handlePrint = () => {
    printDocument('survey-report-print-area');
  };

  const handleNew = () => {
    setF(blankSR());
  };

  return (
    <div className="card" id="survey-report-print-area">
      <Letterhead
        refN={f.refN}
        date={f.date}
        title="Motor Vehicle Insurance — Survey Report"
        onRefNChange={(v) => s('refN', v)}
      />

      {/* SECTION 1 */}
      <SectionHeader title="1. Policy & Claim Reference" icon="🔖" />
      <div className="form-grid form-grid-3">
        <FormField label="Survey Ref No." val={f.refN} set={(v) => s('refN', v)} />
        <FormField label="Date of Survey" val={f.date} set={(v) => s('date', v)} />
        <FormField
          label="Status"
          val={f.status}
          set={(v) => s('status', v as SurveyRecord['status'])}
          opts={SURVEY_STATUSES}
          yellow
        />
        <FormField label="Insurance Company" val={f.insurer} set={(v) => s('insurer', v)} ph="e.g. ICICI Lombard" />
        <FormField label="Policy No." val={f.policyNo} set={(v) => s('policyNo', v)} />
        <FormField label="Claim No." val={f.claimNo} set={(v) => s('claimNo', v)} />
      </div>

      {/* SECTION 2 */}
      <SectionHeader title="2. Insured Details" icon="👤" />
      <div className="form-grid form-grid-3">
        <FormField label="Insured Name" val={f.insuredName} set={(v) => s('insuredName', v)} />
        <FormField label="Mobile No." val={f.insuredMobile} set={(v) => s('insuredMobile', v)} />
        <FormField label="Address" val={f.insuredAddr} set={(v) => s('insuredAddr', v)} span={3} />
      </div>

      {/* SECTION 3 */}
      <SectionHeader title="3. Vehicle Details" icon="🚗" />
      <div className="form-grid form-grid-3">
        {/* a) Registered No. */}
        <FormField label="a) Registered No." val={f.regNo} set={(v) => s('regNo', v)} ph="e.g. JH-05-CB-8983" />
        {/* b) Date of Registration */}
        <FormField label="b) Date of Registration" val={f.dateOfReg} set={(v) => s('dateOfReg', v)} ph="DD-MM-YYYY" />
        {/* c) Chassis No. */}
        <FormField label="c) Chassis No." val={f.chassisNo} set={(v) => s('chassisNo', v)} ph="e.g. MA1TA2WR2J2B24974" />
        {/* d) Engine No. */}
        <FormField label="d) Engine No." val={f.engineNo} set={(v) => s('engineNo', v)} ph="e.g. WRJ4B21575" />
        {/* e) Make/Model */}
        <FormField label="e) Make / Model" val={f.makeModel} set={(v) => s('makeModel', v)} ph="e.g. Mahindra Scorpio S11 / 2018" span={2} />
        {/* f) Type of Body */}
        <FormField label="f) Type of Body" val={f.bodyType} set={(v) => s('bodyType', v)} opts={BODY_TYPES} />
        {/* g) Class of Vehicle */}
        <FormField label="g) Class of Vehicle" val={f.vehicleClass} set={(v) => s('vehicleClass', v)} opts={['Private Car', 'Motor Car NT', 'Commercial LMV', 'Commercial HMV', 'Two Wheeler', 'Three Wheeler', 'Bus', 'Tractor', 'Other']} />
        {/* h) Pre-accident Condition */}
        <FormField label="h) Pre-accident Condition" val={f.preAccCond} set={(v) => s('preAccCond', v)} opts={['Reported Normal', 'Good', 'Average', 'Poor']} />
        {/* i) Registered Laden Weight */}
        <FormField label="i) Registered Laden Weight (kg)" val={f.regLadenWt} set={(v) => s('regLadenWt', v)} ph="e.g. 2510" />
        {/* j) Unladen Weight */}
        <FormField label="j) Unladen Weight (kg)" val={f.unladenWt} set={(v) => s('unladenWt', v)} ph="e.g. 1810" />
        {/* Year & Colour — supplementary */}
        <FormField label="Year of Manufacture" val={f.mfgYear} set={(v) => s('mfgYear', v)} ph="e.g. 2018" />
        <FormField label="Colour" val={f.colour} set={(v) => s('colour', v)} ph="e.g. White" />
        <FormField label="Odometer Reading (km)" val={f.odometer} set={(v) => s('odometer', v)} ph="e.g. 45000" />
      </div>

      {/* k) Fitness Certificate */}
      <div className="subsection-label no-print-hide">k) Fitness Certificate</div>
      <div className="form-grid form-grid-3">
        <FormField label="Fitness Certificate No." val={f.fitCertNo} set={(v) => s('fitCertNo', v)} />
        <FormField label="Valid From" val={f.fitCertFrom} set={(v) => s('fitCertFrom', v)} ph="DD-MM-YYYY" />
        <FormField label="Valid Up to" val={f.fitCertTo} set={(v) => s('fitCertTo', v)} ph="DD-MM-YYYY" />
      </div>

      {/* l) Permit No. */}
      <div className="subsection-label no-print-hide">l) Permit No.</div>
      <div className="form-grid form-grid-3">
        <FormField label="Permit No." val={f.permitNo} set={(v) => s('permitNo', v)} />
        <FormField label="Valid From" val={f.permitFrom} set={(v) => s('permitFrom', v)} ph="DD-MM-YYYY" />
        <FormField label="Valid Up to" val={f.permitTo} set={(v) => s('permitTo', v)} ph="DD-MM-YYYY" />
        <FormField label="National Permit Authorization" val={f.natPermitAuth} set={(v) => s('natPermitAuth', v)} />
        <FormField label="National Permit Valid Up to" val={f.natPermitValidTo} set={(v) => s('natPermitValidTo', v)} ph="DD-MM-YYYY" />
        {/* m) Type of Permit */}
        <FormField label="m) Type of Permit" val={f.permitType} set={(v) => s('permitType', v)} opts={['Route Permit', 'National Permit', 'Special Permit', 'N/A']} />
        {/* n) Route/Area of Operation */}
        <FormField label="n) Route / Area of Operation" val={f.routeArea} set={(v) => s('routeArea', v)} span={3} />
      </div>

      {/* o) Passenger/Load Carrying Capacity + p) Tax */}
      <div className="subsection-label no-print-hide">o) Load Carrying Capacity &amp; Tax Details</div>
      <div className="form-grid form-grid-3">
        <FormField label="o) Passenger / Load Carrying Capacity" val={f.loadCapacityKg} set={(v) => s('loadCapacityKg', v)} ph="e.g. Seven in All / 1500 kg" />
        <FormField label="p) Tax Taken / Receipt No." val={f.taxReceiptNo} set={(v) => s('taxReceiptNo', v)} ph="e.g. OTT / Jamshedpur" />
        <FormField label="q) Tax Paid Up To" val={f.taxPaidUpTo} set={(v) => s('taxPaidUpTo', v)} ph="DD-MM-YYYY" />
      </div>

      {/* SECTION 4 */}
      <SectionHeader title="4. Driver Details" icon="🪪" />
      <div className="form-grid form-grid-3">
        <FormField label="Driver Name" val={f.driverName} set={(v) => s('driverName', v)} />
        <FormField label="Motor Driving Licence No." val={f.dlNo} set={(v) => s('dlNo', v)} />
        <FormField label="Date of Issue of DL" val={f.dlIssueDate} set={(v) => s('dlIssueDate', v)} ph="DD-MM-YYYY" />
        <FormField label="Valid Up To" val={f.dlValid} set={(v) => s('dlValid', v)} ph="DD-MM-YYYY" />
        <FormField label="Valid Up To / Renew Up To" val={f.dlRenewUpTo} set={(v) => s('dlRenewUpTo', v)} ph="DD-MM-YYYY" />
        <FormField label="Issuing Authority (DTO)" val={f.dlIssuingDTO} set={(v) => s('dlIssuingDTO', v)} ph="e.g. DTO Jamshedpur" />
        <FormField label="Type of Licence" val={f.dlType} set={(v) => s('dlType', v)} opts={['LMV', 'LMV & MCWG', 'HMV', 'HTV', 'Hazardous', 'Non Transport', 'N/A']} />
        <FormField label="Badge No." val={f.badgeNo} set={(v) => s('badgeNo', v)} />
        <FormField label="Endorsement on Licence (if any)" val={f.dlEndorsement} set={(v) => s('dlEndorsement', v)} span={3} />
      </div>

      {/* SECTION 5 */}
      <SectionHeader title="5. Accident Details" icon="⚠️" />
      <div className="form-grid form-grid-3">
        <FormField label="Date of Accident" val={f.accDate} set={(v) => s('accDate', v)} />
        <FormField label="Time of Accident" val={f.accTime} set={(v) => s('accTime', v)} />
        <FormField label="Place of Accident" val={f.accPlace} set={(v) => s('accPlace', v)} />
        <FormField label="Nature of Accident" val={f.nature} set={(v) => s('nature', v)} opts={NATURE_OF_ACCIDENT} />
        <FormField label="Police Report No." val={f.policeReport} set={(v) => s('policeReport', v)} />
        <FormField label="Third Party Involved?" val={f.thirdParty} set={(v) => s('thirdParty', v)} opts={['No', 'Yes']} />
      </div>

      {/* SECTION 6 */}
      <SectionHeader title="6. Documents Verified" icon="📄" />
      <div className="form-grid form-grid-3">
        <FormField label="RC / Registration Cert." val={f.regCopy} set={(v) => s('regCopy', v)} opts={DOC_STATUSES} />
        <FormField label="Tax Token" val={f.taxToken} set={(v) => s('taxToken', v)} opts={DOC_STATUSES} />
        <FormField label="Driving Licence" val={f.dlCopy} set={(v) => s('dlCopy', v)} opts={DOC_STATUSES} />
        <FormField label="Fitness Certificate" val={f.fitCert} set={(v) => s('fitCert', v)} />
        <FormField label="Route Permit" val={f.routePermit} set={(v) => s('routePermit', v)} />
      </div>

      {/* SECTION 7 */}
      <SectionHeader title="7. Survey & Loss Details" icon="⚖️" />
      <div className="form-grid form-grid-3">
        <FormField label="Workshop / Garage" val={f.workshop} set={(v) => s('workshop', v)} />
        <FormField label="Date of Survey" val={f.surveyDate} set={(v) => s('surveyDate', v)} />
        <FormField label="Place of Survey" val={f.surveyPlace} set={(v) => s('surveyPlace', v)} />
        <FormField
          label="Loss Type"
          val={f.lossType}
          set={(v) => s('lossType', v)}
          opts={LOSS_TYPES}
          yellow
        />
      </div>

      {/* SECTION 7b – FIR Details */}
      <SectionHeader title="7b. FIR Details (if any)" icon="📌" />
      <div style={{ marginBottom: '8px', fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', paddingLeft: '2px' }}>
        Optional — fill only if a police complaint / FIR was registered
      </div>
      <div className="form-grid form-grid-2">
        <FormField label="Police Report / FIR No." val={f.firNo} set={(v) => s('firNo', v)} ph="e.g. FIR-2024-001" />
        <FormField label="FIR / Report Date" val={f.firDate} set={(v) => s('firDate', v)} ph="DD-MM-YYYY" />
        <FormField label="Station Diary No." val={f.stationDiaryNo} set={(v) => s('stationDiaryNo', v)} ph="e.g. GD-45/2024" />
        <FormField label="Station Diary Date" val={f.stationDiaryDate} set={(v) => s('stationDiaryDate', v)} ph="DD-MM-YYYY" />
      </div>

      {/* SECTION 8 */}
      <SectionHeader title="8. Observations" icon="📝" />
      <div className="form-grid form-grid-1 mb-8">
        <FormField
          label="Damage Description"
          val={f.damages}
          set={(v) => s('damages', v)}
          ph="e.g. Front bumper damaged, bonnet dented, windscreen cracked..."
        />
        <FormField label="Cause of Loss (Surveyor's Opinion)" val={f.causeOfLoss} set={(v) => s('causeOfLoss', v)} />
        <FormField label="Additional Remarks" val={f.remarks} set={(v) => s('remarks', v)} />
      </div>

      {/* Standard Declarations – Editable */}
      <div className="remarks-box">
        {f.declarations.map((r, i) => (
          <div key={i} className="remarks-item">
            <span style={{ minWidth: '16px', paddingTop: '2px' }}>{i + 1}.</span>
            <textarea
              className="decl-input"
              value={r}
              rows={2}
              onChange={(e) => {
                const updated = [...f.declarations];
                updated[i] = e.target.value;
                s('declarations', updated);
              }}
            />
          </div>
        ))}
      </div>

      <SignatureBlock
        date={f.surveyDate}
        certText={f.certText}
        sigPlace={f.sigPlace}
        onCertTextChange={(v) => s('certText', v)}
        onSigPlaceChange={(v) => s('sigPlace', v)}
      />

      {/* ACTION BUTTONS */}
      <div className="btn-actions no-print">
        <Button label="Save Draft" onClick={() => handleSave('Draft')} variant="muted" size="sm" />
        <Button label="Finalise" onClick={() => handleSave('Final')} variant="success" icon={<CheckCircle2 size={16} />} />
        <Button label="Export Excel" onClick={handleExportExcel} variant="gold" icon={<FileSpreadsheet size={16} />} />
        <Button label="Export PDF" onClick={handleExportPDF} variant="navy" icon={<FileText size={16} />} />
        <Button label="Print" onClick={handlePrint} variant="primary" icon={<Printer size={16} />} />
        <Button label="New Survey" onClick={handleNew} variant="muted" size="sm" icon={<RotateCcw size={14} />} />
      </div>

      {ok && <div className="text-right mt-8"><span className="toast">{ok}</span></div>}
    </div>
  );
}
