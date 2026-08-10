import type { Material } from '@/types';

// ─── Surveyor Info ───────────────────────────────────────────────────────────
export const KP = {
  name:     'KUMAR PANKAJ',
  lic:      'IRDA/IND/SLA-124399',
  validity: '21-07-2026',
  pan:      'CPNPP8131B',
  mobile:   '7070995947',
  email:    'kumarpankajsla@outlook.com',
  bank:     'Axis Bank Ltd',
  account:  '918010050074005',
  ifsc:     'UTIB0000411',
  address:  'Adityapur, Jamshedpur, Jharkhand-831013',
  qual:     'Automobile Engg. | Licentiate – Insurance Institute of India',
  city:     'Jamshedpur',
} as const;

// ─── IRDAI Materials (IMT GR-35) ─────────────────────────────────────────────
export const MATS: Material[] = [
  { label: 'Metal / Steel',      depr: 'age',   flat: null, gst: 18 },
  { label: 'Plastic / ABS',      depr: 'flat',  flat: 50,   gst: 18 },
  { label: 'Rubber',             depr: 'flat',  flat: 50,   gst: 18 },
  { label: 'Glass',              depr: 'nil',   flat: 0,    gst: 18 },
  { label: 'Fibre Glass / FRP',  depr: 'flat',  flat: 30,   gst: 18 },
  { label: 'Tyre / Tube',        depr: 'flat',  flat: 50,   gst: 28 },
  { label: 'Battery',            depr: 'flat',  flat: 50,   gst: 18 },
  { label: 'Airbag',             depr: 'flat',  flat: 50,   gst: 18 },
  { label: 'Electrical',         depr: 'age',   flat: null, gst: 18 },
  { label: 'Interior / Fabric',  depr: 'age',   flat: null, gst: 12 },
  { label: 'Engine Parts',       depr: 'age',   flat: null, gst: 18 },
  { label: 'Painting',           depr: 'paint', flat: 50,   gst: 18 },
  { label: 'Other',              depr: 'age',   flat: null, gst: 18 },
];

// ─── Color Palette ───────────────────────────────────────────────────────────
export const COLORS = {
  navy:   '#0D2137',
  blue:   '#1A3A6B',
  gold:   '#C8860A',
  goldL:  '#FFF8E6',
  grnD:   '#1B5E20',
  grnL:   '#E8F5E9',
  redD:   '#B71C1C',
  redL:   '#FDECEA',
  bg:     '#F0F4F9',
  border: '#C5D0DC',
  muted:  '#607080',
  white:  '#FFFFFF',
} as const;

// ─── Dropdown Options ────────────────────────────────────────────────────────
export const BODY_TYPES = ['Motor Car', 'SUV/MUV', 'Two Wheeler', 'Commercial LMV', 'Commercial HMV', 'Bus', 'Three Wheeler', 'Tractor'] as const;
export const SURVEY_STATUSES = ['Draft', 'In Progress', 'Spot Survey', 'Final', 'Repudiated'] as const;
export const LOSS_TYPES = ['Repair Loss', 'Cash Loss', 'Net on Salvage Basis', 'Total Loss (CTL/ATL)'] as const;
export const ASSESSMENT_LOSS_TYPES = ['Repair Loss', 'Cash Loss', 'Net on Salvage Basis'] as const;
export const NATURE_OF_ACCIDENT = ['Collision', 'Rear-end', 'Self Accident', 'Hit & Run', 'Overturning', 'Fire', 'Flood', 'Theft', 'Other'] as const;
export const DOC_STATUSES = ['Yes – Original', 'Yes – Xerox', 'Not Available'] as const;
export const RR_OPTIONS = ['Replace', 'Repair', 'Repaint', 'Align', 'Check'] as const;
export const SAC_CODES = ['998714', '998511', '998512', '998713'] as const;
export const SURVEY_TYPES = ['Physical Survey', 'Re-survey', 'Spot Survey', 'Final Survey'] as const;
export const BILL_STATUSES = ['Unpaid', 'Paid', 'Partial'] as const;
export const VEHICLE_AGE_OPTIONS = [
  'Up to 6 months',
  '> 6 months – 1 year',
  '> 1 – 2 years',
  '> 2 – 3 years',
  '> 3 – 4 years',
  '> 4 – 5 years',
  '> 5 – 10 years',
  'Exceeding 10 years',
] as const;
