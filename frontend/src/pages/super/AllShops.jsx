import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function plusMonths(dateStr, months) {
  const d = new Date(dateStr || todayStr());
  d.setMonth(d.getMonth() + Number(months || 12));
  return d.toISOString().slice(0, 10);
}

function blankForm() {
  const start = todayStr();
  return {
    name: '',
    owner: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    package: 'Basic',
    payment: 'pending',
    planStart: start,
    durationMonths: 12,
    expiry: plusMonths(start, 12),
    paymentDueDate: start,
    restrictOnPaymentOverdue: true,
    openTime: '09:00',
    closeTime: '22:00',
    status: 'active',
  };
}

function statusBadge(status) {
  if (status === 'active') return '';
  if (status === 'expired' || status === 'payment_overdue') return 'danger';
  return 'warn';
}

function statusLabel(status) {
  if (status === 'payment_overdue') return 'Payment overdue';
  return status;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function AllShops() {
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState(null);
  const [resetPw, setResetPw] = useState({ shopId: '', newPassword: '' });
  const [credentials, setCredentials] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shops', {
        params: {
          page,
          limit,
          q: q || undefined,
          status: statusFilter || undefined,
          package: packageFilter || undefined,
        },
      });
      setShops(data.shops || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, q, statusFilter, packageFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 200);
    return () => clearTimeout(t);
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const createPreviewDuration = useMemo(() => {
    const start = new Date(form.planStart);
    const end = new Date(form.expiry);
    const days = Math.max(0, Math.round((end - start) / 86400000));
    return `${form.durationMonths} month(s) · ${days} days`;
  }, [form.planStart, form.expiry, form.durationMonths]);

  function openCreate() {
    setError('');
    setEditId(null);
    setForm(blankForm());
    setModal('create');
  }

  function openEdit(shop) {
    setError('');
    setEditId(shop._id);
    setForm({
      name: shop.name || '',
      owner: shop.owner || '',
      username: shop.username || '',
      password: '',
      phone: shop.phone || '',
      email: shop.email || '',
      package: shop.package || 'Basic',
      payment: shop.payment || 'pending',
      planStart: String(shop.planStart || shop.createdAt).slice(0, 10),
      durationMonths: shop.durationMonths || 12,
      expiry: String(shop.expiry).slice(0, 10),
      paymentDueDate: shop.paymentDueDate ? String(shop.paymentDueDate).slice(0, 10) : '',
      restrictOnPaymentOverdue: shop.restrictOnPaymentOverdue !== false,
      openTime: shop.openTime || '09:00',
      closeTime: shop.closeTime || '22:00',
      status: shop.status || 'active',
    });
    setModal('edit');
  }

  function onPlanStartChange(value) {
    setForm((f) => ({
      ...f,
      planStart: value,
      expiry: plusMonths(value, f.durationMonths),
      paymentDueDate: f.paymentDueDate || value,
    }));
  }

  function onDurationChange(value) {
    const months = Number(value) || 12;
    setForm((f) => ({
      ...f,
      durationMonths: months,
      expiry: plusMonths(f.planStart, months),
    }));
  }

  async function createShop(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/shops', form);
      setCredentials(data.credentials || null);
      setMessage('Shop created — copy login link and password once');
      setModal(null);
      setForm(blankForm());
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/shops/${editId}`, {
        name: form.name,
        owner: form.owner,
        phone: form.phone,
        email: form.email,
        package: form.package,
        payment: form.payment,
        planStart: form.planStart,
        durationMonths: form.durationMonths,
        expiry: form.expiry,
        paymentDueDate: form.paymentDueDate || null,
        restrictOnPaymentOverdue: form.restrictOnPaymentOverdue,
        status: form.status,
        openTime: form.openTime,
        closeTime: form.closeTime,
      });
      setMessage('Shop plan updated');
      setModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  async function setStatus(id, status) {
    await api.patch(`/shops/${id}/status`, { status });
    await load();
  }

  async function renew(id, payload) {
    await api.post(`/shops/${id}/renew`, payload);
    await load();
  }

  async function toggleRestrict(shop, enabled) {
    await api.patch(`/shops/${shop._id}/payment-restriction`, {
      restrictOnPaymentOverdue: enabled,
    });
    setMessage(
      enabled ? `Auto-restrict enabled for ${shop.name}` : `Auto-restrict disabled for ${shop.name}`
    );
    await load();
  }

  async function restrictIfOverdue(shop) {
    const { data } = await api.patch(`/shops/${shop._id}/payment-restriction`, {
      restrictOnPaymentOverdue: true,
      applyRestrictionNow: true,
    });
    setMessage(data.message || 'Restriction applied');
    await load();
  }

  async function markPaid(shop) {
    await api.patch(`/shops/${shop._id}/payment-restriction`, { payment: 'paid' });
    if (shop.status === 'blocked' && shop.paymentOverdue) {
      await api.patch(`/shops/${shop._id}/status`, { status: 'active' });
    }
    setMessage(`${shop.name} marked as paid`);
    await load();
  }

  async function remove(id) {
    if (!confirm('Delete shop and all related data?')) return;
    await api.delete(`/shops/${id}`);
    await load();
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/reset-shop-password', resetPw);
      setCredentials({
        username: data.username,
        password: resetPw.newPassword,
        loginLink: data.loginLink,
        note: 'New password — share once.',
      });
      setMessage(`Password reset for ${data.username}`);
      setResetPw({ shopId: '', newPassword: '' });
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  }

  const planForm = (
    <div className="grid grid-2">
      {!editId &&
        [
          ['name', 'Shop name'],
          ['owner', 'Owner'],
          ['username', 'Login username'],
          ['password', 'Password'],
          ['phone', 'Phone'],
          ['email', 'Email'],
        ].map(([key, label]) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <input
              type={key === 'password' ? 'password' : 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={['name', 'owner', 'username', 'password'].includes(key)}
            />
          </div>
        ))}
      {editId && (
        <>
          <div className="field">
            <label>Shop name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Owner</label>
            <input
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              required
            />
          </div>
        </>
      )}
      <div className="field">
        <label>Package</label>
        <select value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })}>
          {['Basic', 'Premium', 'Enterprise'].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Payment status</label>
        <select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="field">
        <label>Plan start date</label>
        <input
          type="date"
          value={form.planStart}
          onChange={(e) => onPlanStartChange(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>Duration (months)</label>
        <select value={form.durationMonths} onChange={(e) => onDurationChange(e.target.value)}>
          {[1, 3, 6, 12, 24].map((m) => (
            <option key={m} value={m}>
              {m} month{m > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Package end date</label>
        <input
          type="date"
          value={form.expiry}
          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Payment due date</label>
        <input
          type="date"
          value={form.paymentDueDate}
          onChange={(e) => setForm({ ...form, paymentDueDate: e.target.value })}
        />
      </div>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={form.restrictOnPaymentOverdue}
            onChange={(e) => setForm({ ...form, restrictOnPaymentOverdue: e.target.checked })}
          />
          Restrict shop access if payment is past due date
        </label>
        <small style={{ color: 'var(--muted)' }}>Duration preview: {createPreviewDuration}</small>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          All Shops
        </h2>
        <button className="btn btn-gold" onClick={openCreate}>
          + Create shop
        </button>
      </div>
      {message && <div className="success">{message}</div>}
      {error && !modal && <div className="error">{error}</div>}

      {credentials && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <strong>Share once — credentials</strong>
          <p>
            Username: <code>{credentials.username}</code>
          </p>
          {credentials.password && (
            <p>
              Password: <code>{credentials.password}</code>
            </p>
          )}
          {credentials.loginLink && (
            <p>
              Login link: <code>{credentials.loginLink}</code>
            </p>
          )}
          <div className="row">
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={async () => {
                const ok = await copyText(credentials.loginLink || '');
                setMessage(ok ? 'Login link copied' : 'Could not copy');
              }}
            >
              Copy shop link
            </button>
            {credentials.password && (
              <button
                className="btn btn-outline btn-sm"
                type="button"
                onClick={async () => {
                  const ok = await copyText(
                    `Username: ${credentials.username}\nPassword: ${credentials.password}\nLink: ${credentials.loginLink}`
                  );
                  setMessage(ok ? 'Credentials copied' : 'Could not copy');
                }}
              >
                Copy all
              </button>
            )}
            <button className="btn btn-outline btn-sm" type="button" onClick={() => setCredentials(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="row" style={{ marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        <input
          style={{ minWidth: 200, flex: 1 }}
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search shops..."
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={packageFilter}
          onChange={(e) => {
            setPage(1);
            setPackageFilter(e.target.value);
          }}
        >
          <option value="">All packages</option>
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {loading && <p className="empty">Loading...</p>}

      <div className="grid grid-2">
        {shops.map((s) => (
          <div className="card" key={s._id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--display)' }}>{s.name}</h3>
                <p className="page-sub" style={{ marginBottom: 0 }}>
                  {s.owner} · @{s.username} · {s.package}
                  {s.slug ? ` · ${s.slug}` : ''}
                </p>
              </div>
              <span className={`badge ${statusBadge(s.computedStatus)}`}>
                {statusLabel(s.computedStatus)}
              </span>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.86rem', color: 'var(--muted)' }}>
              <div>
                <strong style={{ color: 'var(--ink)' }}>Plan:</strong>{' '}
                {String(s.planStart || s.createdAt).slice(0, 10)} →{' '}
                {String(s.planEnd || s.expiry).slice(0, 10)} ({s.durationLabel})
              </div>
              <div>
                <strong style={{ color: 'var(--ink)' }}>Payment:</strong>{' '}
                <span className={`badge ${s.payment === 'paid' ? '' : 'warn'}`}>{s.payment}</span>
                {s.paymentOverdue && <span className="badge danger">Overdue</span>}
              </div>
              <div>
                <strong style={{ color: 'var(--ink)' }}>Products:</strong>{' '}
                {s.plan?.unlimitedProducts || s.plan?.maxProducts == null
                  ? 'Unlimited'
                  : `max ${s.plan.maxProducts}`}
                {s.plan?.hasPos ? ' · POS on' : ' · POS off'}
              </div>
            </div>

            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  const link = s.loginLink || `${window.location.origin}/login?u=${encodeURIComponent(s.username || '')}`;
                  const ok = await copyText(link);
                  setMessage(ok ? `Link copied for ${s.name}` : 'Copy failed');
                }}
              >
                Copy shop link
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>
                Edit plan
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setStatus(s._id, 'active')}>
                Activate
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setStatus(s._id, 'suspended')}>
                Suspend
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setStatus(s._id, 'blocked')}>
                Block
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => renew(s._id, { years: 1 })}>
                +1 year
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => toggleRestrict(s, !s.restrictOnPaymentOverdue)}
              >
                {s.restrictOnPaymentOverdue ? 'Disable auto-restrict' : 'Enable auto-restrict'}
              </button>
              {s.paymentOverdue && (
                <button className="btn btn-danger btn-sm" onClick={() => restrictIfOverdue(s)}>
                  Restrict overdue
                </button>
              )}
              {s.payment !== 'paid' && (
                <button className="btn btn-primary btn-sm" onClick={() => markPaid(s)}>
                  Mark paid
                </button>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setResetPw({ shopId: s._id, newPassword: '' });
                  setModal('reset');
                }}
              >
                Reset password
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => remove(s._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span className="page-sub" style={{ margin: 0 }}>
          Page {page} / {pages} · {total} shops
        </span>
        <button
          className="btn btn-outline btn-sm"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Create shop' : 'Edit plan & payment'}</h3>
            <form onSubmit={modal === 'create' ? createShop : saveEdit}>
              {planForm}
              {error && <div className="error">{error}</div>}
              <div className="row">
                <button className="btn btn-primary" type="submit">
                  {modal === 'create' ? 'Create shop' : 'Save changes'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'reset' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset shop password</h3>
            <form onSubmit={resetPassword}>
              <div className="field">
                <label>New password</label>
                <input
                  type="password"
                  value={resetPw.newPassword}
                  onChange={(e) => setResetPw({ ...resetPw, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div className="row">
                <button className="btn btn-primary" type="submit">
                  Reset
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setModal(null)}>
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
