import { useEffect, useState } from 'react';
import api from '../../api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ customer: '', rating: 5, review: '' });

  async function load() {
    const { data } = await api.get('/reviews');
    setReviews(data.reviews || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addReview(e) {
    e.preventDefault();
    await api.post('/reviews', form);
    setForm({ customer: '', rating: 5, review: '' });
    await load();
  }

  async function reply(id) {
    const text = prompt('Your reply');
    if (!text) return;
    await api.post(`/reviews/${id}/reply`, { reply: text });
    await load();
  }

  return (
    <div>
      <h2 className="page-title">Reviews</h2>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={addReview} className="grid grid-2">
          <div className="field">
            <label>Customer</label>
            <input
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Review</label>
            <textarea
              rows={2}
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
            />
          </div>
          <button className="btn btn-primary">Add review</button>
        </form>
      </div>
      <div className="card">
        {reviews.map((r) => (
          <div key={r._id} style={{ borderBottom: '1px solid var(--line)', padding: '0.75rem 0' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>
                {r.customer} · {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </strong>
              <span className="badge">{r.status}</span>
            </div>
            <p style={{ color: 'var(--muted)', margin: '0.35rem 0' }}>{r.review}</p>
            {r.reply ? (
              <p style={{ color: 'var(--ok)' }}>
                <strong>Reply:</strong> {r.reply}
              </p>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => reply(r._id)}>
                Reply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
