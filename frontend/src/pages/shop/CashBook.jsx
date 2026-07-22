import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function CashBook() {
  const [entries, setEntries] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [openingCashSet, setOpeningCashSet] = useState(true);
  const [openingCash, setOpeningCash] = useState(0);
  const [action, setAction] = useState('in');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const { data } = await api.get('/accounts/cash');
    setEntries(data.entries || []);
    setCashBalance(data.cashBalance || 0);
    setOpeningCashSet(Boolean(data.openingCashSet));
    setOpeningCash(data.openingCash || 0);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load cash book'));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!String(note || '').trim() && openingCashSet) {
      setError('Reason / note is required');
      return;
    }
    const confirmMsg = !openingCashSet
      ? `Set opening cash to ${amount}?`
      : action === 'in'
        ? `Record cash in of ${amount}?`
        : `Record cash out of ${amount}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      if (!openingCashSet) {
        await api.post('/accounts/cash', {
          action: 'set_opening',
          amount: Number(amount) || 0,
          note: note || 'Opening cash',
        });
        setMessage('Opening cash set');
      } else {
        await api.post('/accounts/cash', {
          action,
          amount: Number(amount) || 0,
          note,
        });
        setMessage(action === 'in' ? 'Cash in recorded' : 'Cash out recorded');
      }
      setAmount('');
      setNote('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Cash book</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Balances from Phase A go-live. Historical sales are not rewritten.
          </p>
        </div>
        <div className="card stat" style={{ minWidth: 160, margin: 0 }}>
          <h6>Cash balance</h6>
          <h2 style={{ fontSize: '1.2rem' }}>{money(cashBalance)}</h2>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card" style={{ marginBottom: '1rem', maxWidth: 560 }}>
        <form onSubmit={submit} className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {!openingCashSet ? (
            <div className="field" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
              <label>Set opening cash (once)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="field" style={{ width: 120, marginBottom: 0 }}>
                <label>Type</label>
                <select value={action} onChange={(e) => setAction(e.target.value)}>
                  <option value="in">Cash in</option>
                  <option value="out">Cash out</option>
                </select>
              </div>
              <div className="field" style={{ width: 140, marginBottom: 0 }}>
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
            </>
          )}
          <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
            <label>Reason / note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Required"
              required={openingCashSet}
            />
          </div>
          <button className="btn btn-primary">{openingCashSet ? 'Save' : 'Set opening'}</button>
        </form>
        {openingCashSet && (
          <p className="page-sub" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
            Opening cash: {money(openingCash)}
          </p>
        )}
      </div>

      <div className="card table-wrap">
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
            {!entries.length && (
              <tr>
                <td colSpan={4} className="empty">
                  No cash entries yet
                </td>
              </tr>
            )}
            {entries.map((e) => (
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
    </div>
  );
}
