import { useEffect, useState } from 'react';
import api, { money } from '../../api';

const emptyForm = {
  name: '',
  brand: 'MS Techno',
  category: 'Oud',
  qty: 10,
  buyPrice: 2000,
  sellPrice: 3500,
  barcode: '',
  desc: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/products');
    setProducts(data.products || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  function openCreate() {
    setForm({ ...emptyForm, barcode: `SKU${Date.now()}` });
    setModal('create');
  }

  function openEdit(p) {
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
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          Products
        </h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add product
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Profit</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>{p.brand}</td>
                <td>{p.category}</td>
                <td>{p.qty}</td>
                <td>{money(p.sellPrice)}</td>
                <td>{money(p.sellPrice - p.buyPrice)}</td>
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
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Add product' : 'Edit product'}</h3>
            <form onSubmit={save}>
              <div className="grid grid-2">
                {['name', 'brand', 'category', 'barcode'].map((key) => (
                  <div className="field" key={key}>
                    <label>{key}</label>
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
              <div className="row">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>
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
