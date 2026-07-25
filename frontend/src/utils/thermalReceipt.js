/** Standard thermal paper widths (character columns for monospace layout) */
export const THERMAL_SIZES = {
  '58': { key: '58', label: '58mm (small)', widthMm: 58, printMm: 48, cols: 32, fontPx: 12 },
  '80': { key: '80', label: '80mm (standard)', widthMm: 80, printMm: 72, cols: 42, fontPx: 13 },
  'A4': { key: 'A4', label: 'A4 (210mm)', widthMm: 210, printMm: 210, cols: 88, fontPx: 12 },
};

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plain money for thermal (ASCII-safe) */
function moneyPlain(amount) {
  return Number(amount || 0).toFixed(2);
}

function pad(text, width, align = 'left') {
  const s = String(text ?? '');
  if (s.length >= width) return s.slice(0, width);
  const space = ' '.repeat(width - s.length);
  return align === 'right' ? space + s : s + space;
}

function rule(cols, char = '-') {
  return char.repeat(cols);
}

function center(text, cols) {
  const s = String(text ?? '');
  if (s.length >= cols) return s.slice(0, cols);
  const left = Math.floor((cols - s.length) / 2);
  return ' '.repeat(left) + s;
}

function twoCol(left, right, cols) {
  const l = String(left ?? '');
  const r = String(right ?? '');
  const gap = Math.max(1, cols - l.length - r.length);
  const line = l + ' '.repeat(gap) + r;
  return line.length > cols ? line.slice(0, cols) : line;
}

/**
 * Build thermal receipt HTML for preview + print.
 * Standard market-style receipt - clean and professional
 */
export function buildThermalReceiptHtml({
  shopName,
  sale,
  total,
  invoice,
  paper = '80',
  autoPrint = false,
}) {
  const size = THERMAL_SIZES[paper] || THERMAL_SIZES['80'];
  const cols = size.cols;
  const w = size.widthMm;
  const printW = size.printMm;
  const items = sale?.items || [];
  const subtotal =
    sale?.subtotal != null
      ? Number(sale.subtotal)
      : items.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0);
  const grand = total != null ? Number(total) : Number(sale?.total ?? subtotal);
  const discPct = Number(sale?.discountPct) || 0;
  const taxPct = Number(sale?.taxPct) || 0;
  const when = sale?.date || new Date().toISOString().slice(0, 10);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // payments and balances
  const payments = Array.isArray(sale?.payments) ? sale.payments : [];
  const paid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const credit = Number(sale?.creditAmount) || 0;
  const remaining = Math.max(0, grand - (paid + credit));

  const lines = [];
  
  // ============================================================
  // STANDARD RECEIPT - Like any normal shop bill
  // ============================================================
  
  // Shop Name - Centered
  lines.push(center(String(shopName || 'SHOP').toUpperCase(), cols));
  lines.push(center('-' + '-'.repeat(cols > 40 ? 36 : 28) + '-', cols));
  lines.push('');
  
  // Invoice & Date
  if (invoice) lines.push(center('Invoice: ' + String(invoice), cols));
  lines.push(center('Date: ' + when + '  Time: ' + time, cols));
  lines.push(center('Customer: ' + (sale?.customerName || 'Walk-in'), cols));
  lines.push(center('Payment: ' + (sale?.payment || 'Cash'), cols));
  lines.push('');
  lines.push(rule(cols, '-'));
  lines.push('');

  // ============================================================
  // ITEMS - Standard format
  // ============================================================
  // Headers
  const qtyW = 4;
  const priceW = 8;
  const totalW = 9;
  const nameW = Math.max(8, cols - (qtyW + priceW + totalW + 2));
  
  lines.push(
    `${pad('Item', nameW)} ${pad('Qty', qtyW, 'right')} ${pad('Price', priceW, 'right')} ${pad('Total', totalW, 'right')}`
  );
  lines.push(rule(cols, '-'));

  if (!items.length) {
    lines.push(center('No items', cols));
  } else {
    for (const i of items) {
      const name = String(i.name || 'Item').slice(0, nameW);
      const qty = Number(i.qty || 0);
      const price = Number(i.price || 0);
      const lineTotal = price * qty;
      
      lines.push(
        `${pad(name, nameW)} ${pad(String(qty), qtyW, 'right')} ${pad(moneyPlain(price), priceW, 'right')} ${pad(moneyPlain(lineTotal), totalW, 'right')}`
      );
    }
  }

  lines.push(rule(cols, '-'));
  lines.push('');

  // ============================================================
  // TOTALS - Standard
  // ============================================================
  const saleDiscAmt = (subtotal * discPct) / 100;
  const taxAmt = ((subtotal - saleDiscAmt) * taxPct) / 100;
  
  lines.push(twoCol('Subtotal', moneyPlain(subtotal), cols));
  if (discPct > 0) {
    lines.push(twoCol('Discount (' + discPct + '%)', moneyPlain(saleDiscAmt), cols));
  }
  if (taxPct > 0) {
    lines.push(twoCol('Tax (' + taxPct + '%)', moneyPlain(taxAmt), cols));
  }
  
  // Grand Total
  lines.push(rule(cols, '='));
  lines.push(twoCol('TOTAL', moneyPlain(grand), cols));
  lines.push(rule(cols, '='));
  
  // Payment details
  if (paid > 0) {
    lines.push(twoCol('Paid', moneyPlain(paid), cols));
  }
  if (credit > 0) {
    lines.push(twoCol('Credit', moneyPlain(credit), cols));
  }
  if (remaining > 0) {
    lines.push(twoCol('Balance', moneyPlain(remaining), cols));
  }
  
  lines.push('');

  // ============================================================
  // FOOTER - Simple & Professional
  // ============================================================
  lines.push(center('Thank you for shopping', cols));
  lines.push('');
  lines.push(center('------------------------------', cols));
  lines.push(center('Powered by MS TECHNO', cols));
  lines.push(center('------------------------------', cols));
  lines.push(center('Contact: 0340-1227619', cols));
  lines.push('');
  lines.push(center('Visit Again!', cols));
  lines.push(rule(cols, '-'));

  const bodyText = esc(lines.join('\n'));

  // Build optional A4/table HTML for wider prints
  const escapedShop = esc(String(shopName || 'Shop'));
  const escapedInvoice = esc(String(invoice || ''));
  const customerName = esc(String(sale?.customerName || 'Walk-in'));
  const paymentMethod = esc(String(sale?.payment || 'Cash'));

  const rowsHtml = (items || [])
    .map((it) => {
      const name = esc(String(it.name || 'Item'));
      const qty = Number(it.qty || 0);
      const price = Number(it.price || 0);
      const lineTotal = price * qty;
      return `<tr>
        <td>${name}</td>
        <td class="right">${qty}</td>
        <td class="right">PKR ${moneyPlain(price)}</td>
        <td class="right">PKR ${moneyPlain(lineTotal)}</td>
      </tr>`;
    })
    .join('');

  const invoiceTable = `
  <div class="invoice-table">
    <div class="header">
      <div class="shop-name"><strong>${escapedShop}</strong></div>
      <div class="invoice-title"><strong>INVOICE</strong></div>
      <div class="invoice-number"><strong>#${escapedInvoice}</strong></div>
      <div class="invoice-meta">${esc(`${when}`)} · ${esc(`${time}`)} · ${customerName} · ${paymentMethod}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="right">Qty</th>
          <th class="right">Price</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <table class="invoice-summary">
      <tbody>
        <tr><td style="width:55%"></td><td class="right"><strong>Subtotal:</strong></td><td class="right"><strong>PKR ${moneyPlain(subtotal)}</strong></td></tr>
        ${discPct > 0 ? `<tr><td></td><td class="right"><strong>Discount (${discPct}%):</strong></td><td class="right"><strong>PKR ${moneyPlain(saleDiscAmt)}</strong></td></tr>` : ''}
        ${taxPct > 0 ? `<tr><td></td><td class="right"><strong>Tax (${taxPct}%):</strong></td><td class="right"><strong>PKR ${moneyPlain(taxAmt)}</strong></td></tr>` : ''}
        <tr class="grand-total"><td></td><td class="right"><strong>TOTAL:</strong></td><td class="right"><strong>PKR ${moneyPlain(grand)}</strong></td></tr>
        ${paid > 0 ? `<tr><td></td><td class="right"><strong>Paid:</strong></td><td class="right"><strong>PKR ${moneyPlain(paid)}</strong></td></tr>` : ''}
        ${credit > 0 ? `<tr><td></td><td class="right"><strong>Credit:</strong></td><td class="right"><strong>PKR ${moneyPlain(credit)}</strong></td></tr>` : ''}
        ${remaining > 0 ? `<tr><td></td><td class="right"><strong>Balance:</strong></td><td class="right"><strong>PKR ${moneyPlain(remaining)}</strong></td></tr>` : ''}
      </tbody>
    </table>
    <div class="footer">
      <div class="thankyou">Thank you for shopping</div>
      <div class="powered"><strong>Powered by MS TECHNO</strong></div>
      <div class="contact">📞 0340-1227619</div>
      <div class="visit">Visit Again!</div>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(invoice || 'Receipt')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #e8e8e8;
      color: #000;
      font-family: "Courier New", Courier, monospace;
    }
    .toolbar {
      width: ${w}mm;
      max-width: 100%;
      margin: 12px auto 8px;
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .toolbar button {
      font-family: system-ui, sans-serif;
      font-size: 13px;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid #ccc;
      background: #fff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toolbar button:hover {
      background: #f0f0f0;
    }
    .toolbar .primary {
      background: #0a7e5c;
      color: #fff;
      border-color: #0a7e5c;
    }
    .toolbar .primary:hover {
      background: #066349;
    }
    .hint {
      width: ${w}mm;
      max-width: 96%;
      margin: 0 auto 10px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      color: #444;
      text-align: center;
      line-height: 1.4;
    }
    .sheet {
      display: table;
      margin: 0 auto 16px;
      padding: 10px 0 14px;
      background: #fff;
      color: #000;
      box-shadow: 0 2px 16px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .ticket {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0 4px;
      border: 0;
      background: transparent;
      color: #000 !important;
      font-family: "Courier New", Courier, monospace !important;
      font-size: ${size.fontPx}px;
      line-height: 1.5;
      white-space: pre;
      overflow: hidden;
      word-break: break-all;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* A4/table layout for wider prints */
    .invoice-table { display: none; }
    @media (min-width: 200mm) {
      .ticket { display: none; }
      .invoice-table { 
        display: block; 
        width: ${Math.min(printW, 210)}mm; 
        margin: 0 auto; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
        color: #000;
        background: #fff;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 20px rgba(0,0,0,0.08);
      }
      .invoice-table .header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #0a7e5c;
      }
      .invoice-table .shop-name {
        font-size: 22px;
        font-weight: 700;
        color: #0a7e5c;
        letter-spacing: 2px;
      }
      .invoice-table .invoice-title {
        font-size: 16px;
        font-weight: 700;
        margin-top: 4px;
        color: #1a1a1a;
      }
      .invoice-table .invoice-number {
        font-size: 13px;
        color: #555;
        margin-top: 2px;
      }
      .invoice-table .invoice-meta {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
      .invoice-table table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .invoice-table th {
        background: #f5f5f5;
        font-weight: 700;
        padding: 10px 8px;
        border-bottom: 2px solid #ddd;
        text-align: left;
        color: #1a1a1a;
      }
      .invoice-table td {
        padding: 8px;
        border-bottom: 1px solid #eee;
        text-align: left;
        color: #1a1a1a;
      }
      .invoice-table .right { text-align: right; }
      .invoice-table .invoice-summary {
        margin-top: 16px;
        width: 100%;
        border-top: 2px solid #0a7e5c;
        padding-top: 10px;
      }
      .invoice-table .invoice-summary td {
        padding: 4px 8px;
        border: none;
        font-size: 13px;
        color: #1a1a1a;
      }
      .invoice-table .grand-total td {
        font-size: 16px;
        font-weight: 700;
        border-top: 2px solid #0a7e5c;
        padding-top: 8px;
        color: #000;
      }
      .invoice-table .footer {
        text-align: center;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 2px solid #0a7e5c;
      }
      .invoice-table .thankyou {
        font-size: 15px;
        color: #0a7e5c;
        margin-bottom: 4px;
      }
      .invoice-table .powered {
        font-size: 15px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 2px;
      }
      .invoice-table .contact {
        font-size: 13px;
        color: #1a1a1a;
        margin-bottom: 2px;
      }
      .invoice-table .visit {
        font-size: 13px;
        color: #666;
      }
    }
    @page {
      margin: 0;
    }
    @media print {
      html, body {
        background: #fff !important;
        width: ${printW}mm;
        margin: 0 !important;
        padding: 0 !important;
      }
      .toolbar, .hint, .no-print { display: none !important; }
      .sheet {
        width: ${printW}mm;
        max-width: ${printW}mm;
        margin: 0 !important;
        padding: 2mm 0 3mm !important;
        box-shadow: none !important;
        background: #fff !important;
        display: block !important;
        overflow: hidden !important;
      }
      .ticket {
        font-size: ${size.fontPx}px !important;
        color: #000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="primary" type="button" id="btn-print">🖨️ Print receipt</button>
    <button type="button" onclick="window.close()">✕ Close</button>
  </div>
  <p class="hint no-print">
    Thermal · ${esc(size.label)} · In print dialog: paper <strong>${w}mm</strong>,
    margins <strong>None</strong>, scale <strong>100%</strong>, headers/footers <strong>Off</strong>
  </p>
  <div class="sheet">
    <pre class="ticket">${bodyText}</pre>
  </div>
  ${invoiceTable}
  <script>
    function doPrint() {
      try { window.focus(); } catch (e) {}
      window.print();
    }
    document.getElementById('btn-print').addEventListener('click', doPrint);
    ${autoPrint ? `window.addEventListener('load', function () { setTimeout(doPrint, 500); });` : ''}
  </script>
</body>
</html>`;
}

export function openThermalReceipt(opts) {
  const paper = opts.paper || localStorage.getItem('ms_thermal_paper') || '80';
  const html = buildThermalReceiptHtml({ ...opts, paper, autoPrint: opts.autoPrint !== false });
  const size = THERMAL_SIZES[paper] || THERMAL_SIZES['80'];
  const px = Math.round((size.widthMm / 25.4) * 96) + 100;
  const w = window.open('', '_blank', `width=${px},height=760`);
  if (!w) {
    alert('Popup blocked. Allow popups to preview/print the receipt.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  try {
    w.focus();
  } catch {
    /* ignore */
  }
}

export function getStoredPaperSize() {
  const v = localStorage.getItem('ms_thermal_paper');
  return THERMAL_SIZES[v] ? v : '80';
}

export function setStoredPaperSize(key) {
  if (THERMAL_SIZES[key]) localStorage.setItem('ms_thermal_paper', key);
}