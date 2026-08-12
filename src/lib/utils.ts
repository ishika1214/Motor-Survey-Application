// ─── Format a number as Indian currency ──────────────────────────────────────
export function fmtN(n: number | string): string {
  return (parseFloat(String(n)) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Today's date as DD-MM-YYYY ───────────────────────────────────────────────
export function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

// ─── Reference number generator ──────────────────────────────────────────────
export function mkRef(pre: string, n: number): string {
  return `KP/${pre}/${new Date().getFullYear()}/${String(n).padStart(4, '0')}`;
}

// ─── Number to words (Indian format) ─────────────────────────────────────────
export function words(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const w = (n: number): string => {
    if (!n) return '';
    if (n < 20)     return a[n];
    if (n < 100)    return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000)   return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + w(n % 100) : '');
    if (n < 100000) return w(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + w(n % 1000) : '');
    if (n < 10000000) return w(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + w(n % 100000) : '');
    return w(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + w(n % 10000000) : '');
  };

  return w(Math.round(num) || 0) + ' Only';
}

// ─── Parse float safely ───────────────────────────────────────────────────────
export function pf(v: string | number): number {
  return parseFloat(String(v)) || 0;
}

// ─── Copy text to clipboard ──────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, trying execCommand fallback', err);
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
}

