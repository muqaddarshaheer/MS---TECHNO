// AllShops.jsx
import React, { useState, useEffect } from 'react';

const AllShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/admin/shops');
      const data = await response.json();
      setShops(data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (shopId) => {
    if (window.confirm('Are you sure you want to renew this shop?')) {
      try {
        const response = await fetch(`/api/admin/shops/${shopId}/renew`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          alert('Shop renewed successfully!');
          fetchShops();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleDelete = async (shopId) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        const response = await fetch(`/api/admin/shops/${shopId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          alert('Shop deleted successfully!');
          fetchShops();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleView = (shopId) => {
    window.location.href = `/admin/shops/${shopId}`;
  };

  const filteredShops = shops.filter(shop => {
    const matchSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        shop.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        shop.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = filterPlan === 'all' || shop.plan === filterPlan;
    const matchStatus = filterStatus === 'all' || shop.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.status === 'active').length;
  const expiredShops = shops.filter(s => s.status === 'expired').length;
  const suspendedShops = shops.filter(s => s.status === 'suspended').length;

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="all-shops-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .all-shops-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f8faf8;
          min-height: 100vh;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          font-size: 1.2rem;
          color: #16A34A;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111111;
          margin: 0;
        }

        .btn-add-shop {
          background: #16A34A;
          color: #ffffff;
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .btn-add-shop:hover {
          background: #15803d;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(22, 163, 74, 0.25);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          border: 1px solid #e8f0e8;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.04);
        }

        .stat-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: #111111;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #111111;
          opacity: 0.6;
        }

        .stat-card.total .stat-number { color: #16A34A; }
        .stat-card.active .stat-number { color: #16A34A; }
        .stat-card.expired .stat-number { color: #dc3545; }
        .stat-card.suspended .stat-number { color: #ffc107; }

        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          background: #ffffff;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: 1px solid #e8f0e8;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-box input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border: 2px solid #e8f0e8;
          border-radius: 50px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: #f9fcf9;
          color: #111111;
        }

        .search-box input:focus {
          outline: none;
          border-color: #16A34A;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.08);
          background: #ffffff;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.4;
        }

        .filter-group {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
        }

        .filter-group select {
          padding: 0.6rem 1.5rem;
          border: 2px solid #e8f0e8;
          border-radius: 50px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #f9fcf9;
          color: #111111;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #16A34A;
        }

        .table-container {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e8f0e8;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        }

        .shops-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .shops-table thead {
          background: #f9fcf9;
        }

        .shops-table th {
          padding: 1rem 1.2rem;
          text-align: left;
          font-weight: 600;
          color: #111111;
          border-bottom: 2px solid #e8f0e8;
          white-space: nowrap;
        }

        .shops-table td {
          padding: 1rem 1.2rem;
          border-bottom: 1px solid #e8f0e8;
          color: #111111;
        }

        .shops-table tbody tr:hover {
          background: #f9fcf9;
        }

        .shops-table .expired-row {
          background: #fff5f5;
        }

        .shops-table .expired-row:hover {
          background: #ffebeb;
        }

        .plan-badge {
          display: inline-block;
          padding: 0.2rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .plan-badge.basic {
          background: #e8f0e8;
          color: #111111;
        }

        .plan-badge.premium {
          background: #DCFCE7;
          color: #16A34A;
        }

        .plan-badge.enterprise {
          background: #cce5ff;
          color: #004085;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: #DCFCE7;
          color: #16A34A;
        }

        .status-badge.expired {
          background: #fcc;
          color: #dc3545;
        }

        .status-badge.suspended {
          background: #fff3cd;
          color: #856404;
        }

        .expired-date {
          color: #dc3545 !important;
          font-weight: 600;
        }

        .actions-cell {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .actions-cell button {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-view {
          background: #e8f0e8;
          color: #111111;
        }

        .btn-view:hover {
          background: #16A34A;
          color: #ffffff;
          transform: scale(1.05);
        }

        .btn-renew {
          background: #DCFCE7;
          color: #16A34A;
        }

        .btn-renew:hover {
          background: #16A34A;
          color: #ffffff;
          transform: scale(1.05);
        }

        .btn-delete {
          background: #fcc;
          color: #dc3545;
        }

        .btn-delete:hover {
          background: #dc3545;
          color: #ffffff;
          transform: scale(1.05);
        }

        .no-shops {
          padding: 3rem;
          text-align: center;
          color: #111111;
          opacity: 0.6;
        }

        .table-footer {
          padding: 1rem 1.5rem;
          background: #f9fcf9;
          border-top: 1px solid #e8f0e8;
          color: #111111;
          opacity: 0.6;
          font-size: 0.9rem;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .all-shops-container {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-add-shop {
            width: 100%;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-number {
            font-size: 1.4rem;
          }

          .stat-icon {
            font-size: 2rem;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
          }

          .search-box {
            min-width: 100%;
          }

          .filter-group {
            flex-direction: column;
          }

          .filter-group select {
            width: 100%;
          }

          .shops-table {
            font-size: 0.8rem;
          }

          .shops-table th,
          .shops-table td {
            padding: 0.6rem 0.8rem;
          }

          .actions-cell {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .actions-cell button {
            width: 28px;
            height: 28px;
            font-size: 0.8rem;
          }

          .plan-badge,
          .status-badge {
            font-size: 0.7rem;
            padding: 0.15rem 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .shops-table {
            font-size: 0.7rem;
          }

          .shops-table th,
          .shops-table td {
            padding: 0.4rem 0.5rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .stat-number {
            font-size: 1.2rem;
          }

          .stat-icon {
            font-size: 1.5rem;
          }

          .actions-cell button {
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
          }
        }
      `}</style>

      <div className="page-header">
        <h1>All Shops</h1>
        <button className="btn-add-shop" onClick={() => window.location.href = '/admin/shops/add'}>
          + Add New Shop
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <span className="stat-number">{totalShops}</span>
            <span className="stat-label">Total Shops</span>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">{activeShops}</span>
            <span className="stat-label">Active Shops</span>
          </div>
        </div>
        <div className="stat-card expired">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-number">{expiredShops}</span>
            <span className="stat-label">Expired Shops</span>
          </div>
        </div>
        <div className="stat-card suspended">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <span className="stat-number">{suspendedShops}</span>
            <span className="stat-label">Suspended Shops</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, owner or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-group">
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="all">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {filteredShops.length === 0 ? (
          <div className="no-shops">
            <p>No shops found matching your criteria.</p>
          </div>
        ) : (
          <table className="shops-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Shop Name</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop, index) => (
                <tr key={shop.id} className={shop.status === 'expired' ? 'expired-row' : ''}>
                  <td>{index + 1}</td>
                  <td><strong>{shop.name}</strong></td>
                  <td>{shop.owner}</td>
                  <td>{shop.email}</td>
                  <td>{shop.phone}</td>
                  <td>
                    <span className={`plan-badge ${shop.plan.toLowerCase()}`}>
                      {shop.plan}
                    </span>
                  </td>
                  <td className={new Date(shop.expiry_date) < new Date() ? 'expired-date' : ''}>
                    {new Date(shop.expiry_date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`status-badge ${shop.status}`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-view" onClick={() => handleView(shop.id)}>
                      👁️
                    </button>
                    {shop.status === 'expired' && (
                      <button className="btn-renew" onClick={() => handleRenew(shop.id)}>
                        🔄
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(shop.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer">
        <span>Showing {filteredShops.length} of {shops.length} shops</span>
      </div>
    </div>
  );
};

export default AllShops;