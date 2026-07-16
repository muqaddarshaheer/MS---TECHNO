import { money } from '../api';

/** Standard thermal paper widths */
export const THERMAL_SIZES = {
  '58': { key: '58', label: '58mm (small)', widthMm: 58, fontPx: 11, nameMax: 14 },
  '80': { key: '80', label: '80mm (standard)', widthMm: 80, fontPx: 12, nameMax: 22 },
};

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function trunc(text, max) {
  const s = String(text || '');
  return s.length <= max ? s : `${s.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Build thermal receipt HTML for preview + print.
 * Designed for ESC/POS-style thermal printers via browser print (58mm / 80mm).
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
  const w = size.widthMm;
  const items = sale?.items || [];
  const subtotal =
    sale?.subtotal != null
      ? sale.subtotal
      : items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const grand = total != null ? total : sale?.total ?? subtotal;
  const disc = Number(sale?.discountPct) || 0;
  const tax = Number(sale?.taxPct) || 0;
  const when = sale?.date || new Date().toISOString().slice(0, 10);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const rows = items
    .map((i) => {
      const line = Number(i.price) * Number(i.qty);
      return `<tr>
        <td class="item">${esc(trunc(i.name, size.nameMax))}</td>
        <td class="qty">${esc(i.qty)}</td>
        <td class="num">${esc(money(i.price))}</td>
        <td class="num">${esc(money(line))}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(invoice || 'Receipt')}</title>
  <style>
    @page {
      size: ${w}mm auto;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #e8e8e8;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: ${w}mm;
      max-width: ${w}mm;
      margin: 12px auto;
      padding: 3mm 2.5mm 4mm;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, ui-monospace, monospace;
      font-size: ${size.fontPx}px;
      line-height: 1.25;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .shop {
      font-size: ${size.fontPx + 3}px;
      font-weight: 700;
      margin: 0 0 2px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      word-break: break-word;
    }
    .meta { margin: 1px 0; font-size: ${size.fontPx - 1}px; }
    .rule {
      border: none;
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .rule-solid {
      border: none;
      border-top: 1px solid #000;
      margin: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      padding: 2px 0;
      vertical-align: top;
      word-wrap: break-word;
    }
    th {
      font-size: ${size.fontPx - 1}px;
      border-bottom: 1px dashed #000;
      padding-bottom: 3px;
    }
    th.item, td.item { text-align: left; width: 42%; }
    th.qty, td.qty { text-align: center; width: 12%; }
    th.num, td.num { text-align: right; width: 23%; }
    .totals { width: 100%; margin-top: 4px; }
    .totals td { padding: 2px 0; }
    .totals .label { text-align: left; }
    .totals .value { text-align: right; white-space: nowrap; }
    .grand .label, .grand .value { font-weight: 700; font-size: ${size.fontPx + 1}px; }
    .thanks { margin-top: 8px; font-size: ${size.fontPx - 1}px; }
    .foot {
      margin-top: 6px;
      font-size: ${Math.max(9, size.fontPx - 2)}px;
      color: #333;
    }
    .toolbar {
      width: ${w}mm;
      max-width: ${w}mm;
      margin: 0 auto 8px;
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
    }
    .toolbar .primary {
      background: #0f5c4c;
      color: #fff;
      border-color: #0f5c4c;
    }
    .hint {
      width: ${w}mm;
      margin: 0 auto 8px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      color: #444;
      text-align: center;
    }
    @media print {
      html, body { background: #fff; }
      .sheet {
        margin: 0;
        padding: 2mm 1.5mm 3mm;
        box-shadow: none;
        width: ${w}mm;
      }
      .toolbar, .hint, .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="primary" type="button" onclick="window.print()">Print receipt</button>
    <button type="button" onclick="window.close()">Close</button>
  </div>
  <p class="hint no-print">Thermal preview · ${esc(size.label)} · In print dialog choose your thermal printer &amp; paper size ${w}mm</p>
  <div class="sheet">
    <div class="center">
      <h1 class="shop">${esc(shopName || 'Shop')}</h1>
      <div class="meta">${esc(invoice || '')}</div>
      <div class="meta">${esc(when)} ${esc(time)}</div>
      <div class="meta">${esc(sale?.payment || 'Cash')} · ${esc(sale?.customerName || 'Walk-in')}</div>
    </div>
    <hr class="rule" />
    <table>
      <thead>
        <tr>
          <th class="item">Item</th>
          <th class="qty">Qty</th>
          <th class="num">Price</th>
          <th class="num">Amt</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="4" class="center">No items</td></tr>'}</tbody>
    </table>
    <hr class="rule" />
    <table class="totals">
      <tr><td class="label">Subtotal</td><td class="value">${esc(money(subtotal))}</td></tr>
      ${disc ? `<tr><td class="label">Discount (${esc(disc)}%)</td><td class="value">-</td></tr>` : ''}
      ${tax ? `<tr><td class="label">Tax (${esc(tax)}%)</td><td class="value">-</td></tr>` : ''}
      <tr class="grand"><td class="label">TOTAL</td><td class="value">${esc(money(grand))}</td></tr>
    </table>
    <hr class="rule-solid" />
    <div class="center thanks">Thank you!</div>
    <div class="center foot">Powered by MS Techno</div>
  </div>
  ${
    autoPrint
      ? `<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},300)});</script>`
      : ''
  }
</body>
</html>`;
}

export function openThermalReceipt(opts) {
  const paper = opts.paper || localStorage.getItem('ms_thermal_paper') || '80';
  const html = buildThermalReceiptHtml({ ...opts, paper, autoPrint: opts.autoPrint !== false });
  const size = THERMAL_SIZES[paper] || THERMAL_SIZES['80'];
  const px = Math.round((size.widthMm / 25.4) * 96) + 80;
  const w = window.open('', '_blank', `width=${px},height=720`);
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
