// Export PDF using browser print (best quality for complex tables)
export function printDocument(elementId: string): void {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  const printContents = el.innerHTML;
  const originalContents = document.body.innerHTML;

  // Apply print styles
  document.body.innerHTML = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #111; font-size: 11px;">
      ${printContents}
    </div>
  `;

  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
}

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    document.body.classList.add('pdf-print-mode');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el) => el.classList.contains('no-print'),
    });
    document.body.classList.remove('pdf-print-mode');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth  = canvas.width;
    const imgHeight = canvas.height;

    // Use full width of A4 with 6mm margins
    const margin = 6;
    const printWidth = pdfWidth - margin * 2;
    const imgHeightMm = (imgHeight * printWidth) / imgWidth;
    const pageHeight = pdfHeight - margin * 2;

    let heightLeft = imgHeightMm;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, printWidth, imgHeightMm);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMm + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, printWidth, imgHeightMm);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF export failed, falling back to print', err);
    window.print();
  }
}
