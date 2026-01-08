import { Settings } from './database';

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  logo?: string;
  data: PDFReportSection[];
  footer?: string;
}

export interface PDFReportSection {
  type: 'stats' | 'table' | 'chart-placeholder' | 'text';
  title?: string;
  stats?: { label: string; value: string; color?: string }[];
  tableHeaders?: string[];
  tableRows?: string[][];
  text?: string;
}

export function generatePDFReport(options: PDFReportOptions, settings?: Settings | null): void {
  const { title, subtitle, data, footer } = options;
  const restaurantName = settings?.restaurantName || 'المطعم';
  const logoUrl = settings?.logo || '';

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #fff;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #f97316;
      margin-bottom: 30px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logo {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      object-fit: cover;
    }
    .brand-info h1 {
      font-size: 24px;
      color: #1a1a1a;
      font-weight: 700;
    }
    .brand-info p {
      font-size: 12px;
      color: #666;
    }
    .report-title {
      text-align: left;
    }
    .report-title h2 {
      font-size: 20px;
      color: #f97316;
      font-weight: 700;
    }
    .report-title p {
      font-size: 12px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #fed7aa;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, #f97316, #ea580c);
      border-radius: 2px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .stat-card {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #fed7aa;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #c2410c;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      padding: 12px 15px;
      text-align: right;
      font-weight: 600;
    }
    th:first-child { border-radius: 0 8px 0 0; }
    th:last-child { border-radius: 8px 0 0 0; }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #f3f4f6;
      text-align: right;
    }
    tr:nth-child(even) { background: #fafafa; }
    tr:hover { background: #fff7ed; }
    .text-section {
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f3f4f6;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    .footer-brand {
      font-weight: 600;
      color: #f97316;
    }
    .no-print { display: none; }
    @media screen {
      .print-btn {
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
      }
      .print-btn:hover { transform: scale(1.05); }
      .no-print { display: block; }
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">طباعة التقرير</button>
  
  <div class="page">
    <div class="header">
      <div class="brand">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
        <div class="brand-info">
          <h1>${restaurantName}</h1>
          <p>${settings?.address || ''}</p>
        </div>
      </div>
      <div class="report-title">
        <h2>${title}</h2>
        <p>${subtitle || new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    ${data.map(section => {
      if (section.type === 'stats' && section.stats) {
        return `
          <div class="section">
            ${section.title ? `<div class="section-title">${section.title}</div>` : ''}
            <div class="stats-grid">
              ${section.stats.map(stat => `
                <div class="stat-card">
                  <div class="stat-value" style="${stat.color ? `color: ${stat.color}` : ''}">${stat.value}</div>
                  <div class="stat-label">${stat.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (section.type === 'table' && section.tableHeaders && section.tableRows) {
        return `
          <div class="section">
            ${section.title ? `<div class="section-title">${section.title}</div>` : ''}
            <table>
              <thead>
                <tr>
                  ${section.tableHeaders.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${section.tableRows.map(row => `
                  <tr>
                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      if (section.type === 'text' && section.text) {
        return `
          <div class="section">
            ${section.title ? `<div class="section-title">${section.title}</div>` : ''}
            <div class="text-section">${section.text}</div>
          </div>
        `;
      }

      return '';
    }).join('')}

    <div class="footer">
      <p class="footer-brand">${restaurantName}</p>
      <p>${footer || `تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleString('ar-EG')}`}</p>
      ${settings?.phone ? `<p>هاتف: ${settings.phone}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
