import { useEffect, useMemo, useState } from 'react';
import api, { money } from '../../api';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState([{ productId: '', qty: 1, cost: '' }]);
  const [payMode, setPayMode] = useState('credit');
  const [cashAmt, setCashAmt] = useState('');
  const [bankAmt, setBankAmt] = useState('');
  const [bankMethod, setBankMethod] = useState('Bank Transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);

  async function load() {
    const [p, s, pr, b] = await Promise.all([
      api.get('/purchases', { params: { limit: 50 } }),
      api.get('/suppliers'),
      api.get('/products', { params: { limit: 100 } }),
      api.get('/accounts/banks'),
    ]);
    setPurchases(p.data.purchases || []);
    const supp = s.data.suppliers || [];
    setSuppliers(supp);
    if (!supplierId && supp[0]) setSupplierId(supp[0]._id);
    setProducts(pr.data.products || []);
    const list = b.data.banks || [];
    setBanks(list);
    if (!bankAccount && list[0]) setBankAccount(list[0]._id);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  const subtotal = useMemo(() => {
    return lines.reduce((s, l) => {
      const qty = Number(l.qty) || 0;
      const cost = Number(l.cost) || 0;
      return s + qty * cost;
    }, 0);
  }, [lines]);

  function updateLine(idx, patch) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function onProductPick(idx, productId) {
    const product = products.find((p) => p._id === productId);
    updateLine(idx, {
      productId,
      cost: product ? String(product.buyPrice || 0) : '',
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!supplierId) {
      setError('Select a supplier');
      return;
    }
    const items = lines
      .filter((l) => l.productId && Number(l.qty) > 0)
      .map((l) => ({
        productId: l.productId,
        qty: Number(l.qty) || 0,
        cost: Number(l.cost) || 0,
      }));
    if (!items.length) {
      setError('Add at least one product line');
      return;
    }

    const total = Number(subtotal.toFixed(2));
    let payload = {
      supplierId,
      items,
      note,
      updateBuyPrice: true,
    };

    if (payMode === 'credit') {
      payload = { ...payload, payments: [], creditAmount: total, payment: 'Credit' };
    } else if (payMode === 'cash') {
      payload = {
        ...payload,
        payments: [{ method: 'Cash', amount: total }],
        creditAmount: 0,
        payment: 'Cash',
      };
    } else if (payMode === 'bank') {
      payload = {
        ...payload,
        payments: [{ method: bankMethod, amount: total, bankAccount }],
        creditAmount: 0,
        payment: bankMethod,
      };
    } else {
      const cash = Number(cashAmt) || 0;
      const bank = Number(bankAmt) || 0;
      const credit = Number((total - cash - bank).toFixed(2));
      if (credit < -0.05) {
        setError('Cash + bank exceed total');
        return;
      }
      const payments = [];
      if (cash > 0) payments.push({ method: 'Cash', amount: cash });
      if (bank > 0) {
        payments.push({ method: bankMethod, amount: bank, bankAccount });
      }
      payload = {
        ...payload,
        payments,
        creditAmount: Math.max(0, credit),
        payment: payments[0]?.method || 'Credit',
      };
    }

    setBusy(true);
    try {
      const { data } = await api.post('/purchases', payload);
      setMessage(`Purchase ${data.purchase.purchaseNo} received · stock updated`);
      setLines([{ productId: '', qty: 1, cost: '' }]);
      setCashAmt('');
      setBankAmt('');
      setNote('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id) {
    if (!window.confirm('Cancel this purchase? Stock and balances will reverse if possible.')) return;
    setError('');
    try {
      await api.post(`/purchases/${id}/cancel`);
      setMessage('Purchase cancelled');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    }
  }

  async function loadReport(type) {
    const { data } = await api.get('/purchases/report', { params: { type } });
    setReport({ ...data, type });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Purchases</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Receive stock from suppliers — updates inventory and supplier due.
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>New purchase</h3>
        {!suppliers.length && (
          <p className="empty">Add a supplier first (Suppliers page), then create a purchase.</p>
        )}
        <form onSubmit={submit}>
          <div className="grid grid-2">
            <div className="field">
              <label>Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                <option value="">Select</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} · due {money(s.balance)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Pay mode</label>
              <select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                <option value="credit">Credit (supplier due)</option>
                <option value="cash">Pay all cash</option>
                <option value="bank">Pay all bank</option>
                <option value="split">Split cash / bank / credit</option>
              </select>
            </div>
          </div>

          {lines.map((line, idx) => (
            <div key={idx} className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <div className="field" style={{ flex: 2, minWidth: 180, marginBottom: 0 }}>
                <label>Product</label>
                <select
                  value={line.productId}
                  onChange={(e) => onProductPick(idx, e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} · stock {p.qty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ width: 100, marginBottom: 0 }}>
                <label>Qty</label>
                <input
                  type="number"
                  min="1"
                  value={line.qty}
                  onChange={(e) => updateLine(idx, { qty: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ width: 120, marginBottom: 0 }}>
                <label>Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.cost}
                  onChange={(e) => updateLine(idx, { cost: e.target.value })}
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={lines.length === 1}
                onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginBottom: '0.75rem' }}
            onClick={() => setLines((prev) => [...prev, { productId: '', qty: 1, cost: '' }])}
          >
            + Line
          </button>

          {payMode === 'bank' || payMode === 'split' ? (
            <div className="grid grid-2">
              {payMode === 'split' && (
                <>
                  <div className="field">
                    <label>Cash paid</label>
                    <input type="number" min="0" step="0.01" value={cashAmt} onChange={(e) => setCashAmt(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Bank paid</label>
                    <input type="number" min="0" step="0.01" value={bankAmt} onChange={(e) => setBankAmt(e.target.value)} />
                  </div>
                </>
              )}
              <div className="field">
                <label>Bank method</label>
                <select value={bankMethod} onChange={(e) => setBankMethod(e.target.value)}>
                  {['Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Bank account</label>
                <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
                  {banks.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({money(b.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="field">
            <label>Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Total: {money(subtotal)}</strong>
            <button className="btn btn-primary" disabled={busy || !suppliers.length}>
              {busy ? 'Saving...' : 'Receive stock'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Purchase reports</h3>
        <div className="row" style={{ marginBottom: '0.75rem' }}>
          {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
            <button key={t} type="button" className="btn btn-outline btn-sm" onClick={() => loadReport(t)}>
              {t}
            </button>
          ))}
        </div>
        {report && (
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {report.title}: {report.count} bills · Total {money(report.total)} · Paid {money(report.paid)} ·
            Credit {money(report.credit)}
          </p>
        )}
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Total</th>
              <th>Credit</th>
              <th>Pay</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!purchases.length && (
              <tr>
                <td colSpan={7} className="empty">
                  No purchases yet
                </td>
              </tr>
            )}
            {purchases.map((p) => (
              <tr key={p._id}>
                <td>{p.purchaseNo}</td>
                <td>{p.supplierName}</td>
                <td>{p.date}</td>
                <td>{money(p.total)}</td>
                <td>{money(p.creditAmount || 0)}</td>
                <td>{p.payment}</td>
                <td>
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => cancel(p._id)}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
