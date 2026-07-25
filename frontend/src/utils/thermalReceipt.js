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

function rule(cols, char = '─') {
  return char.repeat(cols);
}

function doubleRule(cols) {
  return '═'.repeat(cols);
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
 * Uses monospace &lt;pre&gt; lines — most reliable for browser → thermal printers
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
  // 1. HEADER - BOLD MS TECHNO
  // ============================================================
  lines.push('');
  lines.push(center('══════════════════════════════════════', cols));
  lines.push('');
  lines.push(center('◈◈◈  M S   T E C H N O  ◈◈◈', cols));
  lines.push(center('◈  Cloud Retail Management  ◈', cols));
  lines.push('');
  lines.push(center('══════════════════════════════════════', cols));
  lines.push('');

  // ============================================================
  // 2. INVOICE - BOLD
  // ============================================================
  lines.push(center('◆◆◆  I N V O I C E  ◆◆◆', cols));
  if (invoice) lines.push(center('◆  # ' + String(invoice) + '  ◆', cols));
  lines.push('');
  lines.push(center('──────────────────────────────', cols));
  lines.push('');

  // ============================================================
  // 3. DATE, TIME, CUSTOMER - BOLD LABELS
  // ============================================================
  lines.push(center('📅  ' + when + '    ⏰  ' + time, cols));
  lines.push('');
  lines.push(twoCol('👤  Customer', sale?.customerName || 'Walk-in', cols));
  lines.push(twoCol('💳  Payment', sale?.payment || 'Cash', cols));
  lines.push('');
  lines.push(center('──────────────────────────────', cols));
  lines.push('');

  // ============================================================
  // 4. ITEMS HEADER - BOLD
  // ============================================================
  const qtyW = 4;
  const priceW = 10;
  const discW = 9;
  const totalW = 9;
  const nameW = Math.max(10, cols - (qtyW + priceW + discW + totalW + 2));
  
  lines.push(center('┌─────────── ITEMS ───────────┐', cols));
  lines.push(
    `│ ${pad('ITEM', nameW)} │ ${pad('Qty', qtyW, 'right')} │ ${pad('Price', priceW, 'right')} │ ${pad('Total', totalW, 'right')} │`
  );
  lines.push(center('├──────────────────────────────┤', cols));

  // ============================================================
  // 5. ITEMS LIST - ITEM NAME BOLD
  // ============================================================
  if (!items.length) {
    lines.push(center('│        No items found        │', cols));
  } else {
    for (const i of items) {
      const name = String(i.name || 'Item');
      const qty = Number(i.qty || 0);
      const price = Number(i.price || 0);
      const lineGross = price * qty;
      let itemDiscAmt = 0;
      if (i.discount != null) itemDiscAmt = Number(i.discount) || 0;
      else if (i.discountPct != null) itemDiscAmt = (lineGross * Number(i.discountPct || 0)) / 100;
      const lineTotal = lineGross - itemDiscAmt;
      
      lines.push(
        `│ ${pad('• ' + name, nameW)} │ ${pad(String(qty), qtyW, 'right')} │ ${pad(moneyPlain(price), priceW, 'right')} │ ${pad(moneyPlain(lineTotal), totalW, 'right')} │`
      );
    }
  }

  lines.push(center('└──────────────────────────────┘', cols));
  lines.push('');

  // ============================================================
  // 6. TOTALS - BOLD LABELS AND AMOUNTS
  // ============================================================
  const saleDiscAmt = (subtotal * discPct) / 100;
  const itemLevelDisc = items.reduce((s, it) => {
    const qty = Number(it.qty || 0);
    const price = Number(it.price || 0);
    const gross = qty * price;
    if (it.discount != null) return s + Number(it.discount || 0);
    if (it.discountPct != null) return s + (gross * Number(it.discountPct || 0)) / 100;
    return s;
  }, 0);
  const taxAmt = ((subtotal - saleDiscAmt - itemLevelDisc) * taxPct) / 100;
  
  lines.push(center('┌────────── TOTALS ──────────┐', cols));
  
  // Subtotal - BOLD
  lines.push(twoCol('│ SUBTOTAL', 'PKR ' + moneyPlain(subtotal) + ' │', cols));
  
  // Discount - BOLD if exists
  if (discPct > 0) {
    lines.push(twoCol('│ DISCOUNT (' + discPct + '%)', 'PKR ' + moneyPlain(saleDiscAmt) + ' │', cols));
  }
  if (itemLevelDisc > 0) {
    lines.push(twoCol('│ ITEM DISCOUNTS', 'PKR ' + moneyPlain(itemLevelDisc) + ' │', cols));
  }
  
  // Tax - BOLD if exists
  if (taxPct > 0) {
    lines.push(twoCol('│ TAX (' + taxPct + '%)', 'PKR ' + moneyPlain(taxAmt) + ' │', cols));
  }
  
  lines.push(center('├──────────────────────────────┤', cols));
  
  // ============================================================
  // 7. GRAND TOTAL - EXTRA BOLD WITH SYMBOLS
  // ============================================================
  lines.push(twoCol('│ ═══ GRAND TOTAL ═══', 'PKR ' + moneyPlain(grand) + ' │', cols));
  
  lines.push(center('├──────────────────────────────┤', cols));
  
  // Payment details - BOLD
  if (paid > 0) {
    lines.push(twoCol('│ PAID', 'PKR ' + moneyPlain(paid) + ' │', cols));
  }
  if (credit > 0) {
    lines.push(twoCol('│ CREDIT', 'PKR ' + moneyPlain(credit) + ' │', cols));
  }
  if (remaining > 0) {
    lines.push(twoCol('│ BALANCE', 'PKR ' + moneyPlain(remaining) + ' │', cols));
  }
  
  lines.push(center('└──────────────────────────────┘', cols));
  lines.push('');

  // ============================================================
  // 8. FOOTER - BOLD WITH SYMBOLS
  // ============================================================
  lines.push(center('══════════════════════════════════════', cols));
  lines.push('');
  lines.push(center('✦✦✦  T H A N K   Y O U  ✦✦✦', cols));
  lines.push('');
  lines.push(center('◈◈◈  M S   T E C H N O  ◈◈◈', cols));
  lines.push(center('◈  Contact: 0340-1227619  ◈', cols));
  lines.push('');
  lines.push(center('✦  Visit Again!  ✦', cols));
  lines.push(center('══════════════════════════════════════', cols));
  lines.push('');

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
      const gross = price * qty;
      let itemDiscAmt = 0;
      if (it.discount != null) itemDiscAmt = Number(it.discount || 0);
      else if (it.discountPct != null) itemDiscAmt = (gross * Number(it.discountPct || 0)) / 100;
      const lineTotal = gross - itemDiscAmt;
      return `<tr>
        <td><strong>${name}</strong></td>
        <td class="right"><strong>${qty}</strong></td>
        <td class="right"><strong>PKR ${moneyPlain(price)}</strong></td>
        <td class="right"><strong>PKR ${moneyPlain(lineTotal)}</strong></td>
      </tr>`;
    })
    .join('');

  const invoiceTable = `
  <div class="invoice-table">
    <div class="header">
      <div class="shop-name"><strong>✦ M S T E C H N O ✦</strong></div>
      <div class="shop-sub">Cloud Retail Management ERP</div>
      <div class="invoice-title"><strong>◆ I N V O I C E ◆</strong></div>
      <div class="invoice-number"><strong>#${escapedInvoice}</strong></div>
      <div class="invoice-meta"><strong>${esc(`${when}`)}</strong> · <strong>${esc(`${time}`)}</strong> · <strong>${customerName}</strong> · ${paymentMethod}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th><strong>Product</strong></th>
          <th class="right"><strong>Qty</strong></th>
          <th class="right"><strong>Price</strong></th>
          <th class="right"><strong>Total</strong></th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <table class="invoice-summary">
      <tbody>
        <tr><td style="width:55%"></td><td class="right"><strong>SUBTOTAL:</strong></td><td class="right"><strong>PKR ${moneyPlain(subtotal)}</strong></td></tr>
        ${discPct > 0 ? `<tr><td></td><td class="right"><strong>DISCOUNT (${discPct}%):</strong></td><td class="right"><strong>PKR ${moneyPlain(saleDiscAmt)}</strong></td></tr>` : ''}
        ${itemLevelDisc > 0 ? `<tr><td></td><td class="right"><strong>ITEM DISCOUNTS:</strong></td><td class="right"><strong>PKR ${moneyPlain(itemLevelDisc)}</strong></td></tr>` : ''}
        ${taxPct > 0 ? `<tr><td></td><td class="right"><strong>TAX (${taxPct}%):</strong></td><td class="right"><strong>PKR ${moneyPlain(taxAmt)}</strong></td></tr>` : ''}
        <tr class="grand-total"><td></td><td class="right"><strong>═══ GRAND TOTAL ═══</strong></td><td class="right"><strong>PKR ${moneyPlain(grand)}</strong></td></tr>
        ${paid > 0 ? `<tr><td></td><td class="right"><strong>PAID:</strong></td><td class="right"><strong>PKR ${moneyPlain(paid)}</strong></td></tr>` : ''}
        ${credit > 0 ? `<tr><td></td><td class="right"><strong>CREDIT:</strong></td><td class="right"><strong>PKR ${moneyPlain(credit)}</strong></td></tr>` : ''}
        ${remaining > 0 ? `<tr><td></td><td class="right"><strong>BALANCE:</strong></td><td class="right"><strong>PKR ${moneyPlain(remaining)}</strong></td></tr>` : ''}
      </tbody>
    </table>
    <div class="footer">
      <div class="thankyou"><strong>✦✦✦ T H A N K   Y O U ✦✦✦</strong></div>
      <div class="powered"><strong>◈◈◈ M S   T E C H N O ◈◈◈</strong></div>
      <div class="contact"><strong>📞 0340-1227619</strong></div>
      <div class="visit"><strong>✦ Visit Again! ✦</strong></div>
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
        border-bottom: 3px double #0a7e5c;
      }
      .invoice-table .shop-name {
        font-size: 26px;
        font-weight: 900;
        color: #0a7e5c;
        letter-spacing: 4px;
      }
      .invoice-table .shop-sub {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
        letter-spacing: 2px;
      }
      .invoice-table .invoice-title {
        font-size: 18px;
        font-weight: 900;
        margin-top: 8px;
        color: #1a1a1a;
        letter-spacing: 3px;
      }
      .invoice-table .invoice-number {
        font-size: 14px;
        font-weight: 700;
        color: #1a1a1a;
        margin-top: 2px;
      }
      .invoice-table .invoice-meta {
        font-size: 13px;
        color: #555;
        margin-top: 6px;
      }
      .invoice-table .invoice-meta strong {
        color: #1a1a1a;
      }
      .invoice-table table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .invoice-table th {
        background: #f0f5f2;
        font-weight: 900;
        padding: 12px 8px;
        border-bottom: 2px solid #0a7e5c;
        text-align: left;
        color: #1a1a1a;
        letter-spacing: 1px;
      }
      .invoice-table td {
        padding: 8px;
        border-bottom: 1px solid #eee;
        text-align: left;
        color: #1a1a1a;
      }
      .invoice-table td strong {
        font-weight: 700;
        color: #000;
      }
      .invoice-table .right { text-align: right; }
      .invoice-table .invoice-summary {
        margin-top: 20px;
        width: 100%;
        border-top: 3px double #0a7e5c;
        padding-top: 12px;
      }
      .invoice-table .invoice-summary td {
        padding: 5px 8px;
        border: none;
        font-size: 14px;
        color: #1a1a1a;
      }
      .invoice-table .invoice-summary td strong {
        font-weight: 700;
        color: #000;
      }
      .invoice-table .grand-total td {
        font-size: 18px;
        font-weight: 900;
        border-top: 2px solid #0a7e5c;
        padding-top: 10px;
        color: #000;
      }
      .invoice-table .grand-total td strong {
        font-weight: 900;
        color: #000;
      }
      .invoice-table .footer {
        text-align: center;
        margin-top: 25px;
        padding-top: 18px;
        border-top: 3px double #0a7e5c;
      }
      .invoice-table .footer strong {
        font-weight: 900;
        color: #000;
      }
      .invoice-table .thankyou {
        font-size: 22px;
        font-weight: 900;
        color: #0a7e5c;
        margin-bottom: 6px;
        letter-spacing: 3px;
      }
      .invoice-table .powered {
        font-size: 16px;
        font-weight: 900;
        color: #1a1a1a;
        margin-bottom: 2px;
        letter-spacing: 2px;
      }
      .invoice-table .contact {
        font-size: 15px;
        font-weight: 900;
        color: #1a1a1a;
        margin-bottom: 2px;
        letter-spacing: 1px;
      }
      .invoice-table .visit {
        font-size: 14px;
        font-weight: 700;
        color: #555;
        letter-spacing: 2px;
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