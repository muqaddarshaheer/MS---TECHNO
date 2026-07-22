import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('retail');
  const [creditLimit, setCreditLimit] = useState('0');
  const [payId, setPayId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [bankAccount, setBankAccount] = useState('');
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [c, b] = await Promise.all([api.get('/customers'), api.get('/accounts/banks')]);
    setCustomers(c.data.customers || []);
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
      await api.post('/customers', { name, phone, group, creditLimit: Number(creditLimit) || 0 });
      setName('');
      setPhone('');
      setGroup('retail');
      setCreditLimit('0');
      setMessage('Customer saved');
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
      await api.post(`/customers/${payId}/payments`, {
        amount: Number(amount) || 0,
        method,
        bankAccount: method === 'Cash' ? null : bankAccount,
      });
      setAmount('');
      setMessage('Payment received');
      await load();
      if (ledger?.customer?._id === payId) {
        const { data } = await api.get(`/customers/${payId}/ledger`);
        setLedger(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  }

  async function openLedger(id) {
    const { data } = await api.get(`/customers/${id}/ledger`);
    setLedger(data);
    setPayId(id);
  }

  return (
    <div>
      <h2 className="page-title">Customers</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Add customer</h3>
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
              <label>Group</label>
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="dealer">Dealer</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="field">
              <label>Credit limit</label>
              <input
                type="number"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
              />
            </div>
            <button className="btn btn-primary">Save</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Receive payment</h3>
          <form onSubmit={pay}>
            <div className="field">
              <label>Customer</label>
              <select value={payId} onChange={(e) => setPayId(e.target.value)} required>
                <option value="">Select</option>
                {customers
                  .filter((c) => (c.balance || 0) > 0)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} · due {money(c.balance)}
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
            <button className="btn btn-primary">Receive</button>
          </form>
        </div>
      </div>

      <div className="card table-wrap" style={{ marginBottom: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Group</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Due</th>
              <th>Limit</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!customers.length && (
              <tr>
                <td colSpan={8} className="empty">
                  No customers
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.group || 'retail'}</td>
                <td>{c.orders}</td>
                <td>{money(c.spent)}</td>
                <td>{money(c.balance || 0)}</td>
                <td>{money(c.creditLimit || 0)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => openLedger(c._id)}>
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
            Ledger · {ledger.customer?.name} · due {money(ledger.customer?.balance)}
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
