import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function DailyClosing() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function load(d = date) {
    setError('');
    const { data: res } = await api.get('/accounts/daily', { params: { date: d } });
    setData(res);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Daily closing</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Sales, cash, expenses and credit for a selected date.
          </p>
        </div>
        <form
          className="row"
          style={{ alignItems: 'flex-end' }}
          onSubmit={(e) => {
            e.preventDefault();
            load(date).catch((err) => setError(err.response?.data?.message || 'Failed'));
          }}
        >
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary">Load</button>
        </form>
      </div>
      {error && <div className="error">{error}</div>}
      {!data && !error && <p className="empty">Loading...</p>}
      {data && (
        <>
          <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
            <div className="card stat">
              <h6>Sales</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.salesTotal)}</h2>
              <small>{data.salesCount} invoices</small>
            </div>
            <div className="card stat">
              <h6>Cash sales</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.cashSales)}</h2>
            </div>
            <div className="card stat">
              <h6>Bank sales</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.bankSales)}</h2>
            </div>
            <div className="card stat warn">
              <h6>Credit</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.creditTotal)}</h2>
            </div>
          </div>
          <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
            <div className="card stat">
              <h6>Expenses</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.expensesTotal)}</h2>
            </div>
            <div className="card stat">
              <h6>Cash in</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.cashIn)}</h2>
            </div>
            <div className="card stat">
              <h6>Cash out</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.cashOut)}</h2>
            </div>
            <div className="card stat">
              <h6>Net</h6>
              <h2 style={{ fontSize: '1.1rem' }}>{money(data.net)}</h2>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card table-wrap">
              <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Sales</h3>
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Pay</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!data.sales?.length && (
                    <tr>
                      <td colSpan={4} className="empty">
                        No sales
                      </td>
                    </tr>
                  )}
                  {data.sales?.map((s) => (
                    <tr key={s._id}>
                      <td>{s.invoice}</td>
                      <td>{s.customerName}</td>
                      <td>{s.payment}</td>
                      <td>{money(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card table-wrap">
              <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Expenses</h3>
              <table>
                <thead>
                  <tr>
                    <th>Desc</th>
                    <th>From</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {!data.expenses?.length && (
                    <tr>
                      <td colSpan={3} className="empty">
                        No expenses
                      </td>
                    </tr>
                  )}
                  {data.expenses?.map((e) => (
                    <tr key={e._id}>
                      <td>{e.desc}</td>
                      <td>{e.payFrom || 'cash'}</td>
                      <td>{money(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
