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
      if (/labour details|labor details/i.test(rowText)) {
        currentSection = 'labour';
        headerColMap = {};
        continue;
      }
      if (/part details/i.test(rowText)) {
        currentSection = 'parts';
        headerColMap = {};
        continue;
      }

      // Detect header row
      if (
        /description|particulars|part|component|item|part\/lab/i.test(rowText)
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
              (c.includes('part') && !c.includes('part no') && !c.includes('part%')) ||
              c.includes('name')) &&
            headerColMap['desc'] === undefined
          ) {
            headerColMap['desc'] = colIdx;
          } else if ((c.includes('hsn') || c.includes('sac')) && headerColMap['sac'] === undefined) {
            headerColMap['sac'] = colIdx;
          }
        });
        continue;
      }

      // Skip summary / header / footer rows
      if (
        /sub total|grand total|part total|rupees|declaration|customer signature|utkal|tax invoice|satisfaction note|gate pass/i.test(
          rowText
        )
      ) {
        continue;
      }

      let desc = '';
      let sac = '';

      if (Object.keys(headerColMap).length > 0) {
        if (headerColMap['desc'] !== undefined) desc = String(row[headerColMap['desc']] || '').trim();
        if (headerColMap['sac'] !== undefined) sac = String(row[headerColMap['sac']] || '').trim();
      } else {
        const strings = row.map((c) => String(c || '').trim()).filter((s) => s.length > 2);
        if (strings.length > 0) {
          desc = strings.find((s) => !/^\d+$/.test(s) && !/sr\.n|s\.no|part no/i.test(s) && s.length > 3) || strings[0];
          const sacMatch = strings.find((s) => /^\d{4,8}$/.test(s));
          if (sacMatch) sac = sacMatch;
        }
      }

      if (!desc || desc.length < 2 || /sr\.n|s\.no|part no|labour details|dealer gstin|invoice info|vehicle info/i.test(desc)) {
        continue;
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
          desc: desc, // Populate ONLY Part/Component description
          sac: sac || '998714', // Populate ONLY HSN/SAC code
          removalRefit: '', // Leave empty
          repair: '', // Leave empty
          painting: '', // Leave empty
        });
      } else {
        importedParts.push({
          id: importedParts.length + 1,
          desc: desc, // Populate ONLY Part/Component description
          mat: 'Metal / Steel',
          qty: '1',
          unit: 'Nos',
          oemRate: '', // Leave empty
          mktRate: '', // Leave empty
          appRate: '', // Leave empty
          salvage: '', // Leave empty
          rr: 'Replace',
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
