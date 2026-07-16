import { useEffect, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

function printInvoice(sale, shopName) {
  const rows = (sale.items || [])
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(
          i.price * i.qty
        )}</td></tr>`
    )
    .join('');
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${sale.invoice}</title>
    <style>
      body{font-family:Georgia,serif;padding:24px;color:#111;max-width:480px;margin:0 auto}
      h1{margin:0;font-size:22px;text-align:center}
      .meta{text-align:center;color:#555;font-size:13px;margin:6px 0}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-family:system-ui,sans-serif;font-size:13px}
      th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}
      h3{text-align:right;font-family:system-ui,sans-serif}
      .foot{text-align:center;color:#999;margin-top:20px;font-size:11px;font-family:system-ui,sans-serif}
    </style></head><body>
    <h1>${shopName}</h1>
    <p class="meta">Invoice ${sale.invoice} · ${sale.date}</p>
    <p class="meta">Customer: ${sale.customerName} · ${sale.payment} · ${sale.source}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <h3>Total: ${money(sale.total)}</h3>
    <p class="foot">Powered by MS Techno</p>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`);
  w.document.close();
}

export default function Invoices() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.get('/sales', { params: { limit: 100 } }).then((res) => setSales(res.data.sales || []));
  }, []);

  const shopName = user?.shop?.name || 'Shop';

  return (
    <div>
      <h2 className="page-title">Invoices</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Source</th>
              <th>Total</th>
              <th>Date</th>
              <th>Payment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id}>
                <td>{s.invoice}</td>
                <td>{s.customerName}</td>
                <td>{s.source}</td>
                <td>{money(s.total)}</td>
                <td>{s.date}</td>
                <td>{s.payment}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => printInvoice(s, shopName)}>
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
