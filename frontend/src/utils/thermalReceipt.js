/** Standard thermal paper widths (character columns for monospace layout) */
export const THERMAL_SIZES = {
  '58': { key: '58', label: '58mm (small)', widthMm: 58, printMm: 48, cols: 32, fontPx: 12 },
  '80': { key: '80', label: '80mm (standard)', widthMm: 80, printMm: 72, cols: 42, fontPx: 13 },
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
 * Uses monospace &lt;pre&gt; lines — most reliable for browser → thermal printers
 * (HTML tables / flex often print blank on XPrinter / generic ESC-POS drivers).
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
      ? sale.subtotal
      : items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const grand = total != null ? total : sale?.total ?? subtotal;
  const disc = Number(sale?.discountPct) || 0;
  const tax = Number(sale?.taxPct) || 0;
  const when = sale?.date || new Date().toISOString().slice(0, 10);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const lines = [];
  lines.push(center(String(shopName || 'Shop').toUpperCase(), cols));
  if (invoice) lines.push(center(String(invoice), cols));
  lines.push(center(`${when} ${time}`, cols));
  lines.push(
    center(`${sale?.payment || 'Cash'} · ${sale?.customerName || 'Walk-in'}`, cols)
  );
  lines.push(rule(cols));
  lines.push(
    `${pad('Item', Math.max(8, cols - 18))}${pad('Qty', 4, 'right')}${pad('Price', 7, 'right')}${pad('Amt', 7, 'right')}`
  );
  lines.push(rule(cols));

  if (!items.length) {
    lines.push(center('No items', cols));
  } else {
    for (const i of items) {
      const name = String(i.name || 'Item');
      const qty = String(i.qty ?? 0);
      const price = moneyPlain(i.price);
      const amt = moneyPlain(Number(i.price) * Number(i.qty));
      const nameW = Math.max(8, cols - 18);
      lines.push(
        `${pad(name, nameW)}${pad(qty, 4, 'right')}${pad(price, 7, 'right')}${pad(amt, 7, 'right')}`
      );
    }
  }

  lines.push(rule(cols));
  lines.push(twoCol('Subtotal', moneyPlain(subtotal), cols));
  if (disc) lines.push(twoCol(`Discount ${disc}%`, '-', cols));
  if (tax) lines.push(twoCol(`Tax ${tax}%`, '-', cols));
  lines.push(rule(cols, '='));
  lines.push(twoCol('TOTAL', moneyPlain(grand), cols));
  lines.push(rule(cols, '='));
  lines.push('');
  lines.push(center('Thank you!', cols));
  lines.push(center('Powered by MS Techno', cols));

  const bodyText = esc(lines.join('\n'));

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
    }
    .toolbar .primary {
      background: #0f5c4c;
      color: #fff;
      border-color: #0f5c4c;
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
      width: ${printW}mm;
      max-width: 96%;
      margin: 0 auto 16px;
      padding: 8px 6px 12px;
      background: #fff;
      color: #000;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    .ticket {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: #000 !important;
      font-family: "Courier New", Courier, monospace !important;
      font-size: ${size.fontPx}px;
      line-height: 1.35;
      white-space: pre;
      overflow: visible;
      word-break: break-all;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
        padding: 1mm 0 2mm !important;
        box-shadow: none !important;
        background: #fff !important;
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
    <button class="primary" type="button" id="btn-print">Print receipt</button>
    <button type="button" onclick="window.close()">Close</button>
  </div>
  <p class="hint no-print">
    Thermal · ${esc(size.label)} · In print dialog: paper <strong>${w}mm</strong>,
    margins <strong>None</strong>, scale <strong>100%</strong>, headers/footers <strong>Off</strong>
  </p>
  <div class="sheet">
    <pre class="ticket">${bodyText}</pre>
  </div>
  <script>
    function doPrint() {
      try { window.focus(); } catch (e) {}
      window.print();
    }
    document.getElementById('btn-print').addEventListener('click', doPrint);
    ${
      autoPrint
        ? `window.addEventListener('load', function () {
      setTimeout(doPrint, 500);
    });`
        : ''
    }
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
