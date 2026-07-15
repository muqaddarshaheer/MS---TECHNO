import { useEffect, useState } from 'react';
import api, { money } from '../../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    api.get('/customers').then((res) => setCustomers(res.data.customers || []));
  }, []);

  return (
    <div>
      <h2 className="page-title">Customers</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Source</th>
              <th>Orders</th>
              <th>Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>{c.source}</td>
                <td>{c.orders}</td>
                <td>{money(c.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
