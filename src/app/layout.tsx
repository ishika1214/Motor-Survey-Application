import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KP Motor Surveyor | Kumar Pankaj — IRDAI Licensed Surveyor & Loss Assessor',
  description: 'Professional Motor Insurance Survey Reports, IRDAI-compliant Assessment Sheets, and Fee Bills — Kumar Pankaj, IRDAI Lic: IRDA/IND/SLA-124399',
  keywords: 'motor surveyor, IRDAI, loss assessor, insurance, survey report, assessment sheet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
