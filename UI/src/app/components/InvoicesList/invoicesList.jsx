import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, Download, Search, Filter, FileText, Loader2, CirclePlus, MessageCircle } from 'lucide-react';
import { invoiceAPI, customerAPI } from '@/services/api';
import { InvoiceForm } from '../InvoiceForm/invoiceForm';
import { InvoiceDetailView } from '../InvoiceDetailView/invoiceDetailView';
import { shareInvoiceOnWhatsApp } from '../../../utils/whatsapp';
import * as XLSX from 'xlsx';
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

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
        if (customer && (customer.whatsappNumber || customer.phone || customer.mobile)) {
            const targetNumber = customer.whatsappNumber || customer.phone || customer.mobile;
            shareInvoiceOnWhatsApp(invoice, targetNumber);
        } else {
            alert("Customer phone number not found in database.");
        }
    };

    const handleExport = () => {
        if (filteredInvoices.length === 0) {
            alert('No data to export');
            return;
        }

        const exportData = filteredInvoices.map((inv, index) => {
            const dateStr = inv.date 
                ? new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-') 
                : '';
            
            const product = inv.items && inv.items.length > 0 ? inv.items[0].product : '';
            const quantity = inv.items && inv.items.length > 0 ? inv.items[0].quantity : '';
            const rate = inv.items && inv.items.length > 0 ? inv.items[0].rate : '';

            const customer = customers.find(c => c.name === inv.customerName);
            const contactNo = customer ? (customer.phone || customer.mobile || '') : '';
            const whatsappNo = customer ? (customer.whatsappNumber || '') : '';

            return {
                'S. No.': index + 1,
                'Date': dateStr,
                'Product': product,
                'Quantity': quantity,
                'Rate': rate,
                'Amount': inv.totalAmount || 0,
                'Advance': inv.totalAdvance || 0,
                'Balance': inv.balance || 0,
                'Pavati N.': inv.pavatiNo || '',
                'Customer Name': inv.customerName || '',
                'Contact No.': contactNo,
                'WhatsApp No.': whatsappNo,
                'Site': inv.site || '',
                'Vehicle No.': inv.vehicleNo || '',
                'Marfat': inv.marfat || '',
                'Remarks': inv.remarks || ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        const wscols = [
            {wch: 8},  // S.No
            {wch: 12}, // Date
            {wch: 22}, // Product
            {wch: 10}, // Qty
            {wch: 10}, // Rate
            {wch: 12}, // Amount
            {wch: 12}, // Advance
            {wch: 12}, // Balance
            {wch: 12}, // Pavati
            {wch: 22}, // Customer Name
            {wch: 18}, // Contact No
            {wch: 18}, // WhatsApp No
            {wch: 22}, // Site
            {wch: 15}, // Vehicle No
            {wch: 15}, // Marfat
            {wch: 25}  // Remarks
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

        XLSX.writeFile(workbook, `Invoices_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };



    // Get unique products for filter dropdown (from items array)
    const uniqueProducts = useMemo(() => {
        if (!Array.isArray(invoices)) return [];
        return [...new Set(invoices.flatMap(inv => (inv?.items || []).map(item => item?.product)).filter(Boolean))];
    }, [invoices]);

    // Filter invoices
    const filteredInvoices = useMemo(() => {
        if (!Array.isArray(invoices)) return [];
        return invoices.filter(invoice => {
            if (!invoice) return false;
            
            const matchesSearch =
                (invoice.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.site || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.pavatiNo || '').toString().includes(searchTerm);

            const matchesProduct = filterProduct === 'all' || (invoice.items || []).some(i => i?.product === filterProduct);
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'paid' && Number(invoice.balance || 0) === 0) ||
                (filterStatus === 'pending' && Number(invoice.balance || 0) > 0);

            const matchesTime = (() => {
                if (!invoice.date) return true;
                const invDate = new Date(invoice.date);
                if (isNaN(invDate.getTime())) return true;
                invDate.setHours(0, 0, 0, 0);

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (invDate < start) return false;
                }
                
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(0, 0, 0, 0);
                    if (invDate > end) return false;
                }
                
                return true;
            })();

            return matchesSearch && matchesProduct && matchesStatus && matchesTime;
        });
    }, [invoices, searchTerm, filterProduct, filterStatus, startDate, endDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterProduct, filterStatus, startDate, endDate]);

    const totalPages = Math.ceil((filteredInvoices || []).length / itemsPerPage);
    const paginatedInvoices = (filteredInvoices || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Calculate statistics
    const stats = useMemo(() => {
        const list = filteredInvoices || [];
        return {
            total: list.length,
            totalAmount: list.reduce((sum, inv) => sum + Number(inv?.totalAmount || 0), 0),
            totalAdvance: list.reduce((sum, inv) => sum + Number(inv?.totalAdvance || 0), 0),
            totalBalance: list.reduce((sum, inv) => sum + Number(inv?.balance || 0), 0),
            paid: list.filter(inv => Number(inv?.balance || 0) === 0).length,
            pending: list.filter(inv => Number(inv?.balance || 0) > 0).length
        };
    }, [filteredInvoices]);

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
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 font-medium">From:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="filter-select"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 font-medium">To:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="filter-select"
                                />
                            </div>
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
                            {paginatedInvoices.map((invoice, index) => (
                                <tr
                                    key={invoice.uuid || invoice.id || invoice._id || index}
                                    className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                                >
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>
                                        {invoice?.date && !isNaN(new Date(invoice.date).getTime())
                                            ? new Date(invoice.date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: '2-digit'
                                            })
                                            : 'N/A'}
                                    </td>
                                    <td>{(invoice.items || []).map(i => i.product).join(', ') || 'N/A'}</td>
                                    <td className="text-right">{(invoice.items || []).reduce((s, i) => s + Number(i.quantity), 0).toLocaleString()}</td>
                                    <td className="text-right">{(invoice.items || []).map(i => i.rate ? `₹ ${Number(i.rate).toFixed(2)}` : '-').join(', ') || '-'}</td>
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

                {filteredInvoices.length > itemsPerPage && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                        <div className="text-sm text-gray-600">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} entries
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(p => p - 1)}
                                style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155' }}
                            >
                                Previous
                            </button>
                            <button 
                                disabled={currentPage === totalPages || totalPages === 0} 
                                onClick={() => setCurrentPage(p => p + 1)}
                                style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', backgroundColor: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : 'white', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#334155' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

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
