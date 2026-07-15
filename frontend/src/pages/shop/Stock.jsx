import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/sales')]).then(([p, s]) => {
      setProducts(p.data.products || []);
      setSales(s.data.sales || []);
    });
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
  const value = products.reduce((s, p) => s + p.buyPrice * p.qty, 0);

  return (
    <div>
      <h2 className="page-title">Stock</h2>
      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Current</h6>
          <h2>{stockQty}</h2>
        </div>
        <div className="card stat">
          <h6>Sold</h6>
          <h2>{sold}</h2>
        </div>
        <div className="card stat warn">
          <h6>Low</h6>
          <h2>{low}</h2>
        </div>
        <div className="card stat">
          <h6>Value</h6>
          <h2 style={{ fontSize: '1.1rem' }}>{money(value)}</h2>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current</th>
              <th>Sold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const status = p.qty === 0 ? 'Out' : p.qty <= 5 ? 'Low' : 'In Stock';
              const badge = p.qty === 0 ? 'danger' : p.qty <= 5 ? 'warn' : '';
              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.qty}</td>
                  <td>{soldMap[p._id] || 0}</td>
                  <td>
                    <span className={`badge ${badge}`}>{status}</span>
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
