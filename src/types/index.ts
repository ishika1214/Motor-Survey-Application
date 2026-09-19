// ─── Material types ─────────────────────────────────────────────────────────
export type DeprType = 'age' | 'flat' | 'nil' | 'paint';

export interface Material {
  label: string;
  depr: DeprType;
  flat: number | null;
  gst: number;
}

// ─── Parts & Labour ─────────────────────────────────────────────────────────
export type RRType = 'Replace' | 'Repair' | 'Repaint' | 'Align' | 'Check';

export type CoverageType = 'Normal Calculation' | 'Zero Depreciation';

export interface Part {
  id: number;
  desc: string;
  mat: string;
  qty: string;
  unit: string;
  oemRate: string;
  mktRate: string;
  appRate: string;
  salvage: string;
  rr: RRType;
  gstPct?: string;
  dpPctOverride?: string;
}

export interface PartCalc {
  base: number;
  gstAmt: number;
  total: number;
  dpPct: number;
  deprAmt: number;
  netD: number;
  netS: number;
  adm: number;
}

export interface Labour {
  id: number;
  desc: string;
  sac: string;
  removalRefit: string;
  repair: string;
  painting: string;
  stdH?: string;
  clmH?: string;
  appH?: string;
  rateH?: string;
  gstPct?: string;
}

export interface LabourCalc {
  base: number;
  gst: number;
  total: number;
  adm: number;
}

// ─── Survey Report ──────────────────────────────────────────────────────────
export type SurveyStatus = 'Draft' | 'In Progress' | 'Spot Survey' | 'Final' | 'Repudiated';
export type LossType = 'Repair Loss' | 'Cash Loss' | 'Net on Salvage Basis' | 'Total Loss (CTL/ATL)';
export type BodyType = 'Motor Car' | 'SUV/MUV' | 'Two Wheeler' | 'Commercial LMV' | 'Commercial HMV' | 'Bus' | 'Three Wheeler' | 'Tractor';
export type NatureOfAccident = 'Collision' | 'Rear-end' | 'Self Accident' | 'Hit & Run' | 'Overturning' | 'Fire' | 'Flood' | 'Theft' | 'Other';
export type DocStatus = 'Yes – Original' | 'Yes – Xerox' | 'Not Available' | 'N/A';

export interface SurveyRecord {
  id: number;
  refN: string;
  date: string;
  status: SurveyStatus;
  // Section 1 – Policy & Claim
  insurer: string;
  policyNo: string;
  claimNo: string;
  coverNote: string;
  // Section 2 – Insured
  insuredName: string;
  insuredMobile: string;
  insuredAddr: string;
  // Section 3 – Vehicle
  regNo: string;
  dateOfReg: string;
  makeModel: string;
  bodyType: string;
  mfgYear: string;
  engineNo: string;
  chassisNo: string;
  colour: string;
  odometer: string;
  vehicleClass: string;
  regLadenWt: string;
  unladenWt: string;
  preAccCond: string;
  // Fitness Certificate
  fitCertNo: string;
  fitCertFrom: string;
  fitCertTo: string;
  // Route / National Permit
  permitNo: string;
  permitFrom: string;
  permitTo: string;
  natPermitAuth: string;
  natPermitValidTo: string;
  permitType: string;
  routeArea: string;
  // Load & Tax
  loadCapacityKg: string;
  taxReceiptNo: string;
  taxPaidUpTo: string;
  // Section 4 – Driver
  vehicleState?: 'Driving' | 'Parked';
  driverName: string;
  dlNo: string;
  dlIssueDate: string;
  dlValid: string;
  dlRenewUpTo: string;
  dlIssuingDTO: string;
  dlType: string;
  badgeNo: string;
  dlEndorsement: string;
  // Section 5 – Accident
  accDate: string;
  accTime: string;
  accPlace: string;
  nature: string;
  policeReport: string;
  thirdParty: string;
  // Section 6 – Documents
  regCopy: string;
  taxToken: string;
  dlCopy: string;
  fitCert: string;
  routePermit: string;
  // Section 7 – Survey
  workshop: string;
  surveyDate: string;
  surveyPlace: string;
  lossType: string;
  // Section 7b – FIR Details
  firNo: string;
  firDate: string;
  stationDiaryNo: string;
  stationDiaryDate: string;
  // Section 8 – Observations
  damages: string;
  causeOfLoss: string;
  remarks: string;
  // Declarations & Signature
  declarations: string[];
  certText: string;
  sigPlace: string;
}

// ─── Assessment Sheet ────────────────────────────────────────────────────────
export interface AssessmentRecord {
  id: number;
  refN: string;
  date: string;
  insurer: string;
  insured: string;
  claimNo: string;
  policyNo: string;
  regNo: string;
  mm: string;
  vehAge: string;
  idv: string;
  coverageType: string;
  lossType: string;
  excess: string;
  addlEx: string;
  salvNet: string;
  betterment: string;
  towing: string;
  parts: Part[];
  labs: Labour[];
  net: number;
}

// ─── Fee Bill ────────────────────────────────────────────────────────────────
export type BillStatus = 'Unpaid' | 'Paid' | 'Partial';

export interface BillRecord {
  id: number;
  billNo: string;
  date: string;
  status: BillStatus;
  insurer: string;
  insuredName: string;
  vehicleNo: string;
  policyNo: string;
  claimNo: string;
  dateLoss: string;
  dateSurvey: string;
  surveyType: string;
  profFees: string;
  conveyance: string;
  railAir: string;
  incidental: string;
  photoCnt: string;
  rephoto: string;
  cdCnt: string;
  haltage: string;
  sgstPct: string;
  igstPct: string;
  total?: number;
}

// ─── App State ───────────────────────────────────────────────────────────────
export type ActiveTab = 'survey' | 'assessment' | 'bill';

export interface AppState {
  surveys: SurveyRecord[];
  assessments: AssessmentRecord[];
  bills: BillRecord[];
}
