import { useEffect, useState } from 'react';
import api, { money } from '../../api';

const BANK_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'EasyPaisa' },
  { value: 'card', label: 'Card' },
];

export default function Banks() {
  const [banks, setBanks] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [selectedId, setSelectedId] = useState('');
  const [transferAction, setTransferAction] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const { data } = await api.get('/accounts/banks');
    const list = data.banks || [];
    setBanks(list);
    if (!selectedId && list[0]) setSelectedId(list[0]._id);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load banks'));
  }, []);

  async function addBank(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/accounts/banks', {
        name,
        type,
        openingBalance: Number(openingBalance) || 0,
      });
      setName('');
      setOpeningBalance('0');
      setMessage('Bank account added');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  }

  async function transfer(e) {
    e.preventDefault();
    if (!selectedId) return;
    setError('');
    setMessage('');
    try {
      await api.post(`/accounts/banks/${selectedId}/transfer`, {
        action: transferAction,
        amount: Number(amount) || 0,
        note,
      });
      setAmount('');
      setNote('');
      setMessage(transferAction === 'deposit' ? 'Deposit recorded' : 'Withdrawal recorded');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    }
  }

  const total = banks.reduce((s, b) => s + (b.balance || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Banks</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Bank, JazzCash, EasyPaisa — deposit from cash or withdraw to cash.
          </p>
        </div>
        <div className="card stat" style={{ minWidth: 160, margin: 0 }}>
          <h6>Total bank</h6>
          <h2 style={{ fontSize: '1.2rem' }}>{money(total)}</h2>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Add account</h3>
          <form onSubmit={addBank}>
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {BANK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Opening balance</label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </div>
            <button className="btn btn-primary">Add</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Deposit / withdraw</h3>
          <form onSubmit={transfer}>
            <div className="field">
              <label>Account</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({money(b.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Action</label>
              <select value={transferAction} onChange={(e) => setTransferAction(e.target.value)}>
                <option value="deposit">Deposit (cash → bank)</option>
                <option value="withdraw">Withdraw (bank → cash)</option>
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
              <label>Note</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={!banks.length}>
              Save
            </button>
          </form>
        </div>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.type}</td>
                <td>{money(b.balance)}</td>
                <td>{b.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
