import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [banks, setBanks] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payFrom, setPayFrom] = useState('cash');
  const [bankAccount, setBankAccount] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [e, b] = await Promise.all([api.get('/expenses'), api.get('/accounts/banks')]);
    setExpenses(e.data.expenses || []);
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
      await api.post('/expenses', {
        desc,
        amount: Number(amount),
        payFrom,
        bankAccount: payFrom === 'bank' ? bankAccount : null,
      });
      setDesc('');
      setAmount('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  }

  async function remove(id) {
    await api.delete(`/expenses/${id}`);
    await load();
  }

  return (
    <div>
      <h2 className="page-title">Expenses</h2>
      {error && <div className="error">{error}</div>}
      <div className="card" style={{ marginBottom: '1rem', maxWidth: 640 }}>
        <form onSubmit={add} className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
            <label>Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>
          <div className="field" style={{ width: 120, marginBottom: 0 }}>
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ width: 120, marginBottom: 0 }}>
            <label>Pay from</label>
            <select value={payFrom} onChange={(e) => setPayFrom(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          {payFrom === 'bank' && (
            <div className="field" style={{ width: 160, marginBottom: 0 }}>
              <label>Account</label>
              <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button className="btn btn-primary">Add</button>
        </form>
      </div>
      <div className="card">
        {expenses.map((e) => (
          <div key={e._id} className="cart-item">
            <span>
              {e.desc} ({e.date}) · {e.payFrom || 'cash'}
            </span>
            <div className="row">
              <strong>{money(e.amount)}</strong>
              <button className="btn btn-danger btn-sm" onClick={() => remove(e._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
