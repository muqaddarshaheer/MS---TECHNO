import { useEffect, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Invoices() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.get('/sales').then((res) => setSales(res.data.sales || []));
  }, []);

  function printInvoice(sale) {
    const shopName = user?.shop?.name || 'MS Techno';
    const rows = (sale.items || [])
      .map(
        (i) =>
          `<tr><td>${i.name}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(
            i.price * i.qty
          )}</td></tr>`
      )
      .join('');
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${sale.invoice}</title>
      <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}h1{margin:0}h1 span{color:#b0892e}</style></head><body>
      <h1>MS <span>Techno</span></h1><p>${shopName}</p>
      <p>Invoice ${sale.invoice} · ${sale.date}</p>
      <p>Customer: ${sale.customerName} · ${sale.payment} · ${sale.source}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <h3 style="text-align:right">Total: ${money(sale.total)}</h3>
      <p style="text-align:center;color:#999;margin-top:16px">MS Techno — Cloud Perfume Management</p>
      <button onclick="print()">Print</button></body></html>`);
    w.document.close();
  }

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
                  <button className="btn btn-outline btn-sm" onClick={() => printInvoice(s)}>
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
