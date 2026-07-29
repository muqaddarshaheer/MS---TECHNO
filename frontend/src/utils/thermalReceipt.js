// ThermalReceipt.jsx
import React, { useState, useRef } from 'react';

const ThermalReceipt = () => {
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
  const [shopName, setShopName] = useState('My Shop');
  const [shopAddress, setShopAddress] = useState('123 Main Street, Karachi');
  const [shopPhone, setShopPhone] = useState('021-1234567');

  const addItem = () => {
    if (currentItem.name && currentItem.quantity > 0 && currentItem.price > 0) {
      setItems([...items, {
        ...currentItem,
        total: currentItem.quantity * currentItem.price
      }]);
      setCurrentItem({ name: '', quantity: 1, price: 0 });
    }
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Direct Print to Thermal Printer
  const printReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    const receiptHTML = generateReceiptHTML();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    }, 500);
  };

  const generateReceiptHTML = () => {
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0 auto;
            padding: 8px 4px;
            background: white;
            color: black;
          }
          .receipt {
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
          }
          /* Header */
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 6px;
          }
          .header h1 {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 0;
            text-transform: uppercase;
          }
          .header p {
            font-size: 10px;
            margin: 2px 0;
            line-height: 1.3;
          }
          .header .divider {
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
          /* Customer */
          .customer {
            font-size: 10px;
            padding: 4px 0;
            border-bottom: 1px dashed #000;
            margin-bottom: 4px;
          }
          .customer p {
            margin: 2px 0;
          }
          /* Items Table */
          .items {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin: 4px 0;
          }
          .items th {
            text-align: left;
            font-size: 9px;
            border-bottom: 1px solid #000;
            padding: 3px 0;
            text-transform: uppercase;
          }
          .items td {
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
          }
          .items .text-right {
            text-align: right;
          }
          .items .text-center {
            text-align: center;
          }
          /* Totals */
          .totals {
            border-top: 2px solid #000;
            padding-top: 6px;
            margin-top: 4px;
          }
          .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            font-size: 10px;
          }
          .totals .grand {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 4px;
            margin-top: 4px;
          }
          .totals .grand .row {
            font-size: 16px;
          }
          /* Payment */
          .payment {
            border-top: 1px dashed #000;
            padding-top: 4px;
            margin-top: 4px;
            font-size: 10px;
          }
          .payment p {
            margin: 2px 0;
          }
          /* Barcode */
          .barcode {
            text-align: center;
            font-size: 22px;
            letter-spacing: 3px;
            padding: 6px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            margin: 6px 0;
            font-family: 'Courier New', monospace;
          }
          /* Footer */
          .footer {
            text-align: center;
            border-top: 2px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 10px;
          }
          .footer p {
            margin: 2px 0;
          }
          .footer .thanks {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          /* Small helper */
          .small {
            font-size: 8px;
          }
          .bold {
            font-weight: bold;
          }
          .mt-1 { margin-top: 4px; }
          .mb-1 { margin-bottom: 4px; }
          
          @media print {
            body { margin: 0; padding: 4px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Shop Header -->
          <div class="header">
            <h1>${shopName}</h1>
            <p>${shopAddress}</p>
            <p>Tel: ${shopPhone}</p>
            <p>NTN: 1234567-8 | GST: 123456789</p>
            <div class="divider"></div>
            <p>${formattedDate}  ${formattedTime}</p>
            <p>Bill #: ${String(Date.now()).slice(-8)}</p>
          </div>

          <!-- Customer -->
          <div class="customer">
            <p><span class="bold">Customer:</span> ${customer.name || 'Walk-in Customer'}</p>
            ${customer.phone ? `<p><span class="bold">Phone:</span> ${customer.phone}</p>` : ''}
            ${customer.address ? `<p><span class="bold">Address:</span> ${customer.address}</p>` : ''}
          </div>

          <!-- Items -->
          <table class="items">
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

          <!-- Totals -->
          <div class="totals">
            <div class="row">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            ${taxRate > 0 ? `
              <div class="row">
                <span>GST (${taxRate}%)</span>
                <span>${taxAmount}</span>
              </div>
            ` : ''}
            ${discount > 0 ? `
              <div class="row">
                <span>Discount (${discount}%)</span>
                <span>-${discountAmount}</span>
              </div>
            ` : ''}
            <div class="row grand">
              <span>TOTAL</span>
              <span>${grandTotal}</span>
            </div>
          </div>

          <!-- Payment -->
          <div class="payment">
            <p><span class="bold">Payment:</span> ${paymentMethod.toUpperCase()}</p>
            <p><span class="bold">Amount:</span> ${grandTotal}</p>
          </div>

          <!-- Barcode -->
          <div class="barcode">${String(Date.now()).slice(-8)}</div>

          <!-- Footer -->
          <div class="footer">
            <p class="thanks">THANK YOU!</p>
            <p>Visit Again • We Value Your Business</p>
            <p class="small">Items: ${items.length} | Qty: ${items.reduce((sum, i) => sum + i.quantity, 0)}</p>
            <p class="small mt-1">Powered by ProBilling</p>
            <p class="small">www.probilling.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      height: 'calc(100vh - 40px)'
    },
    panel: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '2px solid #f0f0f0',
      flexShrink: 0
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      margin: 0
    },
    badge: {
      fontSize: '12px',
      color: '#8a8a8a',
      background: '#f5f5f5',
      padding: '4px 14px',
      borderRadius: '20px'
    },
    section: {
      marginBottom: '12px',
      flexShrink: 0
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#4a4a4a',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    },
    row: {
      display: 'flex',
      gap: '12px',
      marginBottom: '8px'
    },
    group: {
      flex: 1
    },
    label: {
      display: 'block',
      fontSize: '10px',
      fontWeight: '600',
      color: '#8a8a8a',
      textTransform: 'uppercase',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1.5px solid #e5e5e5',
      borderRadius: '10px',
      fontSize: '14px',
      background: '#fafafa',
      outline: 'none'
    },
    inputSmall: {
      width: '100%',
      padding: '6px 10px',
      border: '1.5px solid #e5e5e5',
      borderRadius: '10px',
      fontSize: '14px',
      background: '#fafafa',
      outline: 'none'
    },
    btnAdd: {
      background: '#16a34a',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%'
    },
    list: {
      flex: 1,
      overflowY: 'auto',
      marginBottom: '12px',
      minHeight: '80px',
      maxHeight: '180px'
    },
    empty: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#b0b0b0'
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      background: '#f8f9fa',
      borderRadius: '10px',
      marginBottom: '4px'
    },
    itemName: {
      fontSize: '14px',
      fontWeight: '600'
    },
    itemDetails: {
      fontSize: '12px',
      color: '#8a8a8a'
    },
    itemTotal: {
      fontSize: '14px',
      fontWeight: '700'
    },
    btnRemove: {
      background: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      fontSize: '16px',
      cursor: 'pointer'
    },
    summary: {
      borderTop: '2px solid #f0f0f0',
      paddingTop: '12px',
      flexShrink: 0
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '2px 0',
      fontSize: '14px',
      color: '#4a4a4a'
    },
    grand: {
      borderTop: '2px solid #1a1a1a',
      marginTop: '6px',
      paddingTop: '6px'
    },
    grandLabel: {
      fontSize: '18px',
      fontWeight: '700'
    },
    grandValue: {
      fontSize: '20px',
      fontWeight: '800',
      color: '#16a34a'
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '12px',
      flexShrink: 0
    },
    btnPrint: {
      flex: 2,
      background: '#16a34a',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    btnClear: {
      flex: 1,
      background: '#f5f5f5',
      color: '#4a4a4a',
      border: 'none',
      padding: '12px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    preview: {
      flex: 1,
      overflow: 'auto',
      background: '#fafafa',
      borderRadius: '12px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    receiptPreview: {
      width: '80mm',
      background: 'white',
      padding: '4px',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    shopSettings: {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px',
      flexWrap: 'wrap'
    },
    shopInput: {
      flex: 1,
      minWidth: '120px',
      padding: '6px 10px',
      border: '1.5px solid #e5e5e5',
      borderRadius: '8px',
      fontSize: '12px',
      background: '#fafafa',
      outline: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        {/* Left Panel */}
        <div style={styles.panel}>
          <div style={styles.header}>
            <h2 style={styles.title}>🧾 New Receipt</h2>
            <span style={styles.badge}>#BILL-{Date.now().toString().slice(-6)}</span>
          </div>

          {/* Shop Settings */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Shop Settings</h3>
            <div style={styles.shopSettings}>
              <input
                style={styles.shopInput}
                placeholder="Shop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              <input
                style={styles.shopInput}
                placeholder="Shop Address"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
              />
              <input
                style={{...styles.shopInput, minWidth: '100px'}}
                placeholder="Phone"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Customer */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer</h3>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Name</label>
                <input
                  style={styles.input}
                  placeholder="Walk-in Customer"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Phone</label>
                <input
                  style={styles.input}
                  placeholder="03XX-XXXXXXX"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                />
              </div>
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Address</label>
              <input
                style={styles.input}
                placeholder="Address"
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
              />
            </div>
          </div>

          {/* Items */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Add Items</h3>
            <div style={styles.row}>
              <div style={{...styles.group, flex: 2 }}>
                <input
                  style={styles.input}
                  placeholder="Item name"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </div>
              <div style={styles.group}>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div style={styles.group}>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Price"
                  min="0"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <button style={styles.btnAdd} onClick={addItem}>+ Add Item</button>
          </div>

          {/* Items List */}
          <div style={styles.list}>
            {items.length === 0 ? (
              <div style={styles.empty}>
                <span style={{fontSize: '32px'}}>📋</span>
                <p>No items added</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} style={styles.item}>
                  <div>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={styles.itemDetails}>{item.quantity} × {item.price}</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={styles.itemTotal}>{item.total}</span>
                    <button style={styles.btnRemove} onClick={() => removeItem(index)}>×</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Items:</span>
              <span>{items.length}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{subtotal}</span>
            </div>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>GST %</label>
                <input
                  style={styles.inputSmall}
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Discount %</label>
                <input
                  style={styles.inputSmall}
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Payment</label>
                <select
                  style={styles.inputSmall}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
            </div>
            <div style={{...styles.summaryRow, ...styles.grand}}>
              <span style={styles.grandLabel}>Grand Total:</span>
              <span style={styles.grandValue}>{grandTotal}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={{...styles.btnPrint, opacity: items.length === 0 ? 0.5 : 1, cursor: items.length === 0 ? 'not-allowed' : 'pointer'}}
              onClick={printReceipt}
              disabled={items.length === 0}
            >
              🖨️ Print Receipt
            </button>
            <button
              style={styles.btnClear}
              onClick={() => {
                if (window.confirm('Clear all?')) {
                  setItems([]);
                  setCustomer({ name: '', phone: '', address: '' });
                }
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div style={styles.panel}>
          <div style={styles.header}>
            <h3 style={styles.title}>📄 Receipt Preview</h3>
            <span style={{...styles.badge, background: 'rgba(22,163,74,0.08)', color: '#16a34a'}}>
              80mm Thermal
            </span>
          </div>
          <div style={styles.preview}>
            {items.length === 0 ? (
              <div style={styles.empty}>
                <span style={{fontSize: '32px'}}>🧾</span>
                <p>Add items to preview</p>
                <small style={{color: '#ccc', fontSize: '12px'}}>80mm Thermal Format</small>
              </div>
            ) : (
              <div style={styles.receiptPreview} dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalReceipt;