import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  THERMAL_SIZES,
  getStoredPaperSize,
  openThermalReceipt,
  setStoredPaperSize,
} from '../../utils/thermalReceipt';

export default function Pos() {
  const { user } = useAuth();
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
  const [busy, setBusy] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [paperSize, setPaperSize] = useState(getStoredPaperSize);
  const [autoPrint, setAutoPrint] = useState(
    () => localStorage.getItem('ms_thermal_autoprint') !== '0'
  );
  const searchRef = useRef(null);
  const busyLock = useRef(false);

  const shopName = user?.shop?.name || 'Shop';

  function onPaperChange(value) {
    setPaperSize(value);
    setStoredPaperSize(value);
  }

  function onAutoPrintChange(checked) {
    setAutoPrint(checked);
    localStorage.setItem('ms_thermal_autoprint', checked ? '1' : '0');
  }

  function previewReceipt(salePayload, opts = {}) {
    if (!salePayload) return;
    openThermalReceipt({
      shopName: salePayload.shopName || shopName,
      sale: salePayload.sale,
      total: salePayload.total,
      invoice: salePayload.invoice,
      paper: paperSize,
      autoPrint: opts.autoPrint ?? false,
    });
  }
  async function load() {
    const [p, s] = await Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      api.get('/sales', { params: { limit: 50 } }),
    ]);
    setProducts(p.data.products || []);
    setSales(s.data.sales || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
    searchRef.current?.focus();
  }, []);

  const found = useMemo(() => {
    if (!query.trim()) return products.filter((p) => p.qty > 0).slice(0, 12);
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase() === q ||
        (p.barcode || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  const addToCart = useCallback((product, qty = 1) => {
    if (product.qty <= 0) {
      setError('Out of stock');
      return;
    }
    setError('');
    setCart((prev) => {
      const exist = prev.find((c) => c.productId === product._id);
      if (exist) {
        const nextQty = exist.qty + qty;
        if (nextQty > product.qty) {
          setError('Not enough stock');
          return prev;
        }
        return prev.map((c) =>
          c.productId === product._id ? { ...c, qty: nextQty } : c
        );
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, qty, price: product.sellPrice, max: product.qty },
      ];
    });
  }, []);

  function onSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = query.trim().toLowerCase();
      if (!q) return;
      const exact = products.find((p) => (p.barcode || '').toLowerCase() === q);
      if (exact) {
        addToCart(exact);
        setQuery('');
        return;
      }
      if (found[0]) {
        addToCart(found[0]);
        setQuery('');
      }
    }
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const afterDisc = subtotal - subtotal * (Number(discount) / 100);
  const total = afterDisc + afterDisc * (Number(tax) / 100);

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date === today);

  async function completeSale() {
    if (!cart.length || busyLock.current) {
      if (!cart.length) setError('Cart is empty');
      return;
    }
    busyLock.current = true;
    setBusy(true);
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
      setLastSale(data);
      setCart([]);
      setQuery('');
      setDiscount(0);
      setTax(5);
      await load();
      searchRef.current?.focus();
      if (autoPrint) {
        openThermalReceipt({
          shopName: data.shopName || shopName,
          sale: data.sale,
          total: data.total,
          invoice: data.invoice,
          paper: paperSize,
          autoPrint: true,
        });
      } else {
        previewReceipt(data, { autoPrint: false });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sale failed');
    } finally {
      busyLock.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'F2') {
        e.preventDefault();
        completeSale();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="pos-page">
      <div className="page-header">
        <div>
          <h2 className="page-title" style={{ marginBottom: 0 }}>
            POS
          </h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Scan barcode or search · Enter to add · F2 to checkout
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="grid grid-2">
        <div className="card pos-main">
          <div className="field">
            <label>Product / barcode</label>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Scan or type name / barcode"
              autoFocus
            />
          </div>
          <div className="pos-results">
            {found.map((p) => (
              <button
                type="button"
                className="pos-result"
                key={p._id}
                onClick={() => {
                  addToCart(p);
                  setQuery('');
                  searchRef.current?.focus();
                }}
              >
                <span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.barcode || 'no barcode'} · stock {p.qty}
                  </small>
                </span>
                <strong>{money(p.sellPrice)}</strong>
              </button>
            ))}
          </div>

          <h3 style={{ margin: '1rem 0 0.5rem', fontFamily: 'var(--display)' }}>Cart</h3>
          {!cart.length && <p className="empty">Cart empty</p>}
          {cart.map((c) => (
            <div className="cart-item" key={c.productId}>
              <span>
                {c.name} ×{c.qty} — {money(c.price * c.qty)}
              </span>
              <div className="row">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    setCart((prev) =>
                      prev.map((x) =>
                        x.productId === c.productId && x.qty > 1 ? { ...x, qty: x.qty - 1 } : x
                      )
                    )
                  }
                >
                  −
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const product = products.find((p) => p._id === c.productId);
                    if (product) addToCart(product);
                  }}
                >
                  +
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setCart((prev) => prev.filter((x) => x.productId !== c.productId))}
                >
                  Remove
                </button>
              </div>
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
            <div className="field">
              <label>Thermal paper</label>
              <select value={paperSize} onChange={(e) => onPaperChange(e.target.value)}>
                {Object.values(THERMAL_SIZES).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '1.4rem' }}>
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => onAutoPrintChange(e.target.checked)}
                />
                Auto-print after sale
              </label>
            </div>
          </div>

          <h3 style={{ marginBottom: '0.75rem' }}>Total: {money(total)}</h3>
          <div className="row">
            <button className="btn btn-primary" onClick={completeSale} disabled={busy || !cart.length}>
              {busy ? 'Processing...' : 'Complete sale (F2)'}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setCart([]);
                setQuery('');
              }}
              disabled={busy}
            >
              Clear
            </button>
            {lastSale && (
              <>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => previewReceipt(lastSale, { autoPrint: false })}
                >
                  Preview thermal
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() =>
                    openThermalReceipt({
                      shopName: lastSale.shopName || shopName,
                      sale: lastSale.sale,
                      total: lastSale.total,
                      invoice: lastSale.invoice,
                      paper: paperSize,
                      autoPrint: true,
                    })
                  }
                >
                  Print receipt
                </button>
              </>
            )}
          </div>
          <p className="page-sub" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            Receipt uses {THERMAL_SIZES[paperSize]?.label || '80mm'} width with monospace alignment for
            thermal printers. In the print dialog, select your thermal printer and matching paper size.
          </p>
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
