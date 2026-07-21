import { useEffect, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  THERMAL_SIZES,
  getStoredPaperSize,
  openThermalReceipt,
  setStoredPaperSize,
} from '../../utils/thermalReceipt';

export default function Invoices() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [banks, setBanks] = useState([]);
  const [paperSize, setPaperSize] = useState(getStoredPaperSize);
  const [returnSale, setReturnSale] = useState(null);
  const [returnQty, setReturnQty] = useState({});
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [bankAccount, setBankAccount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [s, b] = await Promise.all([
      api.get('/sales', { params: { limit: 100 } }),
      api.get('/accounts/banks'),
    ]);
    setSales(s.data.sales || []);
    const list = b.data.banks || [];
    setBanks(list);
    if (!bankAccount && list[0]) setBankAccount(list[0]._id);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  const shopName = user?.shop?.name || 'Shop';

  function printThermal(sale, autoPrint = true) {
    openThermalReceipt({
      shopName,
      sale,
      total: sale.total,
      invoice: sale.invoice,
      paper: paperSize,
      autoPrint,
    });
  }

  function openReturn(sale) {
    setError('');
    setMessage('');
    setReturnSale(sale);
    setRefundMethod(sale.creditAmount > 0 && sale.customer ? 'Credit' : sale.payment || 'Cash');
    setNote('');
    const qtyMap = {};
    for (const it of sale.items || []) {
      const key = String(it.product || it.name);
      const rem = (it.qty || 0) - (it.returnedQty || 0);
      qtyMap[key] = rem > 0 ? rem : 0;
    }
    setReturnQty(qtyMap);
  }

  async function submitReturn(e) {
    e.preventDefault();
    if (!returnSale) return;
    setBusy(true);
    setError('');
    try {
      const items = (returnSale.items || [])
        .map((it) => {
          const key = String(it.product || it.name);
          const qty = Number(returnQty[key]) || 0;
          return {
            productId: it.product,
            name: it.name,
            qty,
          };
        })
        .filter((it) => it.qty > 0);

      if (!items.length) {
        setError('Select at least one item qty to return');
        setBusy(false);
        return;
      }

      await api.post(`/sales/${returnSale._id}/returns`, {
        items,
        refundMethod,
        bankAccount: refundMethod === 'Cash' || refundMethod === 'Credit' ? null : bankAccount,
        note,
      });
      setMessage(`Return recorded for ${returnSale.invoice}`);
      setReturnSale(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          Invoices
        </h2>
        <div className="field" style={{ marginBottom: 0, minWidth: 180 }}>
          <label>Thermal paper</label>
          <select
            value={paperSize}
            onChange={(e) => {
              setPaperSize(e.target.value);
              setStoredPaperSize(e.target.value);
            }}
          >
            {Object.values(THERMAL_SIZES).map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Returned</th>
              <th>Date</th>
              <th>Payment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id}>
                <td>{s.invoice}</td>
                <td>{s.customerName}</td>
                <td>{s.status || 'completed'}</td>
                <td>{money(s.total)}</td>
                <td>{money(s.returnedAmount || 0)}</td>
                <td>{s.date}</td>
                <td>{s.payment}</td>
                <td className="row" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => printThermal(s, false)}>
                    Preview
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => printThermal(s, true)}>
                    Print
                  </button>
                  {s.status !== 'returned' && (
                    <button className="btn btn-outline btn-sm" onClick={() => openReturn(s)}>
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {returnSale && (
        <div className="modal-backdrop" onClick={() => !busy && setReturnSale(null)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--display)', marginTop: 0 }}>
              Return · {returnSale.invoice}
            </h3>
            <form onSubmit={submitReturn}>
              <div className="table-wrap" style={{ marginBottom: '0.75rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Sold</th>
                      <th>Already</th>
                      <th>Return qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(returnSale.items || []).map((it) => {
                      const key = String(it.product || it.name);
                      const rem = (it.qty || 0) - (it.returnedQty || 0);
                      return (
                        <tr key={key}>
                          <td>{it.name}</td>
                          <td>{it.qty}</td>
                          <td>{it.returnedQty || 0}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={rem}
                              value={returnQty[key] ?? 0}
                              disabled={rem <= 0}
                              onChange={(e) =>
                                setReturnQty((prev) => ({
                                  ...prev,
                                  [key]: Math.min(rem, Math.max(0, Number(e.target.value) || 0)),
                                }))
                              }
                              style={{ width: 80 }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="field">
                <label>Refund method</label>
                <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
                  {['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Credit'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              {refundMethod !== 'Cash' && refundMethod !== 'Credit' && (
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
                <label>Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="row">
                <button className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving...' : 'Confirm return'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={busy}
                  onClick={() => setReturnSale(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
