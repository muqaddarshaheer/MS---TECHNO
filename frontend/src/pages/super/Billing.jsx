import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Billing() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [shopId, setShopId] = useState('');
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState('1');
  const [method, setMethod] = useState('Cash');
  const [pkg, setPkg] = useState('');
  const [note, setNote] = useState('');
  const [renew, setRenew] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [s, p, r] = await Promise.all([
      api.get('/shops'),
      api.get('/billing/payments'),
      api.get('/billing/revenue', { params: { type: 'monthly' } }),
    ]);
    setShops(s.data.shops || []);
    setPayments(p.data.payments || []);
    setRevenue(r.data);
    if (!shopId && s.data.shops?.[0]) setShopId(s.data.shops[0].id || s.data.shops[0]._id);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  async function loadRevenue(type) {
    const { data } = await api.get('/billing/revenue', { params: { type } });
    setRevenue(data);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api.post('/billing/payments', {
        shopId,
        amount: Number(amount) || 0,
        months: Number(months) || 1,
        method,
        package: pkg || undefined,
        note,
        renew,
        markPaid: true,
      });
      setAmount('');
      setNote('');
      setMessage('Payment recorded');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Billing</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Manual subscription payments, renewals, and SaaS revenue.
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      {revenue && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--display)' }}>{revenue.title}</h3>
              <p className="page-sub" style={{ marginBottom: 0 }}>
                {revenue.count} payments · {money(revenue.total)}
              </p>
            </div>
            <div className="row">
              {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
                <button key={t} type="button" className="btn btn-outline btn-sm" onClick={() => loadRevenue(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem', maxWidth: 560 }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Record payment</h3>
        <form onSubmit={submit}>
          <div className="field">
            <label>Shop</label>
            <select value={shopId} onChange={(e) => setShopId(e.target.value)} required>
              {shops.map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name} · {s.package}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Amount (PKR)</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Months</label>
              <input
                type="number"
                min="1"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                {['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Other'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Upgrade package (optional)</label>
              <select value={pkg} onChange={(e) => setPkg(e.target.value)}>
                <option value="">Keep current</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <input type="checkbox" checked={renew} onChange={(e) => setRenew(e.target.checked)} />
            Extend expiry by months
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Save payment'}
          </button>
        </form>
      </div>

      <div className="card table-wrap">
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Payment history</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Shop</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Plan</th>
              <th>Months</th>
            </tr>
          </thead>
          <tbody>
            {!payments.length && (
              <tr>
                <td colSpan={7} className="empty">
                  No payments yet
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{p.invoiceNo}</td>
                <td>{p.shopName}</td>
                <td>{p.date}</td>
                <td>{money(p.amount)}</td>
                <td>{p.method}</td>
                <td>{p.package}</td>
                <td>{p.months}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
