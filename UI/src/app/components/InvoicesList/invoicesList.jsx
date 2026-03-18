import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Download, Search, Filter, FileText, Loader2, CirclePlus, MessageCircle } from 'lucide-react';
import { invoiceAPI, customerAPI } from '@/services/api';
import { InvoiceForm } from '../InvoiceForm/invoiceForm';
import { InvoiceDetailView } from '../InvoiceDetailView/invoiceDetailView';
import { shareInvoiceOnWhatsApp } from '../../../utils/whatsapp';
import './invoicesList.css';

export function InvoicesList() {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProduct, setFilterProduct] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTime, setFilterTime] = useState('all'); // 'all' | 'today' | 'week' | 'month'

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const [invRes, custRes] = await Promise.all([
                invoiceAPI.getAll(),
                customerAPI.getAll()
            ]);
            setInvoices(invRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingInvoice(null);
        setShowForm(true);
    };

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            try {
                await invoiceAPI.delete(id);
                setInvoices(invoices.filter(inv => inv.id !== id));
            } catch (err) {
                alert('Error deleting invoice: ' + err.message);
            }
        }
    };

    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const handleSave = async (invoiceData) => {
        try {
            if (editingInvoice) {
                await invoiceAPI.update(editingInvoice.id, invoiceData);
            } else {
                await invoiceAPI.create(invoiceData);
            }
            await loadInvoices();
            setShowForm(false);
            setEditingInvoice(null);
        } catch (err) {
            alert('Error saving invoice: ' + err.message);
        }
    };

    const handleWhatsAppShare = (invoice) => {
        const customer = customers.find(c => c.name === invoice.customerName);
        if (customer && (customer.phone || customer.mobile)) {
            shareInvoiceOnWhatsApp(invoice, customer.phone || customer.mobile);
        } else {
            alert("Customer phone number not found in database.");
        }
    };

    const handleExport = () => {
        if (filteredInvoices.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = [
            'S. No.', 'Date', 'Product', 'Quantity', 'Rate', 'Amount', 
            'Advance', 'Balance', 'Pavati N.', 'Customer Name', 'Site', 
            'Vehicle No.', 'Marfat', 'Remarks'
        ];
        const csvRows = [headers.join(',')];

        filteredInvoices.forEach((inv, index) => {
            const dateStr = inv.date 
                ? new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-') 
                : '';
            
            const product = inv.items && inv.items.length > 0 ? inv.items[0].product : '';
            const quantity = inv.items && inv.items.length > 0 ? inv.items[0].quantity : '';
            const rate = inv.items && inv.items.length > 0 ? inv.items[0].rate : '';

            const amountStr = `₹ ${Number(inv.totalAmount || 0).toLocaleString('en-IN')}`;
            const advanceStr = `₹ ${Number(inv.totalAdvance || 0).toLocaleString('en-IN')}`;
            const balanceStr = `₹ ${Number(inv.balance || 0).toLocaleString('en-IN')}`;

            csvRows.push([
                index + 1,
                `${dateStr}`,
                `"${product}"`,
                quantity,
                rate,
                `"${amountStr}"`,
                `"${advanceStr}"`,
                `"${balanceStr}"`,
                `"${inv.pavatiNo || ''}"`,
                `"${inv.customerName || ''}"`,
                `"${inv.site || ''}"`,
                `"${inv.vehicleNo || ''}"`,
                `"${inv.marfat || ''}"`,
                `"${inv.remarks || ''}"`
            ].join(','));
        });

        const csvContent = csvRows.join('\n');
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (showForm) {
        return (
            <InvoiceForm
                invoice={editingInvoice}
                onSave={handleSave}
                onCancel={() => {
                    setShowForm(false);
                    setEditingInvoice(null);
                }}
            />
        );
    }

    if (selectedInvoice) {
        return (
            <InvoiceDetailView
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />
        );
    }

    if (loading) {
        return (
            <div className="invoices-container">
                <div className="dashboard-loading">
                    <Loader2 size={40} className="spinner" />
                    <p>Loading invoices...</p>
                </div>
            </div>
        );
    }

    // Get unique products for filter dropdown (from items array)
    const uniqueProducts = [...new Set(invoices.flatMap(inv => (inv.items || []).map(item => item.product)).filter(Boolean))];

    // Filter invoices
    const filteredInvoices = invoices.filter(invoice => {
        const productNames = (invoice.items || []).map(i => i.product).join(' ');
        const matchesSearch =
            (invoice.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.site || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.pavatiNo || '').toString().includes(searchTerm);

        const matchesProduct = filterProduct === 'all' || (invoice.items || []).some(i => i.product === filterProduct);
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'paid' && invoice.balance === 0) ||
            (filterStatus === 'pending' && invoice.balance > 0);

        const matchesTime = (() => {
            if (filterTime === 'all') return true;
            const invDate = new Date(invoice.date);
            const now = new Date();
            if (filterTime === 'today') {
                return invDate.toDateString() === now.toDateString();
            }
            if (filterTime === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return invDate >= weekAgo;
            }
            if (filterTime === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return invDate >= monthAgo;
            }
            return true;
        })();

        return matchesSearch && matchesProduct && matchesStatus && matchesTime;
    });

    // Calculate statistics
    const stats = {
        total: filteredInvoices.length,
        totalAmount: filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        totalAdvance: filteredInvoices.reduce((sum, inv) => sum + (inv.totalAdvance || 0), 0),
        totalBalance: filteredInvoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
        paid: filteredInvoices.filter(inv => inv.balance === 0).length,
        pending: filteredInvoices.filter(inv => inv.balance > 0).length
    };

    return (
        <div className="invoices-container">
            <div className="invoices-card">
                <div className="invoices-header">
                    <div className="header-title">
                        <h3>Invoice Management</h3>
                        <p>
                            Total: <span className="total-count">{invoices.length}</span> invoices
                        </p>
                    </div>
                    <div className="header-actions">
                        <button
                            onClick={handleExport}
                            className="export-btn"
                        >
                            <Download size={18} />
                            Export
                        </button>
                        <button
                            onClick={handleAdd}
                            className="new-invoice-btn"
                        >
                            <Plus size={18} />
                            New Invoice
                        </button>
                    </div>
                </div>

                <div className="tool-bar">
                    <div className="search-filter-bar">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by customer, site, vehicle, or pavati no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filters">
                            <select
                                value={filterProduct}
                                onChange={(e) => setFilterProduct(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Products</option>
                                {uniqueProducts.map(product => (
                                    <option key={product} value={product}>{product}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                            </select>
                            <select
                                value={filterTime}
                                onChange={(e) => setFilterTime(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="stats-summary">
                        <div className="summary-card">
                            <div className="summary-label">
                                <FileText size={16} />
                                <span>Invoices</span>
                            </div>
                            <p className="summary-value text-slate-900">{stats.total}</p>
                        </div>
                        <div className="summary-card">
                            <p className="summary-label">Total Amount</p>
                            <p className="summary-value text-slate-900">₹ {stats.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="summary-card">
                            <p className="summary-label">Advance</p>
                            <p className="summary-value text-green-700">₹ {stats.totalAdvance.toLocaleString()}</p>
                        </div>
                        <div className="summary-card">
                            <p className="summary-label">Balance</p>
                            <p className="summary-value text-red-700">₹ {stats.totalBalance.toLocaleString()}</p>
                        </div>
                        <div className="summary-card">
                            <p className="summary-label">Paid</p>
                            <p className="summary-value text-green-700">{stats.paid}</p>
                        </div>
                        <div className="summary-card">
                            <p className="summary-label">Pending</p>
                            <p className="summary-value text-red-700">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Date</th>
                                <th>Product</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Rate</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Advance</th>
                                <th className="text-right">Balance</th>
                                <th>Pavati No.</th>
                                <th>Customer</th>
                                <th>Site</th>
                                <th>Vehicle</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice, index) => (
                                <tr
                                    key={invoice.id || invoice.id}
                                    className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        {new Date(invoice.date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit'
                                        })}
                                    </td>
                                    <td>{(invoice.items || []).map(i => i.product).join(', ') || 'N/A'}</td>
                                    <td className="text-right">{(invoice.items || []).reduce((s, i) => s + Number(i.quantity), 0).toLocaleString()}</td>
                                    <td className="text-right">-</td>
                                    <td className="text-right">₹ {(invoice.totalAmount || 0).toLocaleString()}</td>
                                    <td className="text-right text-green-700">₹ {(invoice.totalAdvance || 0).toLocaleString()}</td>
                                    <td className="text-right">
                                        {invoice.balance > 0 ? (
                                            <span className="text-red-700">₹ {(invoice.balance || 0).toLocaleString()}</span>
                                        ) : (
                                            <span className="text-green-700">Paid</span>
                                        )}
                                    </td>
                                    <td>{invoice.pavatiNo}</td>
                                    <td>{invoice.customerName}</td>
                                    <td>{invoice.site}</td>
                                    <td>{invoice.vehicleNo}</td>
                                    <td>
                                        <div className="cell-actions">
                                            <button
                                                onClick={() => handleView(invoice)}
                                                className="action-btn"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(invoice)}
                                                className="action-btn"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(invoice)}
                                                className="action-btn"
                                                title="Add more Orders"
                                            >
                                                <CirclePlus size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleWhatsAppShare(invoice)}
                                                className="action-btn wa-btn"
                                                title="Share on WhatsApp"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(invoice.id)}
                                                className="action-btn delete-btn"
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

                {filteredInvoices.length === 0 && (
                    <div className="empty-state">
                        <FileText size={48} className="empty-icon" />
                        <p className="empty-text">No invoices found</p>
                        <p className="empty-subtext">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
