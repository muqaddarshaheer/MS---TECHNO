// BillingSystem.jsx - Complete Working Solution
import React, { useState } from 'react';

const BillingSystem = () => {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [currentItem, setCurrentItem] = useState({
    name: '',
    quantity: 1,
    price: 0
  });
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Add item to bill
  const addItem = () => {
    if (currentItem.name && currentItem.quantity > 0 && currentItem.price > 0) {
      setItems([...items, {
        ...currentItem,
        total: currentItem.quantity * currentItem.price
      }]);
      setCurrentItem({ name: '', quantity: 1, price: 0 });
    }
  };

  // Remove item
  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Print bill - Direct black and white thermal print
  const printBill = () => {
    const printWindow = window.open('', '_blank');
    const billContent = generateBillHTML();
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = function() {
      printWindow.close();
    };
  };

  // Generate bill HTML for 80mm thermal printer - Black & White only
  const generateBillHTML = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            width: 80mm;
            margin: 0;
            padding: 6px 4px;
            background: white;
            color: black;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bill {
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
            color: black;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed black;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .header h1 {
            font-size: 20px;
            margin: 0;
            font-weight: bold;
            letter-spacing: 4px;
            color: black;
          }
          .header p {
            margin: 1px 0;
            font-size: 9px;
            color: black;
          }
          .divider {
            border-top: 1px dashed black;
            margin: 4px 0;
          }
          .customer-info {
            font-size: 10px;
            padding: 3px 0;
            color: black;
          }
          .customer-info p {
            margin: 1px 0;
            color: black;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            color: black;
          }
          .items-table th {
            text-align: left;
            font-size: 9px;
            border-bottom: 1px solid black;
            padding: 3px 0;
            color: black;
          }
          .items-table td {
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
            color: black;
          }
          .items-table .text-right {
            text-align: right;
          }
          .totals {
            margin-top: 6px;
            border-top: 2px solid black;
            padding-top: 6px;
            color: black;
          }
          .totals p {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 10px;
            color: black;
          }
          .totals .grand-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid black;
            padding-top: 4px;
            margin-top: 4px;
            color: black;
          }
          .grand-total p {
            font-size: 16px;
            color: black;
          }
          .footer {
            text-align: center;
            margin-top: 8px;
            border-top: 2px dashed black;
            padding-top: 6px;
            font-size: 9px;
            color: black;
          }
          .footer p {
            margin: 1px 0;
            color: black;
          }
          .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            font-size: 20px;
            margin: 6px 0;
            color: black;
          }
          @media print {
            body { margin: 0; padding: 3px; }
          }
        </style>
      </head>
      <body>
        <div class="bill">
          <!-- Header -->
          <div class="header">
            <h1>PROBILLING</h1>
            <p>123 Business Street, Karachi</p>
            <p>Tel: 021-1234567 | Shop: B-12</p>
            <p>NTN: 1234567-8 | GST: 123456789</p>
            <div class="divider"></div>
            <p style="font-size:9px;">
              ${formattedDate} ${formattedTime}
            </p>
          </div>

          <!-- Customer Info -->
          <div class="customer-info">
            <p><strong>Customer:</strong> ${customer.name || 'Walk-in Customer'}</p>
            ${customer.phone ? `<p><strong>Phone:</strong> ${customer.phone}</p>` : ''}
            ${customer.address ? `<p><strong>Address:</strong> ${customer.address}</p>` : ''}
            <p><strong>Bill #:</strong> ${Date.now().toString().slice(-8)}</p>
          </div>

          <div class="divider"></div>

          <!-- Items -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${item.price}</td>
                  <td class="text-right">${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <!-- Totals -->
          <div class="totals">
            <p>
              <span>Subtotal:</span>
              <span>${subtotal}</span>
            </p>
            ${taxRate > 0 ? `
              <p>
                <span>GST (${taxRate}%):</span>
                <span>${taxAmount}</span>
              </p>
            ` : ''}
            ${discount > 0 ? `
              <p>
                <span>Discount (${discount}%):</span>
                <span>-${discountAmount}</span>
              </p>
            ` : ''}
            <div class="grand-total">
              <p>
                <span>TOTAL:</span>
                <span>${grandTotal}</span>
              </p>
            </div>
            <p style="font-size:9px; margin-top:3px;">
              <strong>Payment:</strong> ${paymentMethod.toUpperCase()}
            </p>
          </div>

          <!-- Barcode -->
          <div class="barcode">
            ${String(Date.now()).slice(-8)}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>THANK YOU FOR SHOPPING!</strong></p>
            <p>Visit Again • We Value Your Business</p>
            <p style="font-size:8px;">Items: ${items.length} | Qty: ${items.reduce((sum, i) => sum + i.quantity, 0)}</p>
            <p style="font-size:8px; margin-top:3px;">
              Powered by ProBilling
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Check if bill is empty
  const isBillEmpty = items.length === 0;

  return (
    <div style={styles.billingSystem}>
      <div style={styles.billingContainer}>
        {/* Left Panel - Bill Input */}
        <div style={styles.billInputPanel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>🧾 New Bill</h2>
            <span style={styles.billNumber}>#BILL-{Date.now().toString().slice(-6)}</span>
          </div>

          {/* Customer Section */}
          <div style={styles.customerSection}>
            <h3 style={styles.sectionTitle}>Customer Details</h3>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer Name</label>
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  style={styles.input}
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="text"
                  placeholder="03XX-XXXXXXX"
                  style={styles.input}
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input
                type="text"
                placeholder="Customer Address"
                style={styles.input}
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
              />
            </div>
          </div>

          {/* Add Items */}
          <div style={styles.itemsSection}>
            <h3 style={styles.sectionTitle}>Add Items</h3>
            <div style={styles.formRow}>
              <div style={{...styles.formGroup, flex: 2 }}>
                <label style={styles.label}>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  style={styles.input}
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Qty</label>
                <input
                  type="number"
                  min="1"
                  style={styles.input}
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price</label>
                <input
                  type="number"
                  min="0"
                  style={styles.input}
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <button style={styles.btnAdd} onClick={addItem}>
              + Add Item
            </button>
          </div>

          {/* Items List */}
          <div style={styles.itemsList}>
            {items.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📋</span>
                <p style={styles.emptyText}>No items added yet</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <div style={styles.itemInfo}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemDetails}>
                      {item.quantity} × {item.price}
                    </span>
                  </div>
                  <div style={styles.itemActions}>
                    <span style={styles.itemTotal}>{item.total}</span>
                    <button style={styles.btnRemove} onClick={() => removeItem(index)}>×</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary */}
          <div style={styles.billSummary}>
            <div style={styles.summaryRow}>
              <span>Items:</span>
              <span>{items.length}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{subtotal}</span>
            </div>
            <div style={{...styles.formRow, ...styles.summaryRow}}>
              <div style={{...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>GST %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={styles.inputSmall}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={styles.inputSmall}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div style={{...styles.summaryRow, ...styles.grandTotal}}>
              <span style={styles.grandTotalLabel}>Grand Total:</span>
              <span style={styles.grandTotalValue}>{grandTotal}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Method</label>
              <select
                style={styles.input}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button
              style={{...styles.btnPrint, opacity: isBillEmpty ? 0.5 : 1, cursor: isBillEmpty ? 'not-allowed' : 'pointer'}}
              onClick={printBill}
              disabled={isBillEmpty}
            >
              🖨️ Print Bill
            </button>
            <button
              style={styles.btnClear}
              onClick={() => {
                if (window.confirm('Clear all items?')) {
                  setItems([]);
                  setCustomer({ name: '', phone: '', address: '' });
                }
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Right Panel - Bill Preview */}
        <div style={styles.billPreviewPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>📄 Bill Preview</h3>
            <span style={styles.previewBadge}>80mm Thermal • B&W</span>
          </div>
          <div style={styles.previewContainer}>
            {isBillEmpty ? (
              <div style={styles.emptyPreview}>
                <span style={styles.emptyIcon}>🧾</span>
                <p style={styles.emptyText}>Add items to see bill preview</p>
                <small style={styles.emptySmall}>Black & White • 80mm Thermal Format</small>
              </div>
            ) : (
              <div style={styles.billPreview} dangerouslySetInnerHTML={{
                __html: generateBillHTML()
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// All styles in one object
const styles = {
  billingSystem: {
    minHeight: '100vh',
    background: '#f0f2f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  billingContainer: {
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    height: 'calc(100vh - 40px)'
  },
  billInputPanel: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  billPreviewPanel: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0',
    flexShrink: 0
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  billNumber: {
    fontSize: '12px',
    color: '#8a8a8a',
    background: '#f5f5f5',
    padding: '4px 14px',
    borderRadius: '20px',
    fontWeight: '600'
  },
  previewBadge: {
    fontSize: '11px',
    color: '#16a34a',
    background: 'rgba(22, 163, 74, 0.08)',
    padding: '4px 14px',
    borderRadius: '20px',
    fontWeight: '600'
  },
  customerSection: {
    marginBottom: '16px',
    flexShrink: 0
  },
  itemsSection: {
    marginBottom: '16px',
    flexShrink: 0
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a4a4a',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '10px'
  },
  formGroup: {
    flex: 1
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '600',
    color: '#8a8a8a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e8e8e8',
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    background: '#fafafa',
    color: '#1a1a1a',
    outline: 'none'
  },
  inputSmall: {
    width: '100%',
    padding: '8px 12px',
    border: '1.5px solid #e8e8e8',
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    background: '#fafafa',
    color: '#1a1a1a',
    outline: 'none'
  },
  btnAdd: {
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  itemsList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px',
    minHeight: '100px',
    maxHeight: '200px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#b0b0b0',
    padding: '20px'
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#b0b0b0',
    margin: 0
  },
  emptySmall: {
    fontSize: '12px',
    color: '#ccc',
    marginTop: '4px'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '6px'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  itemDetails: {
    fontSize: '12px',
    color: '#8a8a8a'
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemTotal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  btnRemove: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  billSummary: {
    borderTop: '2px solid #f0f0f0',
    paddingTop: '16px',
    flexShrink: 0
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '14px',
    color: '#4a4a4a'
  },
  grandTotal: {
    borderTop: '2px solid #1a1a1a',
    marginTop: '8px',
    paddingTop: '8px'
  },
  grandTotalLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  grandTotalValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#16a34a'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    flexShrink: 0
  },
  btnPrint: {
    flex: 1,
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  btnClear: {
    flex: 1,
    background: '#f5f5f5',
    color: '#4a4a4a',
    border: 'none',
    padding: '14px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  previewContainer: {
    flex: 1,
    overflow: 'auto',
    background: '#fafafa',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#b0b0b0'
  },
  billPreview: {
    width: '80mm',
    background: 'white',
    padding: '4px',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  }
};

// Add hover styles using CSS injection
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .btn-print:hover { background: #15803d !important; transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(22, 163, 74, 0.3) !important; }
  .btn-clear:hover { background: #e8e8e8 !important; }
  .btn-add:hover { background: #15803d !important; transform: translateY(-2px) !important; }
  .btn-remove:hover { background: #fecaca !important; transform: scale(1.1) !important; }
  input:focus { border-color: #16a34a !important; background: white !important; box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.06) !important; }
  select:focus { border-color: #16a34a !important; background: white !important; box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.06) !important; }
  .item-row:hover { background: #f0f0f0 !important; }
`;
document.head.appendChild(styleSheet);

export default BillingSystem;