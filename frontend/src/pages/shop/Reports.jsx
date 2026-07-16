import { useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
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

  return (
    <div>
      <h2 className="page-title">Reports</h2>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
          <button key={t} className="btn btn-outline" disabled={busy} onClick={() => load(t)}>
            {t}
          </button>
        ))}
      </div>
      {report && (
        <div className="card">
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
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  alert('Cloud save will connect to your storage provider in a future update.')
                }
              >
                Save to cloud
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
                {report.sales.map((s) => (
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
    </div>
  );
}
