// AllShops.jsx
import React, { useState, useEffect } from 'react';
import './AllShops.css';

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

  // Filter shops
  const filteredShops = shops.filter(shop => {
    const matchSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        shop.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        shop.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = filterPlan === 'all' || shop.plan === filterPlan;
    const matchStatus = filterStatus === 'all' || shop.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  // Calculate statistics
  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.status === 'active').length;
  const expiredShops = shops.filter(s => s.status === 'expired').length;
  const suspendedShops = shops.filter(s => s.status === 'suspended').length;

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#16A34A';
      case 'expired': return '#dc3545';
      case 'suspended': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="all-shops-container">
      <div className="page-header">
        <h1>All Shops</h1>
        <button className="btn-add-shop" onClick={() => window.location.href = '/admin/shops/add'}>
          + Add New Shop
        </button>
      </div>

      {/* Statistics Cards */}
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

      {/* Filters */}
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

      {/* Shops Table */}
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
                    <span 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(shop.status) + '20',
                        color: getStatusColor(shop.status),
                        border: '1px solid ' + getStatusColor(shop.status) + '40'
                      }}
                    >
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

      {/* Footer */}
      <div className="table-footer">
        <span>Showing {filteredShops.length} of {shops.length} shops</span>
      </div>
    </div>
  );
};

export default AllShops;