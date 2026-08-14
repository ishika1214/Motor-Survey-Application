import { MATS } from '@/lib/constants';
import type { Part, PartCalc, Labour, LabourCalc } from '@/types';

// ─── Age-based Depreciation (IRDAI IMT GR-35) ────────────────────────────────
// ─── Age-based Depreciation (IRDAI Motor Depreciation Schedule) ──────────────
// ─── Age-based Depreciation (IRDAI IMT GR-35 Schedule) ────────────────────────
export function ageDepr(ageVal: number | string): number {
  if (typeof ageVal === 'string') {
    const s = ageVal.trim();
    if (!s) return 0;
    if (s.includes('Up to 6 months')) return 0;
    if (s.includes('6 months – 1 year') || s.includes('6 months to 1 year')) return 5;
    if (s.includes('1 – 2') || s.includes('1 - 2') || s.includes('1 to 2')) return 10;
    if (s.includes('2 – 3') || s.includes('2 - 3') || s.includes('2 to 3')) return 15;
    if (s.includes('3 – 4') || s.includes('3 - 4') || s.includes('3 to 4')) return 25;
    if (s.includes('4 – 5') || s.includes('4 - 5') || s.includes('4 to 5')) return 35;
    if (s.includes('5 – 10') || s.includes('5 - 10') || s.includes('> 5')) return 40;
    if (s.includes('Exceeding') || s.includes('> 10') || s.includes('10 years')) return 50;

    const num = parseFloat(s);
    if (!isNaN(num)) return ageDepr(num);
    return 0;
  }

  const age = ageVal;
  if (age <= 0) return 0;
  if (age <= 0.5) return 0;   // Up to 6 months = 0%
  if (age <= 1)   return 5;   // > 6 months – 1 year = 5%
  if (age <= 2)   return 10;  // > 1 – 2 years = 10%
  if (age <= 3)   return 15;  // > 2 – 3 years = 15%
  if (age <= 4)   return 25;  // > 3 – 4 years = 25%
  if (age <= 5)   return 35;  // > 4 – 5 years = 35%
  if (age <= 10)  return 40;  // > 5 – 10 years = 40%
  return 50;                  // Exceeding 10 years = 50%
}

// ─── Get Depreciation % for a Material ──────────────────────────────────────
export function getDepr(
  mat: string,
  ageVal: number | string,
  coverageType: string = 'Normal Calculation',
  overridePct?: string
): number {
  if (coverageType === 'Zero Depreciation') {
    return 0;
  }

  if (overridePct !== undefined && overridePct !== null && overridePct.trim() !== '') {
    const parsed = parseFloat(overridePct);
    if (!isNaN(parsed)) return parsed;
  }

  const m = MATS.find(x => x.label === mat);
  if (m) {
    if (m.depr === 'nil')   return 0;
    if (m.depr === 'flat')  return m.flat ?? 0;
    if (m.depr === 'paint') return 50;
    return ageDepr(ageVal);
  }

  // Fallback pattern matching for material names
  const lower = mat.toLowerCase();
  if (lower.includes('glass') && !lower.includes('fiber') && !lower.includes('fibre')) return 0;
  if (lower.includes('plastic') || lower.includes('rubber') || lower.includes('tyre') || lower.includes('battery') || lower.includes('airbag')) return 50;
  if (lower.includes('fiber') || lower.includes('fibre')) return 30;
  if (lower.includes('painting')) return 50;

  return ageDepr(ageVal);
}

// ─── Get GST % for a Material ────────────────────────────────────────────────
export function getGST(mat: string): number {
  return (MATS.find(x => x.label === mat) ?? { gst: 18 }).gst;
}

// ─── Calculate a Single Part Row ─────────────────────────────────────────────
export function calcPart(
  p: Part,
  ageVal: number | string,
  lossType: string,
  coverageType: string = 'Normal Calculation'
): PartCalc {
  const qty   = parseFloat(p.qty)     || 0;
  const rate  = parseFloat(p.oemRate) || parseFloat(p.appRate) || 0;
  
  const gst   = p.gstPct !== undefined && p.gstPct !== null && p.gstPct.trim() !== ''
    ? (parseFloat(p.gstPct) || 0)
    : getGST(p.mat);

  const base  = qty * rate;
  const gstAmt = base * gst / 100;
  const total  = base + gstAmt;

  const dp     = getDepr(p.mat, ageVal, coverageType, p.dpPctOverride);
  // Painting: 50% depr on 25% of bill = 12.5% effective if specified as Painting
  const isPainting = p.mat.toLowerCase().includes('painting');
  const deprAmt = isPainting ? total * 0.25 * 0.5 : total * dp / 100;
  const dpPct   = isPainting ? 12.5 : dp;

  const netD   = Math.max(0, total - deprAmt);
  const salv   = parseFloat(p.salvage) || 0;
  const netS   = Math.max(0, netD - salv);
  const adm    = lossType === 'Net on Salvage Basis' ? netS : netD;

  return { base, gstAmt, total, dpPct, deprAmt, netD, netS, adm };
}

// ─── Calculate a Single Labour Row ───────────────────────────────────────────
export function calcLabour(l: Labour, lossType: string): LabourCalc {
  const rr    = parseFloat(l.removalRefit || '') || 0;
  const rep   = parseFloat(l.repair || '')       || 0;
  const paint = parseFloat(l.painting || '')     || 0;

  const legacyBase = (parseFloat(l.appH || '') || 0) * (parseFloat(l.rateH || '') || 0);
  const base = (rr + rep + paint) > 0 ? (rr + rep + paint) : legacyBase;

  const gstRate = l.gstPct !== undefined && l.gstPct !== null && l.gstPct.trim() !== ''
    ? (parseFloat(l.gstPct) || 0)
    : 18;

  const gst   = base * gstRate / 100;
  const total = base + gst;
  const adm   = lossType === 'Cash Loss' ? 0 : total;
  return { base, gst, total, adm };
}

// ─── Net Payable Computations ─────────────────────────────────────────────────
export function computeNet(
  pCalc: PartCalc[],
  lCalc: LabourCalc[],
  lossType: string,
  excess: number,
  addlEx: number,
  betterment: number,
  towing: number,
  salvNet: number,
): { netRepair: number; netCash: number; netSalvage: number; NET: number } {
  const pNetD  = pCalc.reduce((s, c) => s + c.netD,  0);
  const pAdm   = pCalc.reduce((s, c) => s + c.adm,   0);
  const lAdm   = lCalc.reduce((s, c) => s + c.adm,   0);
  const lGross = lCalc.reduce((s, c) => s + c.total,  0);

  const netRepair  = Math.max(0, pNetD + lAdm   - excess - addlEx - betterment - towing);
  const netCash    = Math.max(0, pNetD           - excess - addlEx - betterment - towing);
  const netSalvage = Math.max(0, pAdm  + lGross - excess - addlEx - betterment - towing - salvNet);

  const NET =
    lossType === 'Repair Loss'          ? netRepair :
    lossType === 'Cash Loss'            ? netCash   :
    netSalvage;

  return { netRepair, netCash, netSalvage, NET };
}
