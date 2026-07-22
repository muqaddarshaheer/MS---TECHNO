import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [filter, setFilter] = useState('all');

  async function load() {
    const params = { limit: 100 };
    if (filter === 'low') params.low = '1';
    if (filter === 'out') params.out = '1';
    if (filter === 'expiring') params.expiring = '1';
    const [p, m] = await Promise.all([
      api.get('/products', { params }),
      api.get('/products/movements', { params: { limit: 30 } }),
    ]);
    setProducts(p.data.products || []);
    setMovements(m.data.movements || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, [filter]);

  const stockQty = products.reduce((s, p) => s + p.qty, 0);
  const low = products.filter((p) => p.qty > 0 && p.qty <= (p.reorderLevel ?? 5)).length;
  const out = products.filter((p) => p.qty === 0).length;
  const value = products.reduce((s, p) => s + p.buyPrice * p.qty, 0);
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const soonStr = soon.toISOString().slice(0, 10);
  const expiring = products.filter(
    (p) => p.expiryDate && p.expiryDate >= today && p.expiryDate <= soonStr
  ).length;

  async function adjust(id, delta, reason = 'adjustment') {
    setBusyId(id);
    setError('');
    try {
      await api.post(`/products/${id}/stock`, { delta, reason });
      setMessage(
        reason === 'damage'
          ? 'Damage recorded'
          : reason === 'lost'
            ? 'Lost stock recorded'
            : delta > 0
              ? 'Stock increased'
              : 'Stock decreased'
      );
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Stock update failed');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div>
      <h2 className="page-title">Stock</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>On hand</h6>
          <h2>{stockQty}</h2>
        </div>
        <div className="card stat warn">
          <h6>Low / Out</h6>
          <h2>
            {low}/{out}
          </h2>
        </div>
        <div className="card stat danger">
          <h6>Expiring (30d)</h6>
          <h2>{expiring}</h2>
        </div>
        <div className="card stat">
          <h6>Stock value</h6>
          <h2 style={{ fontSize: '1.1rem' }}>{money(value)}</h2>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '0.75rem' }}>
        {[
          ['all', 'All'],
          ['low', 'Low'],
          ['out', 'Out'],
          ['expiring', 'Expiring'],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`btn btn-sm ${filter === k ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(k)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card table-wrap" style={{ marginBottom: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Reorder</th>
              <th>Expiry</th>
              <th>Batch</th>
              <th>Value</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.qty}</td>
                <td>{p.reorderLevel ?? 5}</td>
                <td>{p.expiryDate || '—'}</td>
                <td>{p.batchNumber || '—'}</td>
                <td>{money(p.buyPrice * p.qty)}</td>
                <td className="row" style={{ flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busyId === p._id}
                    onClick={() => adjust(p._id, 1, 'receive')}
                  >
                    +1
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busyId === p._id || p.qty < 1}
                    onClick={() => adjust(p._id, -1, 'adjustment')}
                  >
                    −1
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={busyId === p._id || p.qty < 1}
                    onClick={() => adjust(p._id, -1, 'damage')}
                  >
                    Damage
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={busyId === p._id || p.qty < 1}
                    onClick={() => adjust(p._id, -1, 'lost')}
                  >
                    Lost
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card table-wrap">
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Recent movements</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Δ</th>
              <th>After</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {!movements.length && (
              <tr>
                <td colSpan={5} className="empty">
                  No movements yet
                </td>
              </tr>
            )}
            {movements.map((m) => (
              <tr key={m._id}>
                <td>{m.date}</td>
                <td>{m.productName}</td>
                <td>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                <td>{m.qtyAfter}</td>
                <td>{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
