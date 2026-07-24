import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  THERMAL_SIZES,
  getStoredPaperSize,
  openThermalReceipt,
  setStoredPaperSize,
} from '../../utils/thermalReceipt';

const BANK_METHODS = ['Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card'];

export default function Pos() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(5);
  const [payMode, setPayMode] = useState('single');
  const [payment, setPayment] = useState('Cash');
  const [cashAmt, setCashAmt] = useState('');
  const [bankAmt, setBankAmt] = useState('');
  const [bankMethod, setBankMethod] = useState('JazzCash');
  const [bankAccount, setBankAccount] = useState('');
  const [creditAmt, setCreditAmt] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [source, setSource] = useState('Walk-in');
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [holds, setHolds] = useState([]);
  const [activeHoldId, setActiveHoldId] = useState('');
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
    const [p, s, c, b, h] = await Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      api.get('/sales', { params: { limit: 50 } }),
      api.get('/customers'),
      api.get('/accounts/banks'),
      api.get('/sales/holds'),
    ]);
    setProducts(p.data.products || []);
    setSales(s.data.sales || []);
    setCustomers(c.data.customers || []);
    const list = b.data.banks || [];
    setBanks(list);
    if (!bankAccount && list[0]) setBankAccount(list[0]._id);
    setHolds(h.data.holds || []);
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
    const selected = customers.find((c) => c._id === customerId);
    const group = selected?.group || 'retail';
    let price = Number(product.sellPrice) || 0;
    if (group === 'wholesale' && product.wholesalePrice > 0) price = product.wholesalePrice;
    else if (group === 'dealer' && product.dealerPrice > 0) price = product.dealerPrice;
    else if (group === 'vip' && product.vipPrice > 0) price = product.vipPrice;
    if (product.offerPrice > 0 && product.offerPrice < price) price = product.offerPrice;
    if (product.minPrice > 0 && price < product.minPrice) price = product.minPrice;

    setCart((prev) => {
      const exist = prev.find((c) => c.productId === product._id);
      if (exist) {
        const nextQty = exist.qty + qty;
        if (nextQty > product.qty) {
          setError('Not enough stock');
          return prev;
        }
        return prev.map((c) =>
          c.productId === product._id ? { ...c, qty: nextQty, price } : c
        );
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, qty, price, max: product.qty },
      ];
    });
  }, [customers, customerId]);

  function addManualItem() {
    const name = manualName.trim();
    const price = Number(manualPrice);
    if (!name || !price || price <= 0) {
      setError('Enter a valid item name and price');
      return;
    }
    setError('');
    const id = 'manual_' + Date.now();
    setCart((prev) => [...prev, { productId: id, name, qty: 1, price, max: 999999, manual: true }]);
    setManualName('');
    setManualPrice('');
    searchRef.current?.focus();
  }

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

  function buildPaymentPayload() {
    if (payMode === 'single') {
      if (payment === 'Credit') {
        return { payments: [], creditAmount: Number(total.toFixed(2)), payment: 'Credit' };
      }
      const needsBank = BANK_METHODS.includes(payment);
      return {
        payments: [
          {
            method: payment,
            amount: Number(total.toFixed(2)),
            bankAccount: needsBank ? bankAccount || null : null,
          },
        ],
        creditAmount: 0,
        payment,
      };
    }

    const cash = Number(cashAmt) || 0;
    const bank = Number(bankAmt) || 0;
    const credit = Number(creditAmt) || 0;
    const payments = [];
    if (cash > 0) payments.push({ method: 'Cash', amount: cash });
    if (bank > 0) {
      payments.push({
        method: bankMethod,
        amount: bank,
        bankAccount: bankAccount || null,
      });
    }
    return {
      payments,
      creditAmount: credit,
      payment: credit >= total && cash + bank === 0 ? 'Credit' : payments[0]?.method || 'Credit',
    };
  }

  function resetCartFields() {
    setCart([]);
    setQuery('');
    setManualName('');
    setManualPrice('');
    setDiscount(0);
    setTax(5);
    setCashAmt('');
    setBankAmt('');
    setCreditAmt('');
    setActiveHoldId('');
  }

  async function holdSale() {
    if (!cart.length || busyLock.current) {
      if (!cart.length) setError('Cart is empty');
      return;
    }
    busyLock.current = true;
    setBusy(true);
    setError('');
    try {
      const selected = customers.find((c) => c._id === customerId);
      await api.post('/sales/holds', {
        label: selected?.name || newCustomerName.trim() || 'Hold',
        customerId: customerId || null,
        customerName: selected?.name || newCustomerName.trim() || 'Walk-in',
        customerPhone: selected?.phone || newCustomerPhone.trim() || '',
        items: cart,
        discountPct: Number(discount) || 0,
        taxPct: Number(tax) || 0,
        source,
        payment,
        payMode,
        cashAmt: Number(cashAmt) || 0,
        bankAmt: Number(bankAmt) || 0,
        bankMethod,
        bankAccount: bankAccount || null,
        creditAmt: Number(creditAmt) || 0,
      });
      setMessage('Invoice held — resume anytime from Held list');
      resetCartFields();
      await load();
      searchRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Hold failed');
    } finally {
      busyLock.current = false;
      setBusy(false);
    }
  }

  async function resumeHold(hold) {
    setError('');
    setCart(
      (hold.items || []).map((it) => ({
        productId: it.productId,
        name: it.name,
        qty: it.qty,
        price: it.price,
        max: it.max || it.qty,
        manual: !!it.manual,
      }))
    );
    setDiscount(hold.discountPct || 0);
    setTax(hold.taxPct ?? 5);
    setSource(hold.source || 'Walk-in');
    setPayment(hold.payment || 'Cash');
    setPayMode(hold.payMode || 'single');
    setCashAmt(hold.cashAmt ? String(hold.cashAmt) : '');
    setBankAmt(hold.bankAmt ? String(hold.bankAmt) : '');
    setBankMethod(hold.bankMethod || 'JazzCash');
    setBankAccount(hold.bankAccount || bankAccount);
    setCreditAmt(hold.creditAmt ? String(hold.creditAmt) : '');
    setCustomerId(hold.customerId || '');
    setNewCustomerName(hold.customerId ? '' : hold.customerName || '');
    setNewCustomerPhone(hold.customerId ? '' : hold.customerPhone || '');
    setActiveHoldId(hold._id);
    setMessage(`Resumed hold: ${hold.label || hold.customerName}`);
  }

  async function discardHold(id) {
    try {
      await api.delete(`/sales/holds/${id}`);
      if (activeHoldId === id) setActiveHoldId('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete hold');
    }
  }

  async function completeSale() {
    if (!cart.length || busyLock.current) {
      if (!cart.length) setError('Cart is empty');
      return;
    }
    const payload = buildPaymentPayload();
    const paid = (payload.payments || []).reduce((s, p) => s + p.amount, 0);
    const credit = Number(payload.creditAmount) || 0;
    if (Math.abs(paid + credit - total) > 0.05) {
      setError(`Payments + credit must equal ${money(total)}`);
      return;
    }
    if (credit > 0 && !customerId && !(newCustomerName.trim() && newCustomerPhone.trim())) {
      setError('Select or create a customer for credit / udhaar');
      return;
    }

    busyLock.current = true;
    setBusy(true);
    setError('');
    try {
      let resolvedCustomerId = customerId || null;
      if (!resolvedCustomerId && newCustomerPhone.trim() && newCustomerName.trim()) {
        const { data: created } = await api.post('/customers', {
          name: newCustomerName.trim(),
          phone: newCustomerPhone.trim(),
        });
        resolvedCustomerId = created.customer._id;
      }

      const selected = customers.find((c) => c._id === resolvedCustomerId);
      const { data } = await api.post('/sales', {
        items: cart.map((c) => {
          if (c.manual) return { productId: null, name: c.name, qty: c.qty, price: c.price, manual: true };
          return { productId: c.productId, qty: c.qty, price: c.price };
        }),
        discountPct: Number(discount) || 0,
        taxPct: Number(tax) || 0,
        payments: payload.payments,
        creditAmount: payload.creditAmount,
        payment: payload.payment,
        bankAccount: bankAccount || null,
        source,
        customerId: resolvedCustomerId,
        customerName: selected?.name || newCustomerName.trim() || 'Walk-in',
        customerPhone: selected?.phone || newCustomerPhone.trim() || '',
      });
      setMessage(`Sale complete — ${data.invoice} · ${money(data.total)}`);
      setLastSale(data);
      if (activeHoldId) {
        try {
          await api.delete(`/sales/holds/${activeHoldId}`);
        } catch {
          /* ignore */
        }
      }
      resetCartFields();
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

          <div className="manual-item-row">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Manual item name</label>
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. RAM, Service charge"
                onKeyDown={(e) => { if (e.key === 'Enter') addManualItem(); }}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="e.g. 5000"
                onKeyDown={(e) => { if (e.key === 'Enter') addManualItem(); }}
              />
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={addManualItem} style={{ marginTop: '1px' }}>
              Add
            </button>
          </div>

          <h3 style={{ margin: '1rem 0 0.5rem', fontFamily: 'var(--display)' }}>Cart</h3>
          {!cart.length && <p className="empty">Cart empty</p>}
          {cart.map((c) => (
            <div className="cart-item" key={c.productId}>
              <span>
                {c.name} {c.manual ? <small style={{ color: 'var(--muted)', fontStyle: 'italic' }}>(manual)</small> : ''} ×{c.qty} — {money(c.price * c.qty)}
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
                    if (c.manual) {
                      setCart((prev) =>
                        prev.map((x) =>
                          x.productId === c.productId ? { ...x, qty: x.qty + 1 } : x
                        )
                      );
                    } else {
                      const product = products.find((p) => p._id === c.productId);
                      if (product) addToCart(product);
                    }
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
              <label>Customer</label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  if (e.target.value) {
                    setNewCustomerName('');
                    setNewCustomerPhone('');
                  }
                }}
              >
                <option value="">Walk-in</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                    {c.phone ? ` · ${c.phone}` : ''}
                    {(c.balance || 0) > 0 ? ` · due ${money(c.balance)}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {!customerId && (
              <>
                <div className="field">
                  <label>New name (credit)</label>
                  <input
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="field">
                  <label>New phone</label>
                  <input
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="For udhaar"
                  />
                </div>
              </>
            )}
            <div className="field">
              <label>Disc %</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="field">
              <label>Tax %</label>
              <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
            </div>
            <div className="field">
              <label>Pay mode</label>
              <select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                <option value="single">Single method</option>
                <option value="split">Split (cash + bank + credit)</option>
              </select>
            </div>
            {payMode === 'single' ? (
              <div className="field">
                <label>Payment</label>
                <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                  {['Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer', 'Card', 'Credit'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="field">
                  <label>Cash</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashAmt}
                    onChange={(e) => setCashAmt(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Bank amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bankAmt}
                    onChange={(e) => setBankAmt(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Bank method</label>
                  <select value={bankMethod} onChange={(e) => setBankMethod(e.target.value)}>
                    {BANK_METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Credit / udhaar</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={creditAmt}
                    onChange={(e) => setCreditAmt(e.target.value)}
                  />
                </div>
              </>
            )}
            {(payMode === 'split' || BANK_METHODS.includes(payment)) && (
              <div className="field">
                <label>Bank account</label>
                <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
                  {banks.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              onClick={holdSale}
              disabled={busy || !cart.length}
              type="button"
            >
              Hold invoice
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                resetCartFields();
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
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Held invoices</h3>
          {!holds.length && <p className="empty">No held invoices</p>}
          {holds.map((h) => (
            <div key={h._id} className="cart-item">
              <span>
                {h.label || h.customerName} · {(h.items || []).length} items
                {activeHoldId === h._id ? ' · active' : ''}
              </span>
              <div className="row">
                <button className="btn btn-primary btn-sm" type="button" onClick={() => resumeHold(h)}>
                  Resume
                </button>
                <button className="btn btn-danger btn-sm" type="button" onClick={() => discardHold(h._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          <h3 style={{ margin: '1rem 0 0.75rem', fontFamily: 'var(--display)' }}>Today&apos;s sales</h3>
          {!todaySales.length && <p className="empty">No sales today</p>}
          {todaySales.map((s) => (
            <div key={s._id} className="cart-item">
              <span>
                {s.invoice} · {s.payment}
                {(s.creditAmount || 0) > 0 ? ` · credit ${money(s.creditAmount)}` : ''}
                {s.status && s.status !== 'completed' ? ` · ${s.status}` : ''}
              </span>
              <strong>{money(s.total)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
