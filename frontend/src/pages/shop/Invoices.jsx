import { useEffect, useState } from 'react';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  THERMAL_SIZES,
  getStoredPaperSize,
  openThermalReceipt,
  setStoredPaperSize,
} from '../../utils/thermalReceipt';

export default function Invoices() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [paperSize, setPaperSize] = useState(getStoredPaperSize);

  useEffect(() => {
    api.get('/sales', { params: { limit: 100 } }).then((res) => setSales(res.data.sales || []));
  }, []);

  const shopName = user?.shop?.name || 'Shop';

  function printThermal(sale, autoPrint = true) {
    openThermalReceipt({
      shopName,
      sale,
      total: sale.total,
      invoice: sale.invoice,
      paper: paperSize,
      autoPrint,
    });
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          Invoices
        </h2>
        <div className="field" style={{ marginBottom: 0, minWidth: 180 }}>
          <label>Thermal paper</label>
          <select
            value={paperSize}
            onChange={(e) => {
              setPaperSize(e.target.value);
              setStoredPaperSize(e.target.value);
            }}
          >
            {Object.values(THERMAL_SIZES).map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Source</th>
              <th>Total</th>
              <th>Date</th>
              <th>Payment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id}>
                <td>{s.invoice}</td>
                <td>{s.customerName}</td>
                <td>{s.source}</td>
                <td>{money(s.total)}</td>
                <td>{s.date}</td>
                <td>{s.payment}</td>
                <td className="row">
                  <button className="btn btn-outline btn-sm" onClick={() => printThermal(s, false)}>
                    Preview
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => printThermal(s, true)}>
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
