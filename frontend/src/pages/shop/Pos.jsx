import { useEffect, useMemo, useState } from 'react';
import api, { money } from '../../api';

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(5);
  const [payment, setPayment] = useState('Cash');
  const [source, setSource] = useState('Walk-in');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [p, s] = await Promise.all([api.get('/products'), api.get('/sales')]);
    setProducts(p.data.products || []);
    setSales(s.data.sales || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  const found = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.barcode || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  function addToCart(product) {
    if (product.qty <= 0) {
      setError('Out of stock');
      return;
    }
    setError('');
    setCart((prev) => {
      const exist = prev.find((c) => c.productId === product._id);
      if (exist) {
        if (exist.qty >= product.qty) {
          setError('Not enough stock');
          return prev;
        }
        return prev.map((c) =>
          c.productId === product._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { productId: product._id, name: product.name, qty: 1, price: product.sellPrice }];
    });
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const afterDisc = subtotal - subtotal * (Number(discount) / 100);
  const total = afterDisc + afterDisc * (Number(tax) / 100);

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date === today);

  async function completeSale() {
    if (!cart.length) {
      setError('Cart is empty');
      return;
    }
    setError('');
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((c) => ({ productId: c.productId, qty: c.qty })),
        discountPct: Number(discount) || 0,
        taxPct: Number(tax) || 0,
        payment,
        source,
        customerName: 'Walk-in',
      });
      setMessage(`Sale complete — ${data.invoice} · ${money(data.total)}`);
      setCart([]);
      setQuery('');
      setDiscount(0);
      setTax(5);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Sale failed');
    }
  }

  return (
    <div>
      <h2 className="page-title">POS</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="grid grid-2">
        <div className="card">
          <div className="field">
            <label>Search product</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or barcode"
            />
          </div>
          {found.map((p) => (
            <div className="cart-item" key={p._id}>
              <span>
                {p.name} — {money(p.sellPrice)} ({p.qty})
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)}>
                Add
              </button>
            </div>
          ))}

          <h3 style={{ margin: '1rem 0 0.5rem', fontFamily: 'var(--display)' }}>Cart</h3>
          {!cart.length && <p className="empty">Cart empty</p>}
          {cart.map((c, i) => (
            <div className="cart-item" key={c.productId}>
              <span>
                {c.name} x{c.qty} — {money(c.price * c.qty)}
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="grid grid-pos" style={{ marginTop: '0.75rem' }}>
            <div className="field">
              <label>Disc %</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="field">
              <label>Tax %</label>
              <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
            </div>
            <div className="field">
              <label>Payment</label>
              <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                {['Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                {['Walk-in', 'Online', 'Referral', 'Social Media'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ marginBottom: '0.75rem' }}>Total: {money(total)}</h3>
          <div className="row">
            <button className="btn btn-primary" onClick={completeSale}>
              Complete sale
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setCart([]);
                setQuery('');
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Today&apos;s sales</h3>
          {!todaySales.length && <p className="empty">No sales today</p>}
          {todaySales.map((s) => (
            <div key={s._id} className="cart-item">
              <span>
                {s.invoice} · {s.payment}
              </span>
              <strong>{money(s.total)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
