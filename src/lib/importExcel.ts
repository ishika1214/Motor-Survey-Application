import type { Part, Labour } from '@/types';

export interface ImportResult {
  parts: Part[];
  labs: Labour[];
  countParts: number;
  countLabs: number;
}

export async function parseMaintenanceExcel(file: File): Promise<ImportResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const importedParts: Part[] = [];
  const importedLabs: Labour[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows || rows.length === 0) return;

    let currentSection: 'parts' | 'labour' = 'parts';
    let headerColMap: Record<string, number> = {};

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rowText = row.map((cell) => String(cell || '').trim()).join(' ');
      if (!rowText) continue;

      // Section header detection
      if (/labour details|labor details|labour operations|labor operations/i.test(rowText)) {
        currentSection = 'labour';
        headerColMap = {};
        continue;
      }
      if (/part details|parts details|parts list|components/i.test(rowText)) {
        currentSection = 'parts';
        headerColMap = {};
        continue;
      }

      // Detect header row
      if (
        /description|particulars|part|component|item|part\/lab|rate|price|amount|cost|gst|tax/i.test(rowText) &&
        !headerColMap['desc']
      ) {
        headerColMap = {};
        row.forEach((cell, colIdx) => {
          const c = String(cell || '').trim().toLowerCase();
          
          if (
            (c.includes('desc') ||
              c.includes('particular') ||
              c.includes('component') ||
              c.includes('item') ||
              c.includes('part/lab') ||
              (c.includes('part') && !c.includes('part no') && !c.includes('part%') && !c.includes('rate') && !c.includes('amt') && !c.includes('cost')) ||
              c.includes('name')) &&
            headerColMap['desc'] === undefined
          ) {
            headerColMap['desc'] = colIdx;
          } else if ((c.includes('hsn') || c.includes('sac')) && headerColMap['sac'] === undefined) {
            headerColMap['sac'] = colIdx;
          } else if (
            (c.includes('rate') || c.includes('price') || c.includes('cost') || c.includes('unit rate') || c.includes('oem rate') || c === 'amt' || c === 'amount' || c.includes('unit price')) &&
            !c.includes('gst') && !c.includes('tax') &&
            headerColMap['rate'] === undefined
          ) {
            headerColMap['rate'] = colIdx;
          } else if (
            (c.includes('gst%') || c.includes('tax%') || c.includes('gst') || c.includes('tax') || c.includes('sgst') || c.includes('cgst') || c.includes('igst')) &&
            !c.includes('amt') && !c.includes('amount') && !c.includes('value') &&
            headerColMap['gst'] === undefined
          ) {
            headerColMap['gst'] = colIdx;
          } else if (
            (c.includes('qty') || c.includes('quantity') || c.includes('nos')) &&
            headerColMap['qty'] === undefined
          ) {
            headerColMap['qty'] = colIdx;
          }
        });
        if (headerColMap['desc'] !== undefined) {
          continue;
        }
      }

      // Skip summary / header / footer rows
      if (
        /sub total|grand total|part total|labour total|rupees|declaration|customer signature|utkal|tax invoice|satisfaction note|gate pass/i.test(
          rowText
        )
      ) {
        continue;
      }

      let desc = '';
      let sac = '';
      let rateStr = '';
      let gstStr = '';
      let qtyStr = '1';

      if (Object.keys(headerColMap).length > 0) {
        if (headerColMap['desc'] !== undefined) desc = String(row[headerColMap['desc']] || '').trim();
        if (headerColMap['sac'] !== undefined) sac = String(row[headerColMap['sac']] || '').trim();
        if (headerColMap['rate'] !== undefined) rateStr = String(row[headerColMap['rate']] || '').trim();
        if (headerColMap['gst'] !== undefined) gstStr = String(row[headerColMap['gst']] || '').trim();
        if (headerColMap['qty'] !== undefined) qtyStr = String(row[headerColMap['qty']] || '').trim() || '1';
      } else {
        const cellStrings = row.map((c) => String(c || '').trim()).filter((s) => s.length > 0);
        if (cellStrings.length > 0) {
          const descMatch = cellStrings.find(
            (s) => s.length > 3 && !/^\d+(\.\d+)?$/.test(s) && !/sr\.n|s\.no|part no|sl\.no/i.test(s)
          );
          if (descMatch) desc = descMatch;

          const sacMatch = cellStrings.find((s) => /^\d{4,8}$/.test(s));
          if (sacMatch) sac = sacMatch;

          // Numeric fields extraction
          const numbers = cellStrings
            .map((s) => ({ raw: s, num: parseFloat(s.replace(/[^0-9.]/g, '')) }))
            .filter((o) => !isNaN(o.num) && o.num > 0);

          for (const n of numbers) {
            if (n.raw.includes('%') || (n.num <= 28 && n.num > 0 && n.num % 1 === 0 && !gstStr)) {
              gstStr = String(n.num);
            } else if (n.num > 10 && !rateStr) {
              rateStr = String(n.num);
            }
          }
        }
      }

      if (!desc || desc.length < 2 || /sr\.n|s\.no|part no|sl\.no|labour details|dealer gstin|invoice info|vehicle info|description/i.test(desc)) {
        continue;
      }

      const cleanRate = rateStr ? rateStr.replace(/[^0-9.]/g, '') : '';
      let cleanGst = gstStr ? gstStr.replace(/[^0-9.]/g, '') : '';
      if (cleanGst) {
        const gstNum = parseFloat(cleanGst);
        if (!isNaN(gstNum) && gstNum > 0 && gstNum <= 1) {
          cleanGst = String(gstNum * 100);
        }
      }

      const isLabourRow =
        currentSection === 'labour' ||
        sac.startsWith('9987') ||
        /weld|dent|paint|labor|labour|alignment|calibrat|fitting|assembly- r nr|charge/i.test(
          desc
        );

      if (isLabourRow) {
        importedLabs.push({
          id: importedLabs.length + 1,
          desc: desc,
          sac: sac || '998714',
          removalRefit: '',
          repair: cleanRate,
          painting: '',
          gstPct: cleanGst || '18',
        });
      } else {
        importedParts.push({
          id: importedParts.length + 1,
          desc: desc,
          mat: 'A) Metal or Wooden Parts',
          qty: qtyStr || '1',
          unit: 'Nos',
          oemRate: cleanRate,
          mktRate: '',
          appRate: cleanRate,
          salvage: '',
          rr: 'Replace',
          gstPct: cleanGst,
        });
      }
    }
  });

  return {
    parts: importedParts,
    labs: importedLabs,
    countParts: importedParts.length,
    countLabs: importedLabs.length,
  };
}
