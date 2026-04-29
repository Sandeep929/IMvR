import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, Edit, Trash2,
    BarChart3, ClipboardList, Loader2, CheckCircle, XCircle,
    Package, Download, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { rawMaterialAPI } from '../../../services/api';
import { RawMaterialForm } from './rawMaterialForm';
import { RawMaterialEditForm } from './rawMaterialEditForm';
import { RawMaterialAnalytics } from './rawMaterialAnalytics';
import './rawMaterials.css';

export function RawMaterials() {
    const [activeTab, setActiveTab] = useState('list');
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');

    // Date filter state (empty = all time)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await rawMaterialAPI.getExpenses();
            setExpenses(res.data.data || []);
        } catch {
            showToast('Failed to load expenses.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSuccess = (msg) => {
        showToast(msg);
        setEditTarget(null);
        setActiveTab('list');
        fetchExpenses();
    };

    const handleDelete = async (expense) => {
        if (!window.confirm(`Delete expense for "${expense.materialName}" on ${expense.date?.split('T')[0]}?`)) return;
        try {
            await rawMaterialAPI.deleteExpense(expense.uuid);
            showToast('Expense deleted.');
            fetchExpenses();
        } catch {
            showToast('Failed to delete expense.', 'error');
        }
    };

    // ── Filter expenses by search + date range ────────────────────────────────
    const filtered = expenses.filter(e => {
        const matchesSearch =
            !search ||
            e.materialName?.toLowerCase().includes(search.toLowerCase()) ||
            e.supplier?.toLowerCase().includes(search.toLowerCase());

        const expDate = e.date?.split('T')[0] || e.date || '';
        const matchesStart = !startDate || expDate >= startDate;
        const matchesEnd   = !endDate   || expDate <= endDate;

        return matchesSearch && matchesStart && matchesEnd;
    });

    // ── Summary stats (from filtered list) ───────────────────────────────────
    const totalSpend  = expenses.reduce((s, e) => s + (e.totalCost || 0), 0);
    const uniqueMats  = new Set(expenses.map(e => e.materialName)).size;
    const thisMonth   = new Date().toISOString().slice(0, 7);
    const monthSpend  = expenses
        .filter(e => e.date?.startsWith(thisMonth))
        .reduce((s, e) => s + (e.totalCost || 0), 0);

    const filteredSpend = filtered.reduce((s, e) => s + (e.totalCost || 0), 0);

    // ── Excel download ─────────────────────────────────────────────────────────
    const handleDownload = () => {
        if (filtered.length === 0) {
            showToast('No records to export for this period.', 'error');
            return;
        }

        const exportData = filtered.map((exp, idx) => ({
            'S. No.': idx + 1,
            'Date': exp.date?.split('T')[0] || exp.date || '',
            'Material': exp.materialName || '',
            'Quantity': exp.quantity ?? '',
            'Rate (₹)': exp.rate ?? '',
            'Total Cost (₹)': exp.totalCost ?? '',
            'Supplier': exp.supplier || '',
            'Notes': exp.notes || ''
        }));

        // Summary row at the bottom
        exportData.push({});
        exportData.push({
            'S. No.': '',
            'Date': '',
            'Material': 'TOTAL',
            'Quantity': filtered.reduce((s, e) => s + (e.quantity || 0), 0),
            'Rate (₹)': '',
            'Total Cost (₹)': filteredSpend,
            'Supplier': '',
            'Notes': ''
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Column widths
        worksheet['!cols'] = [
            { wch: 7 },   // S.No
            { wch: 13 },  // Date
            { wch: 20 },  // Material
            { wch: 10 },  // Qty
            { wch: 12 },  // Rate
            { wch: 15 },  // Total Cost
            { wch: 22 },  // Supplier
            { wch: 30 },  // Notes
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Raw Material Expenses');

        const fromLabel = startDate || 'all';
        const toLabel   = endDate   || 'all';
        XLSX.writeFile(workbook, `RawMaterial_Statement_${fromLabel}_to_${toLabel}.xlsx`);
    };

    return (
        <div className="rm-container">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="rm-header">
                <h2>Raw Material Expenses</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="rm-tab-group">
                        <button
                            className={`rm-tab ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            <ClipboardList size={15} />
                            Expenses
                        </button>
                        <button
                            className={`rm-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart3 size={15} />
                            Analytics
                        </button>
                    </div>
                    {activeTab === 'list' && (
                        <button
                            className="rm-btn-primary"
                            onClick={() => setActiveTab(activeTab === 'add' ? 'list' : 'add')}
                        >
                            <Plus size={16} />
                            {activeTab === 'add' ? 'Back' : 'Add Expense'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Summary stat cards ──────────────────────────────────── */}
            {activeTab === 'list' && (
                <div className="rm-stat-row">
                    <div className="rm-stat-card blue">
                        <div className="rm-stat-label">Total Records</div>
                        <div className="rm-stat-value">{expenses.length}</div>
                        <div className="rm-stat-sub">all time</div>
                    </div>
                    <div className="rm-stat-card green">
                        <div className="rm-stat-label">This Month</div>
                        <div className="rm-stat-value">
                            ₹{monthSpend >= 100000
                                ? (monthSpend / 100000).toFixed(1) + 'L'
                                : monthSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="rm-stat-sub">spent so far</div>
                    </div>
                    <div className="rm-stat-card amber">
                        <div className="rm-stat-label">Total Spend</div>
                        <div className="rm-stat-value">
                            ₹{totalSpend >= 100000
                                ? (totalSpend / 100000).toFixed(1) + 'L'
                                : totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="rm-stat-sub">all time</div>
                    </div>
                    <div className="rm-stat-card red">
                        <div className="rm-stat-label">Materials</div>
                        <div className="rm-stat-value">{uniqueMats}</div>
                        <div className="rm-stat-sub">unique tracked</div>
                    </div>
                </div>
            )}

            {/* ── Add form ───────────────────────────────────────────── */}
            {activeTab === 'add' && (
                <RawMaterialForm
                    onSuccess={handleSuccess}
                    onCancel={() => setActiveTab('list')}
                />
            )}

            {/* ── Expense list ───────────────────────────────────────── */}
            {activeTab === 'list' && (
                <div className="invoices-card">

                    {/* Toolbar — search + date filters + export */}
                    <div className="invoices-header">
                        <div className="header-title">
                            <h3>Expense Records</h3>
                            <p>
                                Showing <span className="total-count">{filtered.length}</span> of{' '}
                                <span className="total-count">{expenses.length}</span> records
                                {(startDate || endDate) && (
                                    <span> &mdash; Total: <strong>₹{filteredSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
                                )}
                            </p>
                        </div>
                        <div className="header-actions">
                            <button className="export-btn" onClick={handleDownload}>
                                <Download size={16} />
                                Export Statement
                            </button>
                        </div>
                    </div>

                    <div className="tool-bar">
                        <div className="search-filter-bar">
                            {/* Search */}
                            <div className="search-box">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by material or supplier..."
                                />
                            </div>

                            {/* Date range filters */}
                            <div className="filters">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <label className="text-sm text-gray-600 font-medium">From:</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="filter-select"
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <label className="text-sm text-gray-600 font-medium">To:</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="filter-select"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        className="export-btn"
                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="dashboard-loading">
                            <Loader2 size={36} className="spinner" />
                            <p>Loading expenses...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} className="empty-icon" />
                            <p className="empty-text">
                                {search || startDate || endDate ? 'No results found.' : 'No expenses recorded yet.'}
                            </p>
                            <p className="empty-subtext">
                                {search || startDate || endDate
                                    ? 'Try adjusting your search or date range.'
                                    : 'Click "Add Expense" to begin.'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="invoices-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Date</th>
                                        <th>Material</th>
                                        <th className="text-right">Qty</th>
                                        <th className="text-right">Rate (₹)</th>
                                        <th className="text-right">Total Cost</th>
                                        <th>Supplier</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((exp, index) => (
                                        <tr
                                            key={exp.uuid}
                                            className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                                        >
                                            <td>{index + 1}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {exp.date?.split('T')[0] || exp.date}
                                            </td>
                                            <td>
                                                <span className="rm-badge rm-badge-blue">{exp.materialName}</span>
                                            </td>
                                            <td className="text-right">
                                                {exp.quantity?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-right">
                                                ₹{exp.rate?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>
                                                ₹{exp.totalCost?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>
                                                {exp.supplier || '—'}
                                            </td>
                                            <td>
                                                <div className="cell-actions">
                                                    <button
                                                        className="action-btn"
                                                        title="Edit"
                                                        onClick={() => setEditTarget(exp)}
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        title="Delete"
                                                        onClick={() => handleDelete(exp)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Inline total footer row */}
                                <tfoot>
                                    <tr style={{
                                        background: 'var(--table-header-bg)',
                                        borderTop: '2px solid var(--border-color)',
                                        fontWeight: 700
                                    }}>
                                        <td colSpan={3} style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                            Total ({filtered.length} records)
                                        </td>
                                        <td className="text-right" style={{ padding: '0.75rem 1rem' }}>
                                            {filtered.reduce((s, e) => s + (e.quantity || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-right" style={{ padding: '0.75rem 1rem' }} />
                                        <td className="text-right" style={{ padding: '0.75rem 1rem' }}>
                                            ₹{filteredSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Analytics dashboard ─────────────────────────────────── */}
            {activeTab === 'analytics' && <RawMaterialAnalytics />}

            {/* ── Edit modal ──────────────────────────────────────────── */}
            {editTarget && (
                <RawMaterialEditForm
                    expense={editTarget}
                    onSuccess={handleSuccess}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {/* ── Toast ───────────────────────────────────────────────── */}
            {toast && (
                <div className={`rm-toast ${toast.type}`}>
                    {toast.type === 'success'
                        ? <CheckCircle size={15} style={{ display: 'inline', marginRight: '0.4rem' }} />
                        : <XCircle size={15} style={{ display: 'inline', marginRight: '0.4rem' }} />
                    }
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
