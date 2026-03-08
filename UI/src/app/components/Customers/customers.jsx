import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Phone, MapPin, FileText, IndianRupee, TrendingUp, User, X, Loader2, Download, Filter, AlertCircle } from 'lucide-react';
import { customerAPI, invoiceAPI } from '@/services/api';
import './customers.css';

export function Customers() {
    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dueFilter, setDueFilter] = useState('all'); // 'all' | 'due' | 'paid'
    const [showDownload, setShowDownload] = useState(false);
    const [downloadFrom, setDownloadFrom] = useState('');
    const [downloadTo, setDownloadTo] = useState('');

    useEffect(() => {
        loadCustomerData();
    }, []);

    const loadCustomerData = async () => {
        try {
            setLoading(true);
            const [custRes, invRes] = await Promise.all([
                customerAPI.getAll(),
                invoiceAPI.getAll()
            ]);
            setCustomers(custRes.data);
            setInvoices(invRes.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    // Enrich customers with invoice data
    const enrichedCustomers = customers.map(customer => {
        const customerInvoices = invoices.filter(inv => inv.customerName === customer.name);
        return {
            ...customer,
            totalInvoices: customerInvoices.length,
            totalAmount: customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
            totalPaid: customerInvoices.reduce((sum, inv) => sum + (inv.totalAdvance || 0), 0),
            balance: customerInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
            products: [...new Set(customerInvoices.flatMap(inv => (inv.items || []).map(i => i.product)))],
            lastInvoiceDate: customerInvoices.length > 0
                ? customerInvoices.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
                : null
        };
    });

    const filteredCustomers = enrichedCustomers.filter(customer => {
        const matchesSearch =
            (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.address || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDue =
            dueFilter === 'all' ||
            (dueFilter === 'due' && customer.balance > 0) ||
            (dueFilter === 'paid' && customer.balance <= 0);

        return matchesSearch && matchesDue;
    });

    // ── Master Record CSV Download ──────────────────────────────────
    const handleDownloadMasterRecord = () => {
        let dataToExport = enrichedCustomers;

        // Apply date range filter on lastInvoiceDate if set
        if (downloadFrom || downloadTo) {
            const from = downloadFrom ? new Date(downloadFrom) : new Date('2000-01-01');
            const to = downloadTo ? new Date(downloadTo + 'T23:59:59') : new Date();
            dataToExport = enrichedCustomers.filter(c => {
                if (!c.lastInvoiceDate) return false;
                const d = new Date(c.lastInvoiceDate);
                return d >= from && d <= to;
            });
        }

        const headers = ['Name', 'Phone', 'Email', 'Address', 'Total Invoices', 'Products Ordered', 'Total Amount (₹)', 'Total Paid (₹)', 'Balance Due (₹)', 'Last Invoice Date'];
        const rows = dataToExport.map(c => [
            `"${c.name || ''}"`,
            `"${c.phone || ''}"`,
            `"${c.email || ''}"`,
            `"${(c.address || '').replace(/"/g, '""')}"`,
            c.totalInvoices,
            `"${(c.products || []).join(', ')}"`,
            c.totalAmount,
            c.totalPaid,
            c.balance,
            c.lastInvoiceDate ? new Date(c.lastInvoiceDate).toLocaleDateString('en-IN') : 'N/A'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateLabel = downloadFrom && downloadTo
            ? `_${downloadFrom}_to_${downloadTo}`
            : downloadFrom ? `_from_${downloadFrom}` : downloadTo ? `_to_${downloadTo}` : '';
        link.href = url;
        link.download = `master_record${dateLabel}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        setShowDownload(false);
    };

    const stats = {
        total: enrichedCustomers.length,
        active: enrichedCustomers.filter(c => c.balance > 0).length,
        totalRevenue: enrichedCustomers.reduce((sum, c) => sum + c.totalAmount, 0),
        avgRevenue: enrichedCustomers.length > 0
            ? enrichedCustomers.reduce((sum, c) => sum + c.totalAmount, 0) / enrichedCustomers.length
            : 0
    };

    const handleAdd = () => {
        setEditingCustomer(null);
        setShowForm(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                await customerAPI.delete(id);
                setCustomers(customers.filter(c => c.id !== id && c._id !== id));
            } catch (err) {
                alert('Error deleting customer: ' + err.message);
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingCustomer) {
                const id = editingCustomer.id || editingCustomer._id;
                await customerAPI.update(id, formData);
                await loadCustomerData();
            } else {
                await customerAPI.create(formData);
                await loadCustomerData();
            }
            setShowForm(false);
            setEditingCustomer(null);
        } catch (err) {
            alert('Error saving customer: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="customers-container">
                <div className="dashboard-loading">
                    <Loader2 size={40} className="spinner" />
                    <p>Loading customers...</p>
                </div>
            </div>
        );
    }

    if (showForm) {
        return <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="customers-container">
            <div className="customers-header-stats">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-slate-900">
                                <User size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Total Customers</p>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-slate-900-custom">
                                <TrendingUp size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Active Customers</p>
                                <p className="stat-value">{stats.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-slate-900-custom">
                                <IndianRupee size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Total Revenue</p>
                                <p className="stat-value">₹ {stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card stat-card-red">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-slate-900-custom">
                                <AlertCircle size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Outstanding Balance</p>
                                <p className="stat-value red">₹ {enrichedCustomers.reduce((s, c) => s + c.balance, 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="customers-content">
                {/* Content Header */}
                <div className="content-header">
                    <div className="content-title">
                        <h3>Customer Management</h3>
                        <p>Manage all customer records and transactions</p>
                    </div>
                    <div className="header-actions-row">
                        {/* Download Master Record */}
                        <div className="download-panel-wrapper">
                            <button
                                onClick={() => setShowDownload(v => !v)}
                                className="master-dl-btn"
                            >
                                <Download size={16} />
                                Master Record
                            </button>
                            {showDownload && (
                                <div className="download-panel">
                                    <p className="dl-panel-title">Select Date Range</p>
                                    <div className="dl-date-row">
                                        <div>
                                            <label className="dl-label">From</label>
                                            <input
                                                type="date"
                                                value={downloadFrom}
                                                onChange={e => setDownloadFrom(e.target.value)}
                                                className="dl-date-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="dl-label">To</label>
                                            <input
                                                type="date"
                                                value={downloadTo}
                                                onChange={e => setDownloadTo(e.target.value)}
                                                className="dl-date-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="dl-actions">
                                        <button className="dl-cancel" onClick={() => setShowDownload(false)}>Cancel</button>
                                        <button className="dl-confirm" onClick={handleDownloadMasterRecord}>
                                            <Download size={14} /> Download CSV
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleAdd} className="add-btn">
                            <Plus size={18} />
                            Add Customer
                        </button>
                    </div>
                </div>

                {/* Search + Due Filter Bar */}
                <div className="search-section">
                    <div className="search-filter-row">
                        <div className="search-container" style={{ flex: 1 }}>
                            <User size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="due-filter-group">
                            <Filter size={15} style={{ color: '#94a3b8' }} />
                            {['all', 'due', 'paid'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDueFilter(opt)}
                                    className={`due-filter-btn ${dueFilter === opt ? 'due-filter-active-' + opt : ''}`}
                                >
                                    {opt === 'all' ? 'All' : opt === 'due' ? '🔴 Has Due' : '🟢 Fully Paid'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {dueFilter === 'due' && (
                        <p className="due-filter-hint">
                            Showing <strong>{filteredCustomers.length}</strong> customers with outstanding balance
                        </p>
                    )}
                </div>

                <div className="table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th className="text-center">Invoices</th>
                                <th>Products Ordered</th>
                                <th className="text-right">Total Amount</th>
                                <th className="text-right">Paid</th>
                                <th className="text-right">Balance</th>
                                <th>Last Invoice</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer, index) => (
                                <tr
                                    key={customer._id || customer.id}
                                    className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                                >
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar">
                                                <span className="avatar-text">{(customer.name || '').charAt(0)}</span>
                                            </div>
                                            <div className="customer-details">
                                                <p className="customer-name">{customer.name}</p>
                                                <p className="customer-email">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <Phone size={14} className="cell-icon" />
                                            {customer.phone}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="address-cell">
                                            <MapPin size={14} className="cell-icon" />
                                            {customer.address}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="invoices-badge">
                                            <FileText size={12} />
                                            {customer.totalInvoices}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="products-cell">
                                            {(customer.products || []).length > 0
                                                ? (customer.products || []).map((p, pi) => (
                                                    <span key={pi} className="product-tag">{p}</span>
                                                ))
                                                : <span className="no-data">—</span>
                                            }
                                        </div>
                                    </td>
                                    <td className="text-right amount-text">
                                        ₹ {customer.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="text-right paid-text">
                                        ₹ {customer.totalPaid.toLocaleString()}
                                    </td>
                                    <td className="text-right balance-text">
                                        {customer.balance > 0 ? (
                                            <span className="balance-due">₹ {customer.balance.toLocaleString()}</span>
                                        ) : (
                                            <span className="balance-paid">Paid</span>
                                        )}
                                    </td>
                                    <td className="date-text">
                                        {customer.lastInvoiceDate
                                            ? new Date(customer.lastInvoiceDate).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: '2-digit'
                                            })
                                            : '—'
                                        }
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="action-btn action-btn-edit"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id || customer._id)}
                                                className="action-btn action-btn-delete"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function CustomerForm({ customer, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <div className="form-header">
                    <div className="form-title">
                        <h3>{customer ? 'Edit Customer' : 'Add New Customer'}</h3>
                        <p>Fill in the customer details below</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-body">
                        <div>
                            <label className="form-label">
                                Customer Name <span className="required-star">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div className="form-group-grid">
                            <div>
                                <label className="form-label">
                                    Phone Number <span className="required-star">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">
                                Address <span className="required-star">*</span>
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="form-textarea"
                                placeholder="Enter customer address"
                            />
                        </div>
                    </div>

                    <div className="form-footer">
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
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
