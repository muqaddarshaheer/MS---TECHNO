import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  async function load() {
    const { data } = await api.get('/expenses');
    setExpenses(data.expenses || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    await api.post('/expenses', { desc, amount: Number(amount) });
    setDesc('');
    setAmount('');
    await load();
  }

  async function remove(id) {
    await api.delete(`/expenses/${id}`);
    await load();
  }

  return (
    <div>
      <h2 className="page-title">Expenses</h2>
      <div className="card" style={{ marginBottom: '1rem', maxWidth: 480 }}>
        <form onSubmit={add} className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
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
          <button className="btn btn-primary">Add</button>
        </form>
      </div>
      <div className="card">
        {expenses.map((e) => (
          <div key={e._id} className="cart-item">
            <span>
              {e.desc} ({e.date})
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
