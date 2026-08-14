'use client';
import React from 'react';
import type { Labour, LabourCalc } from '@/types';
import { SAC_CODES } from '@/lib/constants';
import { fmtN } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

interface LabourTableProps {
  labs: Labour[];
  lCalc: LabourCalc[];
  lossType: string;
  setLab: (index: number, key: keyof Labour, value: string) => void;
  addLabRow: () => void;
  removeLabRow: (index: number) => void;
}

export function LabourTable({
  labs,
  lCalc,
  lossType,
  setLab,
  addLabRow,
  removeLabRow,
}: LabourTableProps) {
  const lBase = lCalc.reduce((s, c) => s + c.base, 0);
  const lGst = lCalc.reduce((s, c) => s + c.gst, 0);
  const lGross = lCalc.reduce((s, c) => s + c.total, 0);
  const lAdm = lCalc.reduce((s, c) => s + c.adm, 0);

  return (
    <div className="mb-16">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>#</th>
              <th style={{ width: '200px' }}>Labour Operation</th>
              <th style={{ width: '80px' }}>SAC Code</th>
              <th style={{ width: '100px' }}>Removal &amp; Refit ₹</th>
              <th style={{ width: '90px' }}>Repair ₹</th>
              <th style={{ width: '100px' }}>Painting Charges ₹</th>
              <th style={{ width: '85px' }}>Labour Amt ₹</th>
              <th style={{ width: '55px' }}>GST%</th>
              <th style={{ width: '85px' }}>GST Amt ₹</th>
              <th style={{ width: '95px' }}>Total ₹</th>
              <th style={{ width: '32px' }}>✕</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((l, i) => {
              const c = lCalc[i] || { base: 0, gst: 0, total: 0, adm: 0 };
              const rowClass = i % 2 === 0 ? 'row-even' : 'row-odd';

              return (
                <tr key={l.id} className={rowClass}>
                  <td className="text-center font-bold text-muted">{l.id}</td>
                  <td>
                    <input
                      value={l.desc}
                      onChange={(e) => setLab(i, 'desc', e.target.value)}
                      placeholder="e.g. Body repair, panel beating"
                      className="td-input"
                    />
                  </td>
                  <td>
                    <select
                      value={l.sac}
                      onChange={(e) => setLab(i, 'sac', e.target.value)}
                      className="td-select"
                    >
                      {SAC_CODES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ background: 'var(--gold-l)' }}>
                    <input
                      type="number"
                      value={l.removalRefit}
                      onChange={(e) => setLab(i, 'removalRefit', e.target.value)}
                      className="td-input yellow text-right"
                      placeholder="0.00"
                    />
                  </td>
                  <td style={{ background: 'var(--gold-l)' }}>
                    <input
                      type="number"
                      value={l.repair}
                      onChange={(e) => setLab(i, 'repair', e.target.value)}
                      className="td-input yellow text-right"
                      placeholder="0.00"
                    />
                  </td>
                  <td style={{ background: 'var(--gold-l)' }}>
                    <input
                      type="number"
                      value={l.painting}
                      onChange={(e) => setLab(i, 'painting', e.target.value)}
                      className="td-input yellow text-right"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="text-right font-bold">{c.base ? fmtN(c.base) : '—'}</td>
                  <td className="text-center font-bold text-blue">
                    <input
                      type="number"
                      value={l.gstPct !== undefined ? l.gstPct : '18'}
                      onChange={(e) => setLab(i, 'gstPct', e.target.value)}
                      className="td-input text-center font-bold text-blue"
                      placeholder="18"
                    />
                  </td>
                  <td className="text-right">{c.gst ? fmtN(c.gst) : '—'}</td>
                  <td className="text-right font-bold text-navy" style={{ background: '#E3F2FD' }}>
                    {c.total ? fmtN(c.total) : '—'}
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => removeLabRow(i)}
                      className="del-btn"
                      title="Remove row"
                    >
                      <X size={10} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="text-right font-bold" style={{ paddingRight: '12px' }}>
                LABOUR TOTALS →
              </td>
              <td className="text-right font-bold">{fmtN(lBase)}</td>
              <td></td>
              <td className="text-right font-bold">{fmtN(lGst)}</td>
              <td className="text-right font-bold">{fmtN(lGross)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex items-center gap-12 no-print" style={{ marginTop: '8px' }}>
        <button
          type="button"
          onClick={addLabRow}
          className="btn btn-muted btn-sm"
          style={{ background: '#4A7AB5' }}
        >
          <Plus size={12} /> Add Labour Row
        </button>
        <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: '12px' }}>
          SAC: 998714=Repair | 998511=Painting | 998512=Panel | 998713=Towing &nbsp;|&nbsp; Cash Loss → Labour = NIL
        </span>
      </div>
    </div>
  );
}
