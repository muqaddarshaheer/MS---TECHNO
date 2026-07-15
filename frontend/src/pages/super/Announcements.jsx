import { useEffect, useState } from 'react';
import api from '../../api';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [targetShop, setTargetShop] = useState('');

  async function load() {
    const [a, s] = await Promise.all([api.get('/announcements'), api.get('/shops')]);
    setItems(a.data.announcements || []);
    setShops(s.data.shops || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    await api.post('/announcements', {
      title,
      msg,
      targetShop: targetShop || null,
    });
    setTitle('');
    setMsg('');
    setTargetShop('');
    await load();
  }

  async function remove(id) {
    await api.delete(`/announcements/${id}`);
    await load();
  }

  return (
    <div>
      <h2 className="page-title">Announcements</h2>
      <div className="card" style={{ marginBottom: '1rem', maxWidth: 560 }}>
        <form onSubmit={create}>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} required />
          </div>
          <div className="field">
            <label>Target</label>
            <select value={targetShop} onChange={(e) => setTargetShop(e.target.value)}>
              <option value="">All shops</option>
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary">Send</button>
        </form>
      </div>
      {items.map((a) => (
        <div className="announce" key={a._id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{a.title}</strong>
            <button className="btn btn-danger btn-sm" onClick={() => remove(a._id)}>
              Delete
            </button>
          </div>
          <p style={{ marginTop: '0.35rem' }}>{a.msg}</p>
          <small style={{ color: 'var(--muted)' }}>{a.date}</small>
        </div>
      ))}
    </div>
  );
}
