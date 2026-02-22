import { Order, Settings } from './database';

// Generate QR code for menu link
const generateQRCodeSVG = (menuUrl: string): string => {
  // Simple QR code using qrcode.js pattern - we'll create a simple version
  // In production, you'd use a library like qrcode.js
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <!-- This is a placeholder. In production, use qrcode library -->
      <!-- For now, we'll generate a data URL that points to the menu -->
      <rect width="100" height="100" fill="white"/>
      <rect x="5" y="5" width="20" height="20" fill="black"/>
      <rect x="75" y="5" width="20" height="20" fill="black"/>
      <rect x="5" y="75" width="20" height="20" fill="black"/>
      <text x="50" y="50" text-anchor="middle" font-family="monospace" font-size="6" fill="black">Menu QR</text>
      <title>${menuUrl}</title>
    </svg>
  `;
};

// Generate barcode SVG for order number
const generateBarcodeSVG = (orderNumber: string): string => {
  const data = orderNumber.replace(/[^0-9]/g, '').padStart(12, '0').slice(-12);
  const bars: string[] = [];
  let x = 0;
  const barWidth = 2;
  const height = 40;
  
  // Simple Code128-like representation
  const patterns: { [key: string]: string } = {
    '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000',
    '4': '10010001100', '5': '10001001100', '6': '10011001000', '7': '10011000100',
    '8': '10001100100', '9': '11001001000'
  };
  
  // Start pattern
  bars.push(`<rect x="${x}" y="0" width="${barWidth * 2}" height="${height}" fill="#000"/>`);
  x += barWidth * 3;
  bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#000"/>`);
  x += barWidth * 2;
  
  // Data bars
  for (const char of data) {
    const pattern = patterns[char] || patterns['0'];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#000"/>`);
      }
      x += barWidth;
    }
    x += barWidth;
  }
  
  // End pattern
  bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#000"/>`);
  x += barWidth * 2;
  bars.push(`<rect x="${x}" y="0" width="${barWidth * 2}" height="${height}" fill="#000"/>`);
  
  const totalWidth = x + barWidth * 2;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height + 20}" viewBox="0 0 ${totalWidth} ${height + 20}">
      ${bars.join('')}
      <text x="${totalWidth / 2}" y="${height + 15}" text-anchor="middle" font-family="monospace" font-size="10">${orderNumber}</text>
    </svg>
  `;
};

// Generate A5 professional invoice
export const generateA5Invoice = (
  order: Order,
  settings?: Settings
): string => {
  const restaurantName = settings?.restaurantName || 'مطعمي';
  const restaurantNameEn = settings?.restaurantNameEn || 'My Restaurant';
  const phone = settings?.phone || '';
  const address = settings?.address || '';
  const receiptFooter = settings?.receiptFooter || 'شكراً لزيارتكم!';
  const logo = settings?.logo;

  const orderTypeLabel = 
    order.type === 'dine-in' ? `طاولة ${order.tableName || ''}` : 
    order.type === 'delivery' ? 'توصيل' : 'استلام';
  
  const paymentLabel = 
    order.paymentMethod === 'cash' ? 'نقدي' : 
    order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة إلكترونية';

  const dateStr = new Date(order.createdAt).toLocaleDateString('ar-EG');
  const timeStr = new Date(order.createdAt).toLocaleTimeString('ar-EG');
  
  const barcodeSVG = generateBarcodeSVG(order.orderNumber);

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ${order.orderNumber}</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      width: 148mm;
      height: 210mm;
      padding: 12mm;
      background: white;
      color: #1a1a1a;
    }
    .invoice {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    /* Header Section */
    .header {
      text-align: center;
      padding-bottom: 15px;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 15px;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 25%;
      right: 25%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #3b82f6, transparent);
    }
    .logo-section {
      margin-bottom: 10px;
    }
    .logo-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      margin-bottom: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    }
    .logo-image {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin-bottom: 8px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .restaurant-name {
      font-size: 22px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 3px;
      letter-spacing: 1px;
    }
    .restaurant-name-en {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 8px;
      font-size: 10px;
      color: #475569;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Invoice Title */
    .invoice-title {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #bae6fd;
    }
    .invoice-number {
      font-size: 16px;
      font-weight: bold;
      color: #0369a1;
    }
    .invoice-date {
      text-align: left;
      font-size: 10px;
      color: #64748b;
    }
    .invoice-date span {
      display: block;
    }
    
    /* Order Info */
    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .info-card {
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-card h4 {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-card p {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
    }
    
    /* Customer Info */
    .customer-section {
      background: linear-gradient(135deg, #fefce8, #fef9c3);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 15px;
      border: 1px solid #fde047;
    }
    .customer-section h3 {
      font-size: 11px;
      color: #a16207;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .customer-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 10px;
    }
    .customer-details span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Items Table */
    .items-section {
      flex: 1;
      margin-bottom: 15px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .items-table thead {
      background: linear-gradient(135deg, #1e40af, #2563eb);
    }
    .items-table th {
      color: white;
      padding: 10px 8px;
      text-align: right;
      font-weight: 600;
      font-size: 10px;
    }
    .items-table th:first-child {
      border-radius: 0 8px 0 0;
    }
    .items-table th:last-child {
      border-radius: 8px 0 0 0;
      text-align: left;
    }
    .items-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .items-table td:last-child {
      text-align: left;
      font-weight: 600;
      color: #1e40af;
    }
    .items-table tbody tr:hover {
      background: #f8fafc;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .item-number {
      width: 25px;
      text-align: center;
      color: #94a3b8;
      font-size: 9px;
    }
    .item-name {
      font-weight: 500;
    }
    .item-qty {
      text-align: center;
      background: #f1f5f9;
      border-radius: 4px;
      padding: 2px 8px;
      font-weight: 600;
    }
    
    /* Totals Section */
    .totals-section {
      background: #f8fafc;
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 15px;
      border: 1px solid #e2e8f0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 11px;
    }
    .total-row.discount {
      color: #16a34a;
    }
    .total-row.grand-total {
      border-top: 2px solid #2563eb;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
    }
    
    /* Payment Badge */
    .payment-section {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    .payment-badge {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 11px;
      box-shadow: 0 2px 10px rgba(34, 197, 94, 0.3);
    }
    .order-type-badge {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 11px;
      box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
    }
    
    /* Barcode Section */
    .barcode-section {
      text-align: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
    }
    .barcode-section svg {
      max-width: 200px;
      height: auto;
    }
    .barcode-label {
      font-size: 8px;
      color: #94a3b8;
      margin-top: 4px;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding-top: 12px;
      border-top: 2px dashed #cbd5e1;
    }
    .footer-thanks {
      font-size: 14px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .footer-info {
      font-size: 9px;
      color: #94a3b8;
    }
    .cashier-info {
      font-size: 10px;
      color: #64748b;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
    }
    
    /* Decorative Elements */
    .corner-decoration {
      position: absolute;
      width: 30px;
      height: 30px;
      border: 3px solid #3b82f6;
      opacity: 0.3;
    }
    .corner-top-right {
      top: 8mm;
      right: 8mm;
      border-left: none;
      border-bottom: none;
      border-radius: 0 8px 0 0;
    }
    .corner-top-left {
      top: 8mm;
      left: 8mm;
      border-right: none;
      border-bottom: none;
      border-radius: 8px 0 0 0;
    }
    .corner-bottom-right {
      bottom: 8mm;
      right: 8mm;
      border-left: none;
      border-top: none;
      border-radius: 0 0 8px 0;
    }
    .corner-bottom-left {
      bottom: 8mm;
      left: 8mm;
      border-right: none;
      border-top: none;
      border-radius: 0 0 0 8px;
    }
    
    @media print {
      body {
        width: 148mm;
        height: 210mm;
        margin: 0;
        padding: 10mm;
      }
      .corner-decoration {
        display: block;
      }
    }
  </style>
</head>
<body>
  <div class="corner-decoration corner-top-right"></div>
  <div class="corner-decoration corner-top-left"></div>
  <div class="corner-decoration corner-bottom-right"></div>
  <div class="corner-decoration corner-bottom-left"></div>
  
  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        ${logo ? 
          `<img src="${logo}" alt="Logo" class="logo-image" />` : 
          `<div class="logo-icon">🍽️</div>`
        }
        <div class="restaurant-name">${restaurantName}</div>
        ${restaurantNameEn ? `<div class="restaurant-name-en">${restaurantNameEn}</div>` : ''}
      </div>
      <div class="contact-info">
        ${phone ? `<div class="contact-item">📞 ${phone}</div>` : ''}
        ${address ? `<div class="contact-item">📍 ${address}</div>` : ''}
      </div>
    </div>

    <!-- Invoice Title -->
    <div class="invoice-title">
      <div class="invoice-number">فاتورة رقم: #${order.orderNumber}</div>
      <div class="invoice-date">
        <span>📅 ${dateStr}</span>
        <span>🕐 ${timeStr}</span>
      </div>
    </div>

    <!-- Order Info -->
    <div class="order-info">
      <div class="info-card">
        <h4>نوع الطلب</h4>
        <p>${orderTypeLabel}</p>
      </div>
      <div class="info-card">
        <h4>طريقة الدفع</h4>
        <p>${paymentLabel}</p>
      </div>
    </div>

    ${order.customerName || order.customerPhone || order.customerAddress ? `
    <!-- Customer Info -->
    <div class="customer-section">
      <h3>👤 بيانات العميل</h3>
      <div class="customer-details">
        ${order.customerName ? `<span>الاسم: ${order.customerName}</span>` : ''}
        ${order.customerPhone ? `<span>الهاتف: ${order.customerPhone}</span>` : ''}
        ${order.customerAddress ? `<span style="grid-column: span 2;">العنوان: ${order.customerAddress}</span>` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Items -->
    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 25px;">#</th>
            <th>الصنف</th>
            <th style="width: 50px; text-align: center;">الكمية</th>
            <th style="width: 60px; text-align: center;">السعر</th>
            <th style="width: 70px;">المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, index) => `
          <tr>
            <td class="item-number">${index + 1}</td>
            <td class="item-name">${item.productName}</td>
            <td><span class="item-qty">${item.quantity}</span></td>
            <td style="text-align: center;">${item.unitPrice.toFixed(2)}</td>
            <td>${item.total.toFixed(2)} ج.م</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span>المجموع الفرعي:</span>
        <span>${order.subtotal.toFixed(2)} ج.م</span>
      </div>
      ${order.discount > 0 ? `
      <div class="total-row discount">
        <span>الخصم:</span>
        <span>- ${order.discount.toFixed(2)} ج.م</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>الإجمالي المستحق:</span>
        <span>${order.total.toFixed(2)} ج.م</span>
      </div>
    </div>

    <!-- Payment Badges -->
    <div class="payment-section">
      <span class="order-type-badge">${orderTypeLabel}</span>
      <span class="payment-badge">✓ تم الدفع - ${paymentLabel}</span>
    </div>

    ${order.notes ? `
    <div style="background: #fef3c7; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 10px; border: 1px solid #fde68a;">
      <strong>📝 ملاحظات:</strong> ${order.notes}
    </div>
    ` : ''}

    <!-- Barcode and QR Code -->
    <div style="display: flex; gap: 20px; margin-bottom: 15px; align-items: center; justify-content: center;">
      <!-- Barcode -->
      <div class="barcode-section">
        ${barcodeSVG}
        <div class="barcode-label">رقم الطلب - للتتبع والاستعلام</div>
      </div>
      
      <!-- QR Code for Menu -->
      <div style="text-align: center;">
        <div style="background: white; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
          ${generateQRCodeSVG(window.location.origin + '/menu')}
        </div>
        <div style="font-size: 9px; color: #64748b; font-weight: 500;">اسح رمز QR<br/>لمشاهدة القائمة</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-thanks">${receiptFooter}</div>
      <div class="footer-info">
        نشكركم على زيارتكم ونتمنى لكم تجربة طعام ممتعة
      </div>
      ${order.userName ? `
      <div class="cashier-info">
        الموظف: ${order.userName} | ${new Date().toLocaleDateString('ar-EG', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}
      </div>
      ` : ''}
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
`;
};

// Print A5 invoice
export const printA5Invoice = (order: Order, settings?: Settings): void => {
  const invoiceHtml = generateA5Invoice(order, settings);
  
  const printWindow = window.open('', '_blank', 'width=560,height=800');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }
};
