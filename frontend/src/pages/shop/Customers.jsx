import { useEffect, useState } from 'react';
import api, { money } from '../../api';

const emptyEdit = {
  name: '',
  phone: '',
  whatsapp: '',
  group: 'retail',
  creditLimit: '0',
  notes: '',
};

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
  const [editId, setEditId] = useState('');
  const [edit, setEdit] = useState(emptyEdit);
  const [adjustId, setAdjustId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
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

  function startEdit(c) {
    setEditId(c._id);
    setEdit({
      name: c.name || '',
      phone: c.phone || '',
      whatsapp: c.whatsapp || c.phone || '',
      group: c.group || 'retail',
      creditLimit: String(c.creditLimit || 0),
      notes: c.notes || '',
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!window.confirm('Save customer changes?')) return;
    setError('');
    try {
      await api.patch(`/customers/${editId}`, {
        ...edit,
        creditLimit: Number(edit.creditLimit) || 0,
        reason: 'Customer profile updated',
      });
      setEditId('');
      setEdit(emptyEdit);
      setMessage('Customer updated');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  async function remove(c) {
    const reason = window.prompt(`Delete ${c.name}? Enter reason:`);
    if (!reason) return;
    setError('');
    try {
      await api.delete(`/customers/${c._id}`, { data: { reason } });
      setMessage('Customer deleted');
      if (ledger?.customer?._id === c._id) setLedger(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  }

  async function adjustBalance(e) {
    e.preventDefault();
    if (!adjustId) return;
    if (!adjustReason.trim()) {
      setError('Reason is required for manual balance adjustment');
      return;
    }
    if (
      !window.confirm(
        `Adjust balance by ${adjustAmount}? This is logged for audit.`
      )
    ) {
      return;
    }
    setError('');
    try {
      await api.post(`/customers/${adjustId}/adjust`, {
        amount: Number(adjustAmount),
        reason: adjustReason.trim(),
      });
      setAdjustAmount('');
      setAdjustReason('');
      setMessage('Balance adjusted');
      await load();
      if (ledger?.customer?._id === adjustId) {
        const { data } = await api.get(`/customers/${adjustId}/ledger`);
        setLedger(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Adjustment failed');
    }
  }

  function waLink(c) {
    const num = String(c.whatsapp || c.phone || '').replace(/\D/g, '');
    return num ? `https://wa.me/${num}` : null;
  }

  function telLink(c) {
    const num = String(c.phone || '').trim();
    return num ? `tel:${num}` : null;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Add customers, receive payments, edit profiles, and adjust dues with a reason.
          </p>
        </div>
      </div>
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

      {editId && (
        <div className="card" style={{ marginBottom: '1rem', maxWidth: 640 }}>
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Edit customer</h3>
          <form onSubmit={saveEdit}>
            <div className="grid grid-2">
              <div className="field">
                <label>Name</label>
                <input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  value={edit.phone}
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input
                  value={edit.whatsapp}
                  onChange={(e) => setEdit({ ...edit, whatsapp: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Group</label>
                <select
                  value={edit.group}
                  onChange={(e) => setEdit({ ...edit, group: e.target.value })}
                >
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
                  value={edit.creditLimit}
                  onChange={(e) => setEdit({ ...edit, creditLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea
                rows={2}
                value={edit.notes}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              />
            </div>
            <div className="row" style={{ gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">
                Save changes
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setEditId('');
                  setEdit(emptyEdit);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem', maxWidth: 560 }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Manual balance adjustment</h3>
        <p className="page-sub">Use + to increase due, − to reduce. Reason is required and audited.</p>
        <form onSubmit={adjustBalance}>
          <div className="field">
            <label>Customer</label>
            <select value={adjustId} onChange={(e) => setAdjustId(e.target.value)} required>
              <option value="">Select</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} · due {money(c.balance || 0)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Amount (+ due / − reduce)</label>
            <input
              type="number"
              step="0.01"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Reason</label>
            <input
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Opening balance / write-off"
              required
            />
          </div>
          <button className="btn btn-primary">Adjust balance</button>
        </form>
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
                <td>
                  {c.name}
                  {c.notes ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.notes}</div>
                  ) : null}
                </td>
                <td>{c.phone || '—'}</td>
                <td>{c.group || 'retail'}</td>
                <td>{c.orders}</td>
                <td>{money(c.spent)}</td>
                <td>{money(c.balance || 0)}</td>
                <td>{money(c.creditLimit || 0)}</td>
                <td className="row" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => openLedger(c._id)}>
                    Ledger
                  </button>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  {waLink(c) && (
                    <a className="btn btn-outline btn-sm" href={waLink(c)} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  )}
                  {telLink(c) && (
                    <a className="btn btn-outline btn-sm" href={telLink(c)}>
                      Call
                    </a>
                  )}
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => remove(c)}>
                    Delete
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
