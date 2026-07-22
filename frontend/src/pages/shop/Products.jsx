import { useEffect, useRef, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  name: '',
  brand: '',
  model: '',
  category: 'General',
  subcategory: '',
  sku: '',
  qty: 10,
  buyPrice: 2000,
  sellPrice: 3500,
  wholesalePrice: 0,
  dealerPrice: 0,
  vipPrice: 0,
  offerPrice: 0,
  minPrice: 0,
  reorderLevel: 5,
  maxStock: 0,
  batchNumber: '',
  expiryDate: '',
  barcode: '',
  imageUrl: '',
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
      ...emptyForm,
      ...p,
      id: p._id,
      expiryDate: p.expiryDate || '',
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

  async function duplicate(id) {
    try {
      await api.post(`/products/${id}/duplicate`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Duplicate failed');
    }
  }

  function exportCsv() {
    const lines = [
      'Name,Brand,Category,Barcode,Qty,Buy,Sell,Wholesale,Dealer,VIP',
      ...products.map(
        (p) =>
          `"${p.name}","${p.brand || ''}","${p.category || ''}","${p.barcode || ''}",${p.qty},${p.buyPrice},${p.sellPrice},${p.wholesalePrice || 0},${p.dealerPrice || 0},${p.vipPrice || 0}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <button className="btn btn-outline" onClick={exportCsv} type="button">
          Export CSV
        </button>
        <button className="btn btn-primary" onClick={openCreate} disabled={atLimit}>
          + Add product
        </button>
      </div>

      <div className="field" style={{ maxWidth: 360, marginBottom: '0.75rem' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, brand, barcode, SKU"
        />
      </div>

      {error && !modal && <div className="error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>Name</th>
              <th>Category</th>
              <th>Barcode</th>
              <th>Qty</th>
              <th>Retail</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const reorder = p.reorderLevel ?? 5;
              return (
                <tr key={p._id}>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.brand ? <div className="page-sub" style={{ margin: 0 }}>{p.brand}</div> : null}
                  </td>
                  <td>
                    {p.category}
                    {p.subcategory ? ` / ${p.subcategory}` : ''}
                  </td>
                  <td>
                    <code>{p.barcode || '—'}</code>
                  </td>
                  <td>{p.qty}</td>
                  <td>{money(p.sellPrice)}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.qty === 0 ? 'danger' : p.qty <= reorder ? 'warn' : ''
                      }`}
                    >
                      {p.qty === 0 ? 'Out' : p.qty <= reorder ? 'Low' : 'OK'}
                    </span>
                  </td>
                  <td className="row">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => duplicate(p._id)}>
                      Duplicate
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => !saving && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(720px, 100%)' }}>
            <h3>{modal === 'create' ? 'Add product' : 'Edit product'}</h3>
            <form onSubmit={save}>
              <div className="grid grid-2">
                {['name', 'brand', 'model', 'category', 'subcategory', 'sku', 'barcode', 'imageUrl'].map(
                  (key) => (
                    <div className="field" key={key}>
                      <label>
                        {key === 'imageUrl'
                          ? 'Image URL'
                          : key === 'barcode'
                            ? 'Barcode'
                            : key}
                      </label>
                      <input
                        value={form[key] || ''}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        required={key === 'name'}
                      />
                    </div>
                  )
                )}
                {[
                  'qty',
                  'buyPrice',
                  'sellPrice',
                  'wholesalePrice',
                  'dealerPrice',
                  'vipPrice',
                  'offerPrice',
                  'minPrice',
                  'reorderLevel',
                  'maxStock',
                ].map((key) => (
                  <div className="field" key={key}>
                    <label>{key}</label>
                    <input
                      type="number"
                      min="0"
                      value={form[key] ?? 0}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="field">
                  <label>Batch number</label>
                  <input
                    value={form.batchNumber || ''}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Expiry date</label>
                  <input
                    type="date"
                    value={form.expiryDate || ''}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={form.desc || ''}
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
