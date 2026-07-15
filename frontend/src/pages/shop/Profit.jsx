import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Profit() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/sales/dashboard').then((res) => setStats(res.data.stats));
  }, []);

  if (!stats) return <p className="empty">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">Profit</h2>
      <div className="grid grid-4">
        <div className="card stat">
          <h6>Profit</h6>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--ok)' }}>{money(stats.profit)}</h2>
        </div>
        <div className="card stat danger">
          <h6>Expenses</h6>
          <h2 style={{ fontSize: '1.2rem' }}>{money(stats.expenses)}</h2>
        </div>
        <div className="card stat">
          <h6>Net</h6>
          <h2 style={{ fontSize: '1.2rem' }}>{money(stats.net)}</h2>
        </div>
        <div className="card stat">
          <h6>Revenue</h6>
          <h2 style={{ fontSize: '1.2rem' }}>{money(stats.revenue)}</h2>
        </div>
      </div>
    </div>
  );
}
