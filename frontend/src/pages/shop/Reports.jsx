import { useState } from 'react';
import api, { money } from '../../api';

export default function Reports() {
  const [report, setReport] = useState(null);

  async function load(type) {
    const { data } = await api.get(`/sales/report?type=${type}`);
    setReport(data);
  }

  return (
    <div>
      <h2 className="page-title">Reports</h2>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
          <button key={t} className="btn btn-outline" onClick={() => load(t)}>
            {t}
          </button>
        ))}
      </div>
      {report && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--display)', marginBottom: '0.5rem' }}>{report.title}</h3>
          <p className="page-sub">
            Sales: {report.count} · Revenue: {money(report.total)}
          </p>
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
