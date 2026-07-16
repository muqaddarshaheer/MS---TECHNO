import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    const [p, s] = await Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      api.get('/sales', { params: { limit: 100 } }),
    ]);
    setProducts(p.data.products || []);
    setSales(s.data.sales || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  const soldMap = {};
  for (const sale of sales) {
    for (const item of sale.items || []) {
      const id = item.product?.toString?.() || item.product;
      soldMap[id] = (soldMap[id] || 0) + item.qty;
    }
  }

  const stockQty = products.reduce((s, p) => s + p.qty, 0);
  const sold = Object.values(soldMap).reduce((s, n) => s + n, 0);
  const low = products.filter((p) => p.qty > 0 && p.qty <= 5).length;
  const out = products.filter((p) => p.qty === 0).length;
  const value = products.reduce((s, p) => s + p.buyPrice * p.qty, 0);

  async function adjust(id, delta) {
    setBusyId(id);
    setError('');
    try {
      await api.post(`/products/${id}/stock`, { delta });
      setMessage(delta > 0 ? 'Stock increased' : 'Stock decreased');
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
        <div className="card stat">
          <h6>Units sold</h6>
          <h2>{sold}</h2>
        </div>
        <div className="card stat warn">
          <h6>Low / Out</h6>
          <h2>
            {low}/{out}
          </h2>
        </div>
        <div className="card stat">
          <h6>Stock value</h6>
          <h2 style={{ fontSize: '1.1rem' }}>{money(value)}</h2>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Barcode</th>
              <th>On hand</th>
              <th>Sold</th>
              <th>Status</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const status = p.qty === 0 ? 'Out of stock' : p.qty <= 5 ? 'Low' : 'In stock';
              const badge = p.qty === 0 ? 'danger' : p.qty <= 5 ? 'warn' : '';
              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>
                    <code>{p.barcode || '—'}</code>
                  </td>
                  <td>{p.qty}</td>
                  <td>{soldMap[p._id] || 0}</td>
                  <td>
                    <span className={`badge ${badge}`}>{status}</span>
                  </td>
                  <td className="row">
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={busyId === p._id}
                      onClick={() => adjust(p._id, 1)}
                    >
                      +1
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={busyId === p._id || p.qty < 1}
                      onClick={() => adjust(p._id, -1)}
                    >
                      −1
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={busyId === p._id}
                      onClick={() => {
                        const n = Number(prompt('Add quantity (purchase/restock)', '10'));
                        if (Number.isFinite(n) && n !== 0) adjust(p._id, n);
                      }}
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
