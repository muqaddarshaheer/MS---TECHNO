import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [openingDue, setOpeningDue] = useState('0');
  const [payId, setPayId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [bankAccount, setBankAccount] = useState('');
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [s, b] = await Promise.all([api.get('/suppliers'), api.get('/accounts/banks')]);
    setSuppliers(s.data.suppliers || []);
    const list = b.data.banks || [];
    setBanks(list);
    if (!bankAccount && list[0]) setBankAccount(list[0]._id);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/suppliers', {
        name,
        phone,
        openingDue: Number(openingDue) || 0,
      });
      setName('');
      setPhone('');
      setOpeningDue('0');
      setMessage('Supplier added');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  }

  async function pay(e) {
    e.preventDefault();
    if (!payId) return;
    setError('');
    try {
      await api.post(`/suppliers/${payId}/payments`, {
        amount: Number(amount) || 0,
        method,
        bankAccount: method === 'Cash' ? null : bankAccount,
      });
      setAmount('');
      setMessage('Payment recorded');
      await load();
      if (ledger?.supplier?._id === payId) {
        const { data } = await api.get(`/suppliers/${payId}/ledger`);
        setLedger(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  }

  async function openLedger(id) {
    const { data } = await api.get(`/suppliers/${id}/ledger`);
    setLedger(data);
    setPayId(id);
  }

  return (
    <div>
      <h2 className="page-title">Suppliers</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Add supplier</h3>
          <form onSubmit={add}>
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Opening due</label>
              <input
                type="number"
                min="0"
                value={openingDue}
                onChange={(e) => setOpeningDue(e.target.value)}
              />
            </div>
            <button className="btn btn-primary">Add</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Pay due</h3>
          <form onSubmit={pay}>
            <div className="field">
              <label>Supplier</label>
              <select value={payId} onChange={(e) => setPayId(e.target.value)} required>
                <option value="">Select</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} · due {money(s.balance)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                {['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            {method !== 'Cash' && (
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
            <button className="btn btn-primary">Pay</button>
          </form>
        </div>
      </div>

      <div className="card table-wrap" style={{ marginBottom: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!suppliers.length && (
              <tr>
                <td colSpan={4} className="empty">
                  No suppliers
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.phone || '—'}</td>
                <td>{money(s.balance)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => openLedger(s._id)}>
                    Ledger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ledger && (
        <div className="card table-wrap">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>
            Ledger · {ledger.supplier?.name} · due {money(ledger.supplier?.balance)}
          </h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Note</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(ledger.entries || []).map((e) => (
                <tr key={e._id}>
                  <td>{e.date}</td>
                  <td>{e.type}</td>
                  <td>{e.note || '—'}</td>
                  <td>{money(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
