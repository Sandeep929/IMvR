import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './invoiceForm.css';

export function InvoiceForm({ invoice, onSave, onCancel }) {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/customers');
                const data = await res.json();
                setCustomers(data);
            } catch (err) {
                console.error("Failed to load customers", err);
            }
        };

        fetchCustomers();
    }, []);

    const [formData, setFormData] = useState({
        date: '',
        product: 'Fresh Bricks',
        quantity: 0,
        rate: 6.8,
        amount: 0,
        advance: 0,
        balance: 0,
        pavatiNo: '',
        orderNo:'',
        customerName: '',
        site: '',
        vehicleNo: '',
        marfat: '',
        remarks: ''
    });

    useEffect(() => {
        if (invoice) {
            setFormData({
                date: invoice.date,
                product: invoice.product,
                quantity: invoice.quantity,
                rate: invoice.rate,
                amount: invoice.amount,
                advance: invoice.advance,
                balance: invoice.balance,
                pavatiNo: invoice.pavatiNo,
                orderNo: invoice.orderNo,
                customerName: invoice.customerName,
                site: invoice.site,
                vehicleNo: invoice.vehicleNo,
                marfat: invoice.marfat,
                remarks: invoice.remarks
            });
        }
    }, [invoice]);

    // Auto-calculate amount when quantity or rate changes
    useEffect(() => {
        const calculatedAmount = formData.quantity * formData.rate;
        const calculatedBalance = calculatedAmount - formData.advance;
        setFormData(prev => ({
            ...prev,
            amount: calculatedAmount,
            balance: calculatedBalance
        }));
    }, [formData.quantity, formData.rate, formData.advance]);

    const handleSubmit = (e) => {
        e.preventDefault();
            onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['quantity', 'rate', 'advance', 'pavatiNo'].includes(name)
                ? parseFloat(value) || 0
                : value
        }));
    };

    return (
        <div className="invoice-form-overlay">
            <div className="invoice-form-card">
                <div className="invoice-form-header">
                    <div className="invoice-form-title">
                        <h3>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
                        <p>Fill in the invoice details below</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="invoice-form-body">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h4 className="section-title">
                                Basic Information
                            </h4>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label">
                                        Date <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="form-input-i"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Product <span className="required">*</span>
                                    </label>
                                    <select
                                        name="product"
                                        value={formData.product}
                                        onChange={handleChange}
                                        required
                                        className="form-select-i"
                                    >
                                        <option value="Fresh Bricks">Fresh Bricks</option>
                                        <option value="Khanjar">Khanjar</option>
                                        <option value="Red Bricks">Red Bricks</option>
                                        <option value="Fly Ash Bricks">Fly Ash Bricks</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Pavati Number <span className="required">*</span>
                                    </label>
                                    <input
                                        type='text'
                                        name="pavatiNo"
                                        value={formData.pavatiNo}
                                        onChange={handleChange}
                                        required
                                        className="form-input-i"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Order Number <span className="required">*</span>
                                    </label>
                                    <input
                                        type='text'
                                        name="orderNo"
                                        value={formData.orderNo}
                                        onChange={handleChange}
                                        required
                                        className="form-input-i"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="form-section">
                            <h4 className="section-title">
                                Customer Information
                            </h4>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label className="form-label">
                                        Customer Name <span className="required">*</span>
                                    </label>
                                    <select
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        required
                                        className="form-select-i"
                                    >
                                        <option value="">Select Customer</option>

                                        {customers.map((customer) => (
                                            <option key={customer._id} value={customer.name}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Site Location <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="site"
                                        value={formData.site}
                                        onChange={handleChange}
                                        required
                                        className="form-input-i"
                                        placeholder="Enter site location"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Vehicle Number <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicleNo"
                                        value={formData.vehicleNo}
                                        onChange={handleChange}
                                        required
                                        className="form-input-i"
                                        placeholder="Enter vehicle number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Marfat (Via)
                                    </label>
                                    <input
                                        type="text"
                                        name="marfat"
                                        value={formData.marfat}
                                        onChange={handleChange}
                                        className="form-input-i"
                                        placeholder="Enter via/through (optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Details */}
                        <div className="form-section">
                            <h4 className="section-title">
                                Pricing Details
                            </h4>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label">
                                        Quantity <span className="required">*</span>
                                    </label>
                                    <input
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="form-input-i"

                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Rate (₹) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="rate"
                                        value={formData.rate}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        min="0"
                                        className="form-input-i"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Total Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        readOnly
                                        className="form-input-i input-readonly"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="form-section">
                            <h4 className="section-title">
                                Payment Details
                            </h4>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label className="form-label">
                                        Advance Amount (₹)
                                    </label>
                                    <input
                                        name="advance"
                                        value={formData.advance}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="form-input-i"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Balance Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="balance"
                                        value={formData.balance}
                                        readOnly
                                        className="form-input-i input-readonly"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="form-section">
                            <h4 className="section-title">
                                Additional Information
                            </h4>
                            <div className="form-group">
                                <label className="form-label">
                                    Remarks
                                </label>
                                <textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    rows={3}
                                    className="form-textarea-1 form-input-i"
                                    placeholder="Add any additional notes or remarks..."
                                />
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="invoice-summary-box">
                            <h4 className="summary-title">Invoice Summary</h4>
                            <div className="summary-grid">
                                <div>
                                    <p className="summary-item-label">Total Amount</p>
                                    <p className="summary-item-value text-slate-900">₹ {formData.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="summary-item-label">Advance Paid</p>
                                    <p className="summary-item-value text-green-700">₹ {formData.advance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="summary-item-label">Balance Due</p>
                                    <p className={`summary-item-value ${formData.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                        ₹ {formData.balance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="invoice-form-footer">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                        >
                            {invoice ? 'Update Invoice' : 'Create Invoice'}
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                        >
                            Add Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
