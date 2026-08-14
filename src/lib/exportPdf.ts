// Export PDF with high fidelity and visible form fields
export function printDocument(elementId: string): void {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  window.print();
}

/**
 * Transforms form controls inside cloned DOM node to visible static elements
 * ensuring 100% field visibility, sharp borders, and perfect formatting in PDF.
 */
function prepareElementForPDF(original: HTMLElement): HTMLElement {
  const clone = original.cloneNode(true) as HTMLElement;

  const origControls = original.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );
  const cloneControls = clone.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );

  origControls.forEach((origEl, idx) => {
    const cloneEl = cloneControls[idx];
    if (!cloneEl) return;

    const val = origEl.value || '';
    const span = document.createElement('div');

    const isYellow = origEl.classList.contains('yellow');
    const isCenter = origEl.classList.contains('text-center');
    const isRight = origEl.classList.contains('text-right');
    const isBold = origEl.classList.contains('font-bold') || origEl.classList.contains('lh-ref-input');

    const bg = isYellow ? '#FFF8E6' : '#FFFFFF';
    const borderColor = isYellow ? '#D97706' : '#B0BEC5';
    const textAlign = isCenter ? 'center' : isRight ? 'right' : 'left';

    let textContent = val;
    if (origEl.tagName === 'SELECT') {
      const select = origEl as HTMLSelectElement;
      textContent = select.options[select.selectedIndex]?.text || val;
    }

    span.textContent = textContent || ' '; // space ensures empty field height retention

    const isInlineSm = origEl.classList.contains('inline-input-sm');
    const isTdInput = origEl.classList.contains('td-input') || origEl.classList.contains('td-select');

    span.style.cssText = `
      display: ${isInlineSm ? 'inline-block' : 'block'};
      width: ${isInlineSm ? '45px' : '100%'};
      min-height: ${origEl.tagName === 'TEXTAREA' ? '42px' : '22px'};
      padding: ${isTdInput ? '2px 4px' : '4px 6px'};
      font-size: ${isTdInput ? '10px' : '11px'};
      font-weight: ${isBold ? '700' : '500'};
      font-family: 'Inter', Arial, sans-serif;
      color: #0D2137;
      background-color: ${bg};
      border: 1px solid ${borderColor};
      border-radius: 4px;
      text-align: ${textAlign};
      box-sizing: border-box;
      white-space: pre-wrap;
      word-break: break-word;
    `;

    cloneEl.parentNode?.replaceChild(span, cloneEl);
  });

  // Requirement 4: Loss-Type-Specific PDF Output
  // Hide inactive loss type calculation cards so PDF reflects ONLY selected loss type
  const inactiveCards = clone.querySelectorAll('.settlement-card.inactive-loss-card, .settlement-card:not(.active)');
  inactiveCards.forEach((card) => card.remove());

  // Ensure active settlement card takes clean layout
  const settlementGrid = clone.querySelector<HTMLElement>('.settlement-grid');
  if (settlementGrid) {
    settlementGrid.style.display = 'flex';
    settlementGrid.style.justifyContent = 'center';
  }
  const activeCard = clone.querySelector<HTMLElement>('.settlement-card.active');
  if (activeCard) {
    activeCard.style.width = '100%';
    activeCard.style.maxWidth = '450px';
    activeCard.style.margin = '0 auto';
  }

  // Requirement 7: Show Only Assessed Line Items
  // Filter out blank / unassessed rows in Parts and Labour tables
  const tables = clone.querySelectorAll<HTMLTableElement>('.data-table');
  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    let rowCounter = 1;

    rows.forEach((row) => {
      const text = row.textContent || '';
      const isBlank = !text.replace(/\s|—|0\.00|0|Nos|Replace|Repair|Repaint|Align|Check/g, '').trim();

      if (isBlank) {
        row.remove();
      } else {
        const firstCol = row.querySelector('td:first-child');
        if (firstCol && firstCol.classList.contains('font-bold')) {
          firstCol.textContent = String(rowCounter++);
        }
      }
    });
  });

  // Prevent section break distortions across pages
  const pageBreakElements = clone.querySelectorAll<HTMLElement>(
    '.section-header, .sig-block, .settlement-card, .summary-table, .gst-panel, .form-grid, .data-table, .deductions-grid, .remarks-box'
  );
  pageBreakElements.forEach((el) => {
    el.style.breakInside = 'avoid';
    el.style.pageBreakInside = 'avoid';
  });

  // Remove interactive non-printable controls
  const noPrints = clone.querySelectorAll('.no-print, .btn-actions, .del-btn');
  noPrints.forEach((el) => el.remove());

  return clone;
}

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  let wrapper: HTMLDivElement | null = null;
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Create off-screen container for crisp high-DPI rendering
    wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.width = '960px';
    wrapper.style.background = '#ffffff';
    wrapper.style.padding = '24px';
    wrapper.style.boxSizing = 'border-box';

    const pdfClone = prepareElementForPDF(element);
    wrapper.appendChild(pdfClone);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(pdfClone, {
      scale: 1.8,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 960,
    });

    // Remove temp element immediately after canvas capture
    document.body.removeChild(wrapper);
    wrapper = null;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const printWidth = pdfWidth - margin * 2;
    const pageHeightMm = pdfHeight - margin * 2;

    // Slice canvas into exact page-height chunks
    const pxPageHeight = Math.floor((canvas.width * pageHeightMm) / printWidth);
    const pageCanvas = document.createElement('canvas');
    const pageCtx = pageCanvas.getContext('2d');

    let renderedHeight = 0;
    let pageNum = 0;

    while (renderedHeight < canvas.height) {
      if (pageNum > 0) {
        pdf.addPage();
      }

      const sliceHeight = Math.min(pxPageHeight, canvas.height - renderedHeight);
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.88);
      const pageImgMmHeight = (sliceHeight * printWidth) / canvas.width;

      pdf.addImage(pageImgData, 'JPEG', margin, margin, printWidth, pageImgMmHeight);

      renderedHeight += sliceHeight;
      pageNum++;
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    if (wrapper && document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
    console.error('PDF export failed, falling back to print', err);
    window.print();
  }
}
