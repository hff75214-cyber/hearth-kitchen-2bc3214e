import { Order, Settings } from './database';

// 80mm thermal printer = ~48 characters per line (for monospace font)
const LINE_WIDTH = 48;

// Helper functions
const centerText = (text: string): string => {
  const padding = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2));
  return ' '.repeat(padding) + text;
};

const leftRight = (left: string, right: string): string => {
  const spaces = Math.max(1, LINE_WIDTH - left.length - right.length);
  return left + ' '.repeat(spaces) + right;
};

const dividerLine = (char: string = '─'): string => char.repeat(LINE_WIDTH);
const doubleDivider = (): string => '═'.repeat(LINE_WIDTH);

// Format currency
const formatCurrency = (amount: number): string => `${amount.toFixed(2)} ج.م`;

// Generate thermal receipt HTML
export const generateThermalReceipt = (
  order: Order,
  settings?: Settings
): string => {
  const restaurantName = settings?.restaurantName || 'مطعمي';
  const restaurantNameEn = settings?.restaurantNameEn || 'My Restaurant';
  const phone = settings?.phone || '';
  const address = settings?.address || '';
  const receiptFooter = settings?.receiptFooter || 'شكراً لزيارتكم!';

  const orderTypeLabel = 
    order.type === 'dine-in' ? `طاولة ${order.tableName || ''}` : 
    order.type === 'delivery' ? 'توصيل' : 'استلام';
  
  const paymentLabel = 
    order.paymentMethod === 'cash' ? 'نقدي' : 
    order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة إلكترونية';

  const dateStr = new Date(order.createdAt).toLocaleDateString('ar-EG');
  const timeStr = new Date(order.createdAt).toLocaleTimeString('ar-EG');

  // Build receipt HTML optimized for 80mm thermal printer
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ${order.orderNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      width: 80mm;
      padding: 8px;
      background: white;
      color: black;
    }
    .receipt {
      width: 100%;
    }
    .center {
      text-align: center;
    }
    .bold {
      font-weight: bold;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
    }
    .double-divider {
      border-top: 2px solid #000;
      margin: 8px 0;
    }
    .header {
      text-align: center;
      padding-bottom: 8px;
    }
    .header h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .header h2 {
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 11px;
      color: #333;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11px;
    }
    .info-label {
      color: #555;
    }
    .order-number {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin: 8px 0;
      padding: 8px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }
    .items-table th {
      border-bottom: 1px solid #000;
      padding: 4px 2px;
      font-size: 10px;
      font-weight: bold;
      text-align: right;
    }
    .items-table th:last-child {
      text-align: left;
    }
    .items-table td {
      padding: 6px 2px;
      font-size: 11px;
      border-bottom: 1px dashed #ccc;
      vertical-align: top;
    }
    .items-table td:last-child {
      text-align: left;
      font-weight: bold;
    }
    .item-name {
      max-width: 120px;
      word-wrap: break-word;
    }
    .item-qty {
      text-align: center;
      width: 30px;
    }
    .item-price {
      text-align: center;
      width: 50px;
    }
    .totals {
      margin-top: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 11px;
    }
    .total-row.discount {
      color: #28a745;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
      font-weight: bold;
      border-top: 2px solid #000;
      margin-top: 4px;
    }
    .payment-info {
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      margin: 8px 0;
      text-align: center;
      font-size: 12px;
    }
    .customer-info {
      background: #f9f9f9;
      padding: 8px;
      border-radius: 4px;
      margin: 8px 0;
      font-size: 11px;
    }
    .customer-info p {
      margin-bottom: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px dashed #000;
    }
    .footer p {
      font-size: 11px;
      margin-bottom: 4px;
    }
    .footer .thanks {
      font-size: 14px;
      font-weight: bold;
      margin-top: 8px;
    }
    .qr-placeholder {
      width: 60px;
      height: 60px;
      margin: 8px auto;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #999;
    }
    .cashier {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-top: 8px;
    }
    @media print {
      body {
        width: 80mm;
        margin: 0;
        padding: 4mm;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <h1>${restaurantName}</h1>
      ${restaurantNameEn ? `<h2>${restaurantNameEn}</h2>` : ''}
      ${phone ? `<p>📞 ${phone}</p>` : ''}
      ${address ? `<p>📍 ${address}</p>` : ''}
    </div>

    <div class="double-divider"></div>

    <!-- Order Number -->
    <div class="order-number">
      طلب رقم: #${order.orderNumber}
    </div>

    <!-- Order Info -->
    <div class="info-row">
      <span class="info-label">التاريخ:</span>
      <span>${dateStr}</span>
    </div>
    <div class="info-row">
      <span class="info-label">الوقت:</span>
      <span>${timeStr}</span>
    </div>
    <div class="info-row">
      <span class="info-label">نوع الطلب:</span>
      <span class="bold">${orderTypeLabel}</span>
    </div>

    ${order.customerName || order.customerPhone || order.customerAddress ? `
    <div class="divider"></div>
    <div class="customer-info">
      <p class="bold">بيانات العميل:</p>
      ${order.customerName ? `<p>👤 ${order.customerName}</p>` : ''}
      ${order.customerPhone ? `<p>📱 ${order.customerPhone}</p>` : ''}
      ${order.customerAddress ? `<p>🏠 ${order.customerAddress}</p>` : ''}
    </div>
    ` : ''}

    <div class="divider"></div>

    <!-- Items -->
    <table class="items-table">
      <thead>
        <tr>
          <th>الصنف</th>
          <th style="text-align: center;">الكمية</th>
          <th style="text-align: center;">السعر</th>
          <th>المجموع</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
        <tr>
          <td class="item-name">${item.productName}</td>
          <td class="item-qty">${item.quantity}</td>
          <td class="item-price">${item.unitPrice.toFixed(2)}</td>
          <td>${item.total.toFixed(2)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
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
      <div class="grand-total">
        <span>الإجمالي:</span>
        <span>${order.total.toFixed(2)} ج.م</span>
      </div>
    </div>

    <!-- Payment -->
    <div class="payment-info">
      <span>💳 طريقة الدفع: </span>
      <span class="bold">${paymentLabel}</span>
    </div>

    ${order.notes ? `
    <div class="divider"></div>
    <div style="font-size: 11px; padding: 4px 0;">
      <span class="bold">ملاحظات:</span> ${order.notes}
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p class="thanks">${receiptFooter}</p>
      <p style="margin-top: 8px; font-size: 10px; color: #666;">
        ${new Date().toLocaleDateString('ar-EG', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>

    ${order.userName ? `
    <div class="cashier">
      الكاشير: ${order.userName}
    </div>
    ` : ''}
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

// Print thermal receipt
export const printThermalReceipt = (order: Order, settings?: Settings): void => {
  const receiptHtml = generateThermalReceipt(order, settings);
  
  const printWindow = window.open('', '_blank', 'width=320,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }
};

// Generate kitchen ticket
export const generateKitchenTicket = (order: Order): string => {
  const orderTypeLabel = 
    order.type === 'dine-in' ? `طاولة ${order.tableName || ''}` : 
    order.type === 'delivery' ? 'توصيل' : 'استلام';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تذكرة مطبخ ${order.orderNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      width: 80mm;
      padding: 8px;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .order-info {
      background: #000;
      color: white;
      padding: 12px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .type-badge {
      display: inline-block;
      padding: 4px 12px;
      border: 2px solid #000;
      font-weight: bold;
      margin-top: 8px;
    }
    .items {
      padding: 10px 0;
    }
    .item {
      padding: 8px 0;
      border-bottom: 1px dashed #000;
      font-size: 16px;
    }
    .item-qty {
      font-weight: bold;
      font-size: 20px;
    }
    .item-name {
      font-weight: bold;
    }
    .notes {
      background: #f0f0f0;
      padding: 10px;
      margin-top: 10px;
      font-size: 14px;
    }
    .time {
      text-align: center;
      font-size: 12px;
      margin-top: 10px;
      color: #666;
    }
    @media print {
      body {
        width: 80mm;
        margin: 0;
        padding: 4mm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍳 المطبخ</h1>
  </div>

  <div class="order-info">
    طلب #${order.orderNumber}
    <div class="type-badge">${orderTypeLabel}</div>
  </div>

  <div class="items">
    ${order.items.map(item => `
    <div class="item">
      <span class="item-qty">×${item.quantity}</span>
      <span class="item-name">${item.productName}</span>
    </div>
    `).join('')}
  </div>

  ${order.notes ? `
  <div class="notes">
    <strong>ملاحظات:</strong> ${order.notes}
  </div>
  ` : ''}

  <div class="time">
    ${new Date(order.createdAt).toLocaleTimeString('ar-EG')} - ${new Date(order.createdAt).toLocaleDateString('ar-EG')}
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

// Print kitchen ticket
export const printKitchenTicket = (order: Order): void => {
  const ticketHtml = generateKitchenTicket(order);
  
  const printWindow = window.open('', '_blank', 'width=320,height=400');
  if (printWindow) {
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
  }
};
