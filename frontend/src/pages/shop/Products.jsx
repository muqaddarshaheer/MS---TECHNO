import { useEffect, useRef, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  name: '',
  brand: '',
  category: 'Oud',
  qty: 10,
  buyPrice: 2000,
  sellPrice: 3500,
  barcode: '',
  desc: '',
};

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const savingLock = useRef(false);

  const maxProducts = user?.shop?.plan?.maxProducts;
  const unlimited = user?.shop?.plan?.unlimitedProducts || maxProducts == null;
  const atLimit = !unlimited && products.length >= maxProducts;

  async function load() {
    const { data } = await api.get('/products', { params: { limit: 100, q: q || undefined } });
    setProducts(data.products || []);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  function openCreate() {
    if (atLimit) {
      setError('Product limit reached. Upgrade to Premium for unlimited products.');
      return;
    }
    setError('');
    setForm({ ...emptyForm, barcode: `SKU${Date.now()}` });
    setModal('create');
  }

  function openEdit(p) {
    setError('');
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      qty: p.qty,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      barcode: p.barcode,
      desc: p.desc,
      id: p._id,
    });
    setModal('edit');
  }

  async function save(e) {
    e.preventDefault();
    if (savingLock.current) return;
    savingLock.current = true;
    setSaving(true);
    setError('');
    try {
      if (modal === 'create') {
        await api.post('/products', form);
      } else {
        await api.put(`/products/${form.id}`, form);
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    await load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title" style={{ marginBottom: 0 }}>
            Products
          </h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {unlimited
              ? `${products.length} products · Unlimited plan`
              : `${products.length} / ${maxProducts} products`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={atLimit}>
          + Add product
        </button>
      </div>

      {atLimit && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <strong>Product limit reached</strong>
          <p className="page-sub">
            Basic includes 100 products. Upgrade to Premium for unlimited catalog and POS.
          </p>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Ask MS Techno Super Admin to upgrade your package.
          </p>
        </div>
      )}

      <div className="field" style={{ maxWidth: 360, marginBottom: '0.75rem' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, brand, or barcode"
        />
      </div>

      {error && !modal && <div className="error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Brand</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>
                  <code>{p.barcode || '—'}</code>
                </td>
                <td>{p.brand || '—'}</td>
                <td>{p.qty}</td>
                <td>{money(p.sellPrice)}</td>
                <td>
                  <span className={`badge ${p.qty === 0 ? 'danger' : p.qty <= 5 ? 'warn' : ''}`}>
                    {p.qty === 0 ? 'Out of stock' : p.qty <= 5 ? 'Low' : 'In stock'}
                  </span>
                </td>
                <td className="row">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => !saving && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Add product' : 'Edit product'}</h3>
            <form onSubmit={save}>
              <div className="grid grid-2">
                {['name', 'brand', 'category', 'barcode'].map((key) => (
                  <div className="field" key={key}>
                    <label>{key === 'barcode' ? 'Barcode (scanner OK)' : key}</label>
                    <input
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required={key === 'name'}
                    />
                  </div>
                ))}
                {['qty', 'buyPrice', 'sellPrice'].map((key) => (
                  <div className="field" key={key}>
                    <label>{key}</label>
                    <input
                      type="number"
                      min="0"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div className="row">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={saving}
                  onClick={() => setModal(null)}
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
