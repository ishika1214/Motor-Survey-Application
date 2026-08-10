'use client';
import React from 'react';
import type { Part, PartCalc } from '@/types';
import { MATS, RR_OPTIONS } from '@/lib/constants';
import { getGST } from '@/lib/calculations';
import { fmtN } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

interface PartsTableProps {
  parts: Part[];
  pCalc: PartCalc[];
  setPart: (index: number, key: keyof Part, value: string) => void;
  addPartRow: () => void;
  removePartRow: (index: number) => void;
}

export function PartsTable({
  parts,
  pCalc,
  setPart,
  addPartRow,
  removePartRow,
}: PartsTableProps) {
  const pGross = pCalc.reduce((s, c) => s + c.total, 0);
  const pGst = pCalc.reduce((s, c) => s + c.gstAmt, 0);
  const pDepr = pCalc.reduce((s, c) => s + c.deprAmt, 0);
  const pNetD = pCalc.reduce((s, c) => s + c.netD, 0);
  const pNetS = pCalc.reduce((s, c) => s + c.netS, 0);
  const pAdm = pCalc.reduce((s, c) => s + c.adm, 0);

  return (
    <div className="mb-16">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>#</th>
              <th style={{ width: '220px' }}>Part / Component</th>
              <th style={{ width: '130px' }}>Material Type</th>
              <th style={{ width: '50px' }}>Qty</th>
              <th style={{ width: '50px' }}>Unit</th>
              <th style={{ width: '90px' }}>Rate ₹</th>
              <th style={{ width: '50px' }}>GST%</th>
              <th style={{ width: '90px' }}>GST Amt ₹</th>
              <th style={{ width: '100px' }}>Total+GST ₹</th>
              <th style={{ width: '55px' }}>Depr%</th>
              <th style={{ width: '90px' }}>Depr Amt ₹</th>
              <th style={{ width: '100px' }}>Net/Depr ₹</th>
              <th style={{ width: '90px' }}>Salvage ₹</th>
              <th style={{ width: '32px' }}>✕</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p, i) => {
              const c = pCalc[i] || {
                base: 0,
                gstAmt: 0,
                total: 0,
                dpPct: 0,
                deprAmt: 0,
                netD: 0,
                netS: 0,
                adm: 0,
              };
              const rowClass = i % 2 === 0 ? 'row-even' : 'row-odd';

              return (
                <tr key={p.id} className={rowClass}>
                  <td className="text-center font-bold text-muted">{p.id}</td>
                  <td>
                    <input
                      value={p.desc}
                      onChange={(e) => setPart(i, 'desc', e.target.value)}
                      placeholder="e.g. Front Bumper"
                      className="td-input"
                    />
                  </td>
                  <td>
                    <select
                      value={p.mat}
                      onChange={(e) => setPart(i, 'mat', e.target.value)}
                      className="td-select"
                    >
                      {MATS.map((m) => (
                        <option key={m.label} value={m.label}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.qty}
                      onChange={(e) => setPart(i, 'qty', e.target.value)}
                      className="td-input text-center"
                    />
                  </td>
                  <td>
                    <input
                      value={p.unit}
                      onChange={(e) => setPart(i, 'unit', e.target.value)}
                      className="td-input text-center"
                    />
                  </td>
                  <td style={{ background: 'var(--gold-l)' }}>
                    <input
                      type="number"
                      value={p.oemRate || p.appRate}
                      onChange={(e) => setPart(i, 'oemRate', e.target.value)}
                      className="td-input yellow text-right"
                    />
                  </td>
                  <td className="text-center font-bold text-blue">{getGST(p.mat)}%</td>
                  <td className="text-right">{c.gstAmt ? fmtN(c.gstAmt) : '—'}</td>
                  <td className="text-right font-bold">{c.total ? fmtN(c.total) : '—'}</td>
                  <td
                    className="text-center font-bold"
                    style={{
                      background: c.dpPct > 0 ? 'var(--red-l)' : undefined,
                      color: c.dpPct > 0 ? 'var(--red-d)' : 'var(--muted)',
                    }}
                  >
                    {c.dpPct}%
                  </td>
                  <td
                    className="text-right font-bold"
                    style={{
                      background: c.deprAmt > 0 ? 'var(--red-l)' : undefined,
                      color: c.deprAmt > 0 ? 'var(--red-d)' : undefined,
                    }}
                  >
                    {c.deprAmt ? fmtN(c.deprAmt) : '—'}
                  </td>
                  <td className="text-right font-bold text-green" style={{ background: 'var(--grn-l)' }}>
                    {c.netD ? fmtN(c.netD) : '—'}
                  </td>
                  <td style={{ background: 'var(--gold-l)' }}>
                    <input
                      type="number"
                      value={p.salvage}
                      onChange={(e) => setPart(i, 'salvage', e.target.value)}
                      className="td-input yellow text-right"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => removePartRow(i)}
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
              <td colSpan={7} className="text-right font-bold" style={{ paddingRight: '12px' }}>
                PARTS TOTALS →
              </td>
              <td className="text-right font-bold">{fmtN(pGst)}</td>
              <td className="text-right font-bold">{fmtN(pGross)}</td>
              <td></td>
              <td className="text-right font-bold">{fmtN(pDepr)}</td>
              <td className="text-right font-bold">{fmtN(pNetD)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex items-center gap-12 no-print" style={{ marginTop: '8px' }}>
        <button
          type="button"
          onClick={addPartRow}
          className="btn btn-muted btn-sm"
          style={{ background: '#4A7AB5' }}
        >
          <Plus size={12} /> Add Part Row
        </button>
        <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: '12px' }}>
          ★ Yellow cells = key inputs &nbsp;|&nbsp; Painting: 50% depr on 25% of bill = 12.5% effective
        </span>
      </div>
    </div>
  );
}
