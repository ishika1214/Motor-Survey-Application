import type { SurveyRecord, AssessmentRecord, BillRecord } from '@/types';
import { getGST, calcPart, calcLabour, computeNet } from '@/lib/calculations';
import { words, pf } from '@/lib/utils';
import { KP } from '@/lib/constants';

// Dynamic import to avoid SSR issues
async function getXLSX() {
  const XLSX = await import('xlsx');
  return XLSX;
}

// ─── Export Survey Report to Excel (Matches PDF Header & Printable Form) ─────
export async function exportSurveyExcel(survey: SurveyRecord): Promise<void> {
  const XLSX = await getXLSX();

  const rows: (string | number)[][] = [
    // Top Letterhead Header — Left info (Cols A-C), Right info (Cols D-F)
    [KP.name.toUpperCase(), '', '', 'Jamshedpur Office', '', ''],
    ['Surveyor & Loss Assessor – Motor', '', '', KP.address, '', ''],
    ['IRDAI Lic No: ' + KP.lic + ' | Validity: ' + KP.validity, '', '', KP.bank, '', ''],
    ['Mob: ' + KP.mobile + ' | Email: ' + KP.email, '', '', 'A/C: ' + KP.account + ' | IFSC: ' + KP.ifsc, '', ''],
    ['Automobile Engg. | Licentiate – Insurance Institute of India', '', '', 'Ref No: ' + survey.refN, '', ''],
    ['', '', '', 'Date: ' + survey.date, '', ''],
    [''],
    ['MOTOR VEHICLE INSURANCE — SURVEY REPORT'],
    ['Private & Confidential — Issued without prejudice'],
    [''],
    ['1. POLICY & CLAIM REFERENCE'],
    ['Survey Ref No.', survey.refN, 'Date of Survey', survey.date, 'Status', survey.status],
    ['Insurance Company', survey.insurer, 'Policy No.', survey.policyNo, 'Claim No.', survey.claimNo],
    [''],
    ['2. INSURED DETAILS'],
    ['Insured Name', survey.insuredName, 'Mobile No.', survey.insuredMobile, '', ''],
    ['Address', survey.insuredAddr, '', '', '', ''],
    [''],
    ['3. VEHICLE DETAILS'],
    ['(a) Registration No.', survey.regNo, '(b) Make & Model', survey.makeModel, '', ''],
    ['(c) Type of Body', survey.bodyType, '(d) Year of Mfg', survey.mfgYear, '', ''],
    ['(e) Engine No.', survey.engineNo, '(f) Chassis No.', survey.chassisNo, '', ''],
    ['(g) Colour', survey.colour, '(h) Odometer Reading', survey.odometer, '', ''],
    ['(i) Class of Vehicle', survey.vehicleClass, '(j) Reg. Laden Wt (kg)', survey.regLadenWt, '', ''],
    ['(k) Unladen Wt (kg)', survey.unladenWt, '(l) Pre-Accident Condition', survey.preAccCond, '', ''],
    ['(m) Fitness Cert No.', survey.fitCertNo, '(n) Fitness Valid From', survey.fitCertFrom, '(o) Fitness Valid To', survey.fitCertTo],
    ['(p) Tax Receipt No.', survey.taxReceiptNo, '(q) Tax Paid Up To', survey.taxPaidUpTo, '', ''],
    ['Permit No.', survey.permitNo, 'Permit Valid From', survey.permitFrom, 'Permit Valid To', survey.permitTo],
    ['Nat. Permit Auth.', survey.natPermitAuth, 'Nat. Permit Valid To', survey.natPermitValidTo, 'Type of Permit', survey.permitType],
    ['Route / Area of Operation', survey.routeArea, 'Load Capacity (kg)', survey.loadCapacityKg, '', ''],
    [''],
    ['4. DRIVER DETAILS'],
    ['Driver Name', survey.driverName, 'DL No.', survey.dlNo, '', ''],
    ['DL Issue Date', survey.dlIssueDate || '', 'DL Valid Upto', survey.dlValid, '', ''],
    ['Renew Up To', survey.dlRenewUpTo || '', 'Issuing DTO', survey.dlIssuingDTO || '', '', ''],
    ['Type of Licence', survey.dlType || '', 'Badge No.', survey.badgeNo || '', '', ''],
    ['Endorsement', survey.dlEndorsement || '', '', '', '', ''],
    [''],
    ['5. ACCIDENT DETAILS'],
    ['Date of Accident', survey.accDate, 'Time of Accident', survey.accTime, 'Place', survey.accPlace],
    ['Nature of Accident', survey.nature, 'Police Report / FIR', survey.policeReport, 'Third Party Loss', survey.thirdParty],
    [''],
    ['6. DOCUMENTS VERIFIED'],
    ['RC Copy', survey.regCopy, 'Tax Token', survey.taxToken, 'DL Copy', survey.dlCopy],
    ['Fitness Cert', survey.fitCert, 'Route Permit', survey.routePermit, '', ''],
    [''],
    ['7. SURVEY & LOSS DETAILS'],
    ['Repairer / Workshop', survey.workshop, 'Survey Date', survey.surveyDate, 'Survey Place', survey.surveyPlace],
    ['Loss Type', survey.lossType, '', '', '', ''],
    [''],
    ['7b. FIR DETAILS (IF ANY)'],
    ['FIR / Police Report No.', survey.firNo, 'FIR Date', survey.firDate, '', ''],
    ['Station Diary No.', survey.stationDiaryNo, 'Station Diary Date', survey.stationDiaryDate, '', ''],
    [''],
    ['8. OBSERVATIONS'],
    ['Damage Description', survey.damages, '', '', '', ''],
    ["Cause of Loss (Surveyor's Opinion)", survey.causeOfLoss, '', '', '', ''],
    ['Additional Remarks', survey.remarks, '', '', '', ''],
    [''],
    ['STANDARD DECLARATIONS'],
    ...(survey.declarations || []).map((d, i) => [`${i + 1}.`, d, '', '', '', '']),
    [''],
    ['DECLARATION & SIGNATURE'],
    ['Certification', survey.certText || 'I hereby certify that I have personally inspected the above vehicle and the survey recorded herein is true, fair and correct.', '', '', '', ''],
    ['Date', survey.surveyDate || survey.date, 'Place', survey.sigPlace || 'Jamshedpur', '', ''],
    ['Signature', KP.name + ' (IRDA Lic: ' + KP.lic + ')', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 25 }, { wch: 32 }, { wch: 22 }, { wch: 32 }, { wch: 20 }, { wch: 32 }];
  ws['!pageSetup'] = { orientation: 'portrait', paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
  ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Survey Report');
  XLSX.writeFile(wb, `Survey_${survey.refN.replace(/\//g, '-')}.xlsx`);
}

// ─── Export Assessment Sheet to Excel (Matches PDF Header & Printable Form) ─
export async function exportAssessmentExcel(a: AssessmentRecord): Promise<void> {
  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  const pCalc = a.parts.map((p) => calcPart(p, a.vehAge, a.lossType));
  const lCalc = a.labs.map((l) => calcLabour(l, a.lossType));

  const pGross = pCalc.reduce((s, c) => s + c.total, 0);
  const pDepr = pCalc.reduce((s, c) => s + c.deprAmt, 0);
  const pNetD = pCalc.reduce((s, c) => s + c.netD, 0);
  const pSalv = a.parts.reduce((s, p) => s + (parseFloat(p.salvage) || 0), 0);

  const lGross = lCalc.reduce((s, c) => s + c.total, 0);
  const lBase = lCalc.reduce((s, c) => s + c.base, 0);
  const lGst = lCalc.reduce((s, c) => s + c.gst, 0);

  const ex = pf(a.excess);
  const ax = pf(a.addlEx);
  const sv = pf(a.salvNet);
  const bt = pf(a.betterment);
  const tw = pf(a.towing);

  const { NET } = computeNet(pCalc, lCalc, a.lossType, ex, ax, bt, tw, sv);

  const rows: (string | number)[][] = [
    // Top Letterhead Header — Left info (Cols A-H), Right info (Cols I-O)
    [KP.name.toUpperCase(), '', '', '', '', '', '', '', 'Jamshedpur Office', '', '', '', '', '', ''],
    ['Surveyor & Loss Assessor – Motor', '', '', '', '', '', '', '', KP.address, '', '', '', '', '', ''],
    ['IRDAI Lic No: ' + KP.lic + ' | Validity: ' + KP.validity, '', '', '', '', '', '', '', KP.bank, '', '', '', '', '', ''],
    ['Mob: ' + KP.mobile + ' | Email: ' + KP.email, '', '', '', '', '', '', '', 'A/C: ' + KP.account + ' | IFSC: ' + KP.ifsc, '', '', '', '', '', ''],
    ['Automobile Engg. | Licentiate – Insurance Institute of India', '', '', '', '', '', '', '', 'Ref No: ' + a.refN, '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', 'Date: ' + a.date, '', '', '', '', '', ''],
    [''],
    ['MOTOR INSURANCE — ASSESSMENT SHEET'],
    ['Private & Confidential — Issued without prejudice'],
    [''],
    ['1. CLAIM & VEHICLE DETAILS'],
    ['Assessment Ref No.', a.refN, 'Date', a.date, 'Loss Type', a.lossType],
    ['Insurance Company', a.insurer, 'Insured Name', a.insured, 'Vehicle Age', a.vehAge],
    ['Claim No.', a.claimNo, 'Policy No.', a.policyNo, 'Reg No. / Model', `${a.regNo} / ${a.mm}`],
    [''],
    ['2. SECTION A: PARTS ASSESSMENT'],
    ['#', 'Part Description', 'Material', 'Qty', 'Unit', 'OEM Rate (₹)', 'GST%', 'GST Amt (₹)', 'Total+GST (₹)', 'Depr%', 'Depr Amt (₹)', 'Net/Depr (₹)', 'Salvage (₹)', 'Admissible (₹)', 'R/R'],
    ...a.parts
      .filter((p) => p.desc || p.oemRate || p.appRate)
      .map((p, i) => {
        const c = calcPart(p, a.vehAge, a.lossType);
        return [
          i + 1,
          p.desc,
          p.mat,
          p.qty,
          p.unit,
          parseFloat(p.oemRate) || parseFloat(p.appRate) || 0,
          getGST(p.mat),
          c.gstAmt,
          c.total,
          c.dpPct,
          c.deprAmt,
          c.netD,
          parseFloat(p.salvage) || 0,
          c.adm,
          p.rr,
        ];
      }),
    ['TOTAL', 'PARTS TOTAL (SECTION A)', '', '', '', '', '', pCalc.reduce((s, c) => s + c.gstAmt, 0), pGross, '', pDepr, pNetD, pSalv, pCalc.reduce((s, c) => s + c.adm, 0), ''],
    [''],
    ['3. SECTION B: LABOUR OPERATIONS ASSESSMENT'],
    ['#', 'Labour Operation Description', 'SAC Code', 'Removal & Refit (₹)', 'Repair (₹)', 'Painting Charges (₹)', 'Labour Amt (₹)', 'GST 18% (₹)', 'Total (₹)', '', '', '', '', '', ''],
    ...a.labs
      .filter((l) => l.desc || l.removalRefit || l.repair || l.painting)
      .map((l, i) => {
        const c = calcLabour(l, a.lossType);
        return [
          i + 1,
          l.desc,
          l.sac,
          parseFloat(l.removalRefit) || 0,
          parseFloat(l.repair) || 0,
          parseFloat(l.painting) || 0,
          c.base,
          c.gst,
          c.total,
          '', '', '', '', '', ''
        ];
      }),
    ['TOTAL', 'LABOUR TOTAL (SECTION B)', '', a.labs.reduce((s, l) => s + (parseFloat(l.removalRefit) || 0), 0), a.labs.reduce((s, l) => s + (parseFloat(l.repair) || 0), 0), a.labs.reduce((s, l) => s + (parseFloat(l.painting) || 0), 0), lBase, lGst, lGross, '', '', '', '', '', ''],
    [''],
    ['4. SUMMARY OF ASSESSMENT & DEDUCTIONS'],
    ['Assessed Parts (incl GST)', pGross, '', '', 'Assessed Labour (incl GST)', lGross],
    ['Less: Parts Depreciation', pDepr, '', '', 'Net Parts after Depreciation', pNetD],
    ['Less: Policy Excess', ex, '', '', 'Less: Additional Excess', ax],
    ['Less: Betterment', bt, '', '', 'Less: Towing Allowed', tw],
    ['Less: Salvage Realised', sv],
    [''],
    ['NET ADMISSIBLE AMOUNT (APPROX.)', NET],
    ['Amount in Words', 'Rupees ' + words(Math.round(NET))],
    [''],
    ['5. STANDARD REMARKS'],
    ['1.', 'All original documents to be verified by Insurance Company.'],
    ['2.', 'No supplementary estimate entertained.'],
    ['3.', 'Salvage value as stated; all taxes & excess applicable.'],
    ['4.', 'Subject to final approval of Insurance Company.'],
    [''],
    ['6. DECLARATION & SIGNATURE'],
    ['Certification', 'I hereby certify that I have personally inspected the above vehicle and the assessment recorded herein is true, fair and correct to the best of my professional knowledge and judgement.'],
    ['Date', a.date, 'Place', 'Jamshedpur'],
    ['Signature', KP.name + ' (IRDA Lic: ' + KP.lic + ')'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 16 },
    { wch: 8 },
    { wch: 8 },
    { wch: 14 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
  ];
  ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
  ws['!margins'] = { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };

  XLSX.utils.book_append_sheet(wb, ws, 'Assessment Sheet');
  XLSX.writeFile(wb, `Assessment_${a.refN.replace(/\//g, '-')}.xlsx`);
}

// ─── Export Fee Bill to Excel (Matches PDF Header & Printable Form) ──────────
export async function exportBillExcel(b: BillRecord): Promise<void> {
  const XLSX = await getXLSX();

  const fees = pf(b.profFees);
  const conv = pf(b.conveyance);
  const rail = pf(b.railAir);
  const inc = pf(b.incidental);
  const photo = (pf(b.photoCnt) || 0) * 10 + (pf(b.rephoto) || 0) * 10 + (pf(b.cdCnt) || 0) * 50;
  const halt = pf(b.haltage);
  const sub = fees + conv + rail + inc + photo + halt;
  const sgst = (sub * pf(b.sgstPct)) / 100;
  const igst = (sub * pf(b.igstPct)) / 100;
  const total = sub + sgst + igst;

  const rows: (string | number)[][] = [
    // Top Letterhead Header — Left info (Cols A-B), Right info (Cols C-D)
    [KP.name.toUpperCase(), '', 'Jamshedpur Office', ''],
    ['Surveyor & Loss Assessor – Motor', '', KP.address, ''],
    ['IRDAI Lic No: ' + KP.lic + ' | Validity: ' + KP.validity, '', KP.bank, ''],
    ['Mob: ' + KP.mobile + ' | Email: ' + KP.email, '', 'A/C: ' + KP.account + ' | IFSC: ' + KP.ifsc, ''],
    ['Automobile Engg. | Licentiate – Insurance Institute of India', '', 'Invoice No: ' + b.billNo, ''],
    ['', '', 'Date: ' + b.date, ''],
    [''],
    ['SURVEY FEE INVOICE'],
    ['Private & Confidential — Issued without prejudice'],
    [''],
    ['1. BILL REFERENCE & POLICY DETAILS'],
    ['Invoice No.', b.billNo, 'Date', b.date, 'Payment Status', b.status],
    ['Billed To (Insurer)', b.insurer, 'Insured Name', b.insuredName, 'Vehicle No.', b.vehicleNo],
    ['Policy No.', b.policyNo, 'Claim No.', b.claimNo, 'Survey Type', b.surveyType],
    [''],
    ['2. FEE SCHEDULE & CHARGES'],
    ['#', 'Fee Particulars / Description', 'Rate / Basis', 'Amount (₹)'],
    [1, 'Professional Survey & Loss Assessment Fees', 'Scale Fee', fees],
    [2, 'Conveyance Charges (Local Inspection Travel)', 'Local Conveyance', conv],
    [3, 'Outstation Travel Charges (Rail / Air)', 'Actuals', rail],
    [4, 'Incidental Charges (Postage, Printing & Admin)', 'Actuals', inc],
    [5, `Photo Charges (${b.photoCnt || 0} Photos @ ₹10)`, `${b.photoCnt || 0} Photos`, (pf(b.photoCnt) || 0) * 10],
    [6, `Re-inspection Photos (${b.rephoto || 0} Photos @ ₹10)`, `${b.rephoto || 0} Photos`, (pf(b.rephoto) || 0) * 10],
    [7, `CD / Digital Media (${b.cdCnt || 0} CD @ ₹50)`, `${b.cdCnt || 0} CD`, (pf(b.cdCnt) || 0) * 50],
    [8, 'Haltage Charges', 'Overnight Stay', halt],
    ['TOTAL', 'SUB TOTAL', '', sub],
    ['', `SGST @ ${b.sgstPct || 9}%`, '', sgst],
    ['', `CGST / IGST @ ${b.igstPct || 0}%`, '', igst],
    ['TOTAL', 'TOTAL PAYABLE', '', total],
    [''],
    ['Amount in Words', 'Rupees ' + words(Math.round(total))],
    [''],
    ['3. PAYMENT & BANK INFORMATION'],
    ['Bank Name', KP.bank, 'Account Number', KP.account],
    ['IFSC Code', KP.ifsc, 'PAN Number', KP.pan],
    [''],
    ['4. DECLARATION & SIGNATURE'],
    ['Certification', 'I hereby certify that the professional fee and expenses claimed above are true, correct and in accordance with IRDAI scale of fees and guidelines.'],
    ['Date', b.date, 'Place', 'Jamshedpur'],
    ['Signature', KP.name + ' (IRDA Lic: ' + KP.lic + ')'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 45 }, { wch: 25 }, { wch: 18 }];
  ws['!pageSetup'] = { orientation: 'portrait', paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
  ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fee Invoice');
  XLSX.writeFile(wb, `FeeBill_${b.billNo.replace(/\//g, '-')}.xlsx`);
}
