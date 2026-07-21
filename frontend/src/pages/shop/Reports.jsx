import { useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load(type) {
    setBusy(true);
    try {
      const { data } = await api.get(`/sales/report?type=${type}`);
      setReport({ ...data, type });
    } finally {
      setBusy(false);
    }
  }

  async function loadPurchases(type) {
    setBusy(true);
    try {
      const { data } = await api.get(`/purchases/report?type=${type}`);
      setPurchaseReport({ ...data, type });
    } finally {
      setBusy(false);
    }
  }

  function shareWhatsApp() {
    if (!report) return;
    const shop = user?.shop?.name || 'Shop';
    const text = encodeURIComponent(
      `${shop} — ${report.title}\nSales: ${report.count}\nRevenue: ${money(report.total)}\nProfit: ${money(
        report.profit || 0
      )}\n(via MS Techno)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  function downloadReport() {
    if (!report) return;
    const lines = [
      `${report.title}`,
      `Sales: ${report.count}`,
      `Revenue: ${report.total}`,
      `Profit: ${report.profit || 0}`,
      '',
      'Invoice,Date,Total,Payment,Source',
      ...(report.sales || []).map(
        (s) => `${s.invoice},${s.date},${s.total},${s.payment},${s.source}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(report.type || 'report')}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPurchaseReport() {
    if (!purchaseReport) return;
    const lines = [
      `${purchaseReport.title}`,
      `Purchases: ${purchaseReport.count}`,
      `Total: ${purchaseReport.total}`,
      `Paid: ${purchaseReport.paid}`,
      `Credit: ${purchaseReport.credit}`,
      '',
      'PurchaseNo,Date,Supplier,Total,Credit,Payment',
      ...(purchaseReport.purchases || []).map(
        (p) =>
          `${p.purchaseNo},${p.date},${p.supplierName},${p.total},${p.creditAmount || 0},${p.payment}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-${purchaseReport.type || 'report'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="page-title">Reports</h2>
      <h3 style={{ fontFamily: 'var(--display)', marginBottom: '0.5rem' }}>Sales</h3>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
          <button key={t} className="btn btn-outline" disabled={busy} onClick={() => load(t)}>
            {t}
          </button>
        ))}
      </div>
      {report && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="page-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--display)', marginBottom: '0.25rem' }}>{report.title}</h3>
              <p className="page-sub" style={{ marginBottom: 0 }}>
                Sales: {report.count} · Revenue: {money(report.total)}
                {report.profit != null ? ` · Profit: ${money(report.profit)}` : ''}
              </p>
            </div>
            <div className="row">
              <button className="btn btn-primary btn-sm" onClick={shareWhatsApp}>
                Share WhatsApp
              </button>
              <button className="btn btn-outline btn-sm" onClick={downloadReport}>
                Download CSV
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {(report.sales || []).map((s) => (
                  <tr key={s._id}>
                    <td>{s.invoice}</td>
                    <td>{s.date}</td>
                    <td>{money(s.total)}</td>
                    <td>{s.payment}</td>
                    <td>{s.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h3 style={{ fontFamily: 'var(--display)', marginBottom: '0.5rem' }}>Purchases</h3>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
          <button
            key={`p-${t}`}
            className="btn btn-outline"
            disabled={busy}
            onClick={() => loadPurchases(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {purchaseReport && (
        <div className="card">
          <div className="page-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--display)', marginBottom: '0.25rem' }}>
                {purchaseReport.title}
              </h3>
              <p className="page-sub" style={{ marginBottom: 0 }}>
                Bills: {purchaseReport.count} · Total: {money(purchaseReport.total)} · Paid:{' '}
                {money(purchaseReport.paid)} · Credit: {money(purchaseReport.credit)}
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={downloadPurchaseReport}>
              Download CSV
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Credit</th>
                  <th>Pay</th>
                </tr>
              </thead>
              <tbody>
                {(purchaseReport.purchases || []).map((p) => (
                  <tr key={p._id}>
                    <td>{p.purchaseNo}</td>
                    <td>{p.date}</td>
                    <td>{p.supplierName}</td>
                    <td>{money(p.total)}</td>
                    <td>{money(p.creditAmount || 0)}</td>
                    <td>{p.payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
