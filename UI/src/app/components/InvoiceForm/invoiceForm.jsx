import React, { useState, useEffect } from 'react';
import { Share2, X, Plus, Trash2, MessageCircle } from 'lucide-react';
import { shareInvoiceOnWhatsApp } from '../../../utils/whatsapp';
import { SearchableDropdown } from '../ui/SearchableDropdown';
import './invoiceForm.css';

export function InvoiceForm({ invoice, onSave, onCancel }) {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/customers');
                const data = await res.json();
                setCustomers(data);

                const resProducts = await fetch('http://localhost:5000/api/products');
                const dataProducts = await resProducts.json();
                setProducts(dataProducts);
                
                if (!invoice && dataProducts.length > 0) {
                    setFormData(prev => {
                        if (prev.items.length === 1 && prev.items[0].product === '') {
                            const newItems = [...prev.items];
                            newItems[0].product = dataProducts[0].name;
                            newItems[0].rate = dataProducts[0].rate;
                            return { ...prev, items: newItems };
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };

        fetchData();
    }, [invoice]);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        pavatiNo: '',
        orderNo: '',
        customerName: '',
        site: '',
        vehicleNo: '',
        marfat: '',
        remarks: '',
        items: [
            { product: '', quantity: 0, rate: 0, amount: 0 }
        ],
        payments: [
            { date: new Date().toISOString().split('T')[0], amount: 0, method: 'Cash', remarks: 'Advance' }
        ],
        totalAmount: '',
        totalAdvance: '',
        balance: '',
        shareOnWhatsApp: false
    });

    useEffect(() => {
        if (invoice) {
            setFormData({
                ...invoice,
                date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : '',
                items: invoice.items || [{ product: '', quantity: 0, rate: 0, amount: 0 }],
                payments: invoice.payments || [{ date: new Date().toISOString().split('T')[0], amount: 0, method: 'Cash', remarks: 'Advance' }]
            });
        }
    }, [invoice]);

    // Recalculate totals whenever items or payments change
    useEffect(() => {
        const totalAmount = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalAdvance = formData.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        const balance = totalAmount - totalAdvance;

        setFormData(prev => ({
            ...prev,
            totalAmount,
            totalAdvance,
            balance
        }));
    }, [formData.items, formData.payments]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Item Handlers
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'product') {
            const selectedProduct = products.find(p => p.name === value);
            if (selectedProduct) {
                newItems[index].rate = selectedProduct.rate;
            }
        }

        const qty = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = qty * rate;
        
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product: products.length > 0 ? products[0].name : '', quantity: '', rate: products.length > 0 ? products[0].rate : 0, amount: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };

    // Payment Handlers
    const handlePaymentChange = (index, field, value) => {
        const newPayments = [...formData.payments];
        newPayments[index][field] = value;
        setFormData(prev => ({ ...prev, payments: newPayments }));
    };

    const addPayment = () => {
        setFormData(prev => ({
            ...prev,
            payments: [...prev.payments, { date: new Date().toISOString().split('T')[0], amount: 0, method: 'Cash', remarks: '' }]
        }));
    };

    const removePayment = (index) => {
        if (formData.payments.length > 1) {
            const newPayments = formData.payments.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, payments: newPayments }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);

        if (formData.shareOnWhatsApp) {
            const customer = customers.find(c => c.name === formData.customerName);
            if (customer && (customer.phone || customer.mobile)) {
                shareInvoiceOnWhatsApp(formData, customer.phone || customer.mobile);
            }
        }
    };

    return (
        <div className="invoice-form-overlay">
            <div className="invoice-form-card">
                <div className="invoice-form-header">
                    <div className="invoice-form-title">
                        <h3>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
                        <p>Fill in the invoice details below</p>
                    </div>
                    <button onClick={onCancel} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="invoice-form-body">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h4 className="section-title">Basic Information</h4>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Date <span className="required">*</span></label>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="form-input-i" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pavati Number <span className="required">*</span></label>
                                    <input type='text' name="pavatiNo" value={formData.pavatiNo} onChange={handleChange} required className="form-input-i" />
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="form-section">
                            <h4 className="section-title">Customer Information</h4>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Customer Name <span className="required">*</span></label>
                                    <SearchableDropdown
                                        options={customers.map((c, i) => ({ label: c.phone ? `${c.name} - ${c.phone}` : c.name, value: c.name, id: c._id || c.id || i }))}
                                        value={formData.customerName}
                                        onChange={(val) => handleChange({ target: { name: 'customerName', value: val } })}
                                        placeholder="Select Customer..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Site Location <span className="required">*</span></label>
                                    <input type="text" name="site" value={formData.site} onChange={handleChange} required className="form-input-i" placeholder="Enter site location" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Number <span className="required">*</span></label>
                                    <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleChange} required className="form-input-i" placeholder="Enter vehicle number" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Marfat (Via)</label>
                                    <input type="text" name="marfat" value={formData.marfat} onChange={handleChange} className="form-input-i" placeholder="Enter via/through" />
                                </div>
                            </div>
                        </div>

                        {/* Products / Items */}
                        <div className="form-section">
                            <div className="section-header-row">
                                <h4 className="section-title">Products / Orders</h4>
                                <button type="button" onClick={addItem} className="add-row-btn">
                                    <Plus size={16} /> Add Product
                                </button>
                            </div>
                            <div className="items-table-container">
                                <table className="items-edit-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Rate</th>
                                            <th>Amount</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        value={item.product}
                                                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                                        className="form-select-i"
                                                    >
                                                        <option value="" disabled>Select a product...</option>
                                                        {products.map(p => <option key={p._id || p.id} value={p.name}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        className="form-input-i"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={item.rate}
                                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                        className="form-input-i"
                                                    />
                                                </td>
                                                <td>
                                                    <input type="number" value={item.amount} readOnly className="form-input-i input-readonly" />
                                                </td>
                                                <td>
                                                    <button type="button" onClick={() => removeItem(index)} className="delete-row-btn" disabled={formData.items.length === 1}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payments / Installments */}
                        <div className="form-section">
                            <div className="section-header-row">
                                <h4 className="section-title">Payment History / Installments</h4>
                                <button type="button" onClick={addPayment} className="add-row-btn">
                                    <Plus size={16} /> Add Payment
                                </button>
                            </div>
                            <div className="items-table-container">
                                <table className="items-edit-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Remarks</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.payments.map((payment, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="date"
                                                        value={payment.date ? new Date(payment.date).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                                                        className="form-input-i"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={payment.amount}
                                                        onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                                                        className="form-input-i"
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={payment.method}
                                                        onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                                                        className="form-select-i"
                                                    >
                                                        <option value="Cash">Cash</option>
                                                        <option value="Online">Online</option>
                                                        <option value="Cheque">Cheque</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={payment.remarks}
                                                        onChange={(e) => handlePaymentChange(index, 'remarks', e.target.value)}
                                                        className="form-input-i"
                                                        placeholder="e.g. Advance"
                                                    />
                                                </td>
                                                <td>
                                                    <button type="button" onClick={() => removePayment(index)} className="delete-row-btn" disabled={formData.payments.length === 1}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="invoice-summary-box">
                            <h4 className="summary-title">Invoice Summary</h4>
                            <div className="summary-grid">
                                <div>
                                    <p className="summary-item-label">Total Amount</p>
                                    <p className="summary-item-value text-slate-900">₹ {formData.totalAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="summary-item-label">Total Paid</p>
                                    <p className="summary-item-value text-green-700">₹ {formData.totalAdvance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="summary-item-label">Balance Due</p>
                                    <p className={`summary-item-value ${formData.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                        ₹ {formData.balance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label">General Remarks</label>
                                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="form-textarea-1 form-input-i" placeholder="Internal notes..." />
                            </div>
                        </div>
                    </div>

                    <div className="invoice-form-footer">
                        <div className="footer-options">
                            <label className="share-whatsapp-label">
                                <input
                                    type="checkbox"
                                    name="shareOnWhatsApp"
                                    checked={formData.shareOnWhatsApp}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shareOnWhatsApp: e.target.checked }))}
                                />
                                <MessageCircle size={16} className="wa-icon" />
                                Share on WhatsApp
                            </label>
                        </div>
                        <div className="footer-btns">
                            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
                            <button type="submit" className="submit-btn">{invoice ? 'Update Invoice' : 'Create Invoice'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
