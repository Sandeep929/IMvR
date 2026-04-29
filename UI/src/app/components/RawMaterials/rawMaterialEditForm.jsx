import { useState } from 'react';
import { Edit, Package, Save, X, Loader2 } from 'lucide-react';
import { rawMaterialAPI } from '../../../services/api';

export function RawMaterialEditForm({ expense, onSuccess, onClose }) {
    const [form, setForm] = useState({
        date: expense?.date?.split('T')[0] || '',
        materialName: expense?.materialName || '',
        quantity: expense?.quantity?.toString() || '',
        rate: expense?.rate?.toString() || '',
        supplier: expense?.supplier || '',
        notes: expense?.notes || '',
        currentStock: ''
    });
    const [tab, setTab] = useState('expense'); // 'expense' | 'stock'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalCost = (parseFloat(form.quantity) || 0) * (parseFloat(form.rate) || 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveExpense = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await rawMaterialAPI.updateExpense(expense.uuid, {
                date: form.date,
                materialName: form.materialName,
                quantity: parseFloat(form.quantity),
                rate: parseFloat(form.rate),
                supplier: form.supplier,
                notes: form.notes
            });
            onSuccess('Expense updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update expense.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        setError('');
        if (form.currentStock === '') {
            setError('Please enter a stock quantity.');
            return;
        }
        setLoading(true);
        try {
            await rawMaterialAPI.updateQuantity(expense.uuid, {
                currentStock: parseFloat(form.currentStock)
            });
            onSuccess('Stock updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update stock.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rm-modal">
                <div className="rm-modal-header">
                    <h3>{expense?.materialName}</h3>
                    <button className="rm-modal-close" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="rm-tab-group" style={{ marginBottom: '1.5rem' }}>
                    <button
                        className={`rm-tab ${tab === 'expense' ? 'active' : ''}`}
                        onClick={() => setTab('expense')}
                    >
                        <Edit size={14} />
                        Edit Expense
                    </button>
                    <button
                        className={`rm-tab ${tab === 'stock' ? 'active' : ''}`}
                        onClick={() => setTab('stock')}
                    >
                        <Package size={14} />
                        Update Stock
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.6rem 1rem',
                        marginBottom: '1rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* ── Edit expense tab ──────────────────────────────────── */}
                {tab === 'expense' && (
                    <form onSubmit={handleSaveExpense}>
                        <div className="rm-form-grid">
                            <div className="rm-form-group">
                                <label>Date</label>
                                <input type="date" name="date" value={form.date} onChange={handleChange} />
                            </div>
                            <div className="rm-form-group">
                                <label>Material Name</label>
                                <input type="text" name="materialName" value={form.materialName} onChange={handleChange} />
                            </div>
                            <div className="rm-form-group">
                                <label>Quantity</label>
                                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="any" />
                            </div>
                            <div className="rm-form-group">
                                <label>Rate (₹)</label>
                                <input type="number" name="rate" value={form.rate} onChange={handleChange} min="0" step="any" />
                            </div>
                            <div className="rm-form-group">
                                <label>Total Cost (auto)</label>
                                <div className="rm-total-display">
                                    ₹ {totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="rm-form-group">
                                <label>Supplier</label>
                                <input type="text" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" />
                            </div>
                            <div className="rm-form-group" style={{ gridColumn: '1/-1' }}>
                                <label>Notes</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
                            </div>
                        </div>
                        <div className="rm-form-actions">
                            <button type="button" className="rm-btn-secondary" onClick={onClose}>
                                <X size={15} /> Cancel
                            </button>
                            <button type="submit" className="rm-btn-primary" disabled={loading}>
                                {loading
                                    ? <><Loader2 size={15} className="spinner" /> Saving...</>
                                    : <><Save size={15} /> Save Changes</>
                                }
                            </button>
                        </div>
                    </form>
                )}

                {/* ── Update stock tab ──────────────────────────────────── */}
                {tab === 'stock' && (
                    <form onSubmit={handleUpdateStock}>
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: 'var(--hover-bg)',
                            border: '1px solid var(--border-color)',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Set the <strong style={{ color: 'var(--text-main)' }}>current stock level</strong> for{' '}
                            <strong style={{ color: 'var(--text-main)' }}>{expense?.materialName}</strong>.
                            This overrides the running total for physical stock corrections.
                        </div>
                        <div className="rm-form-group" style={{ marginBottom: '1.25rem' }}>
                            <label>Current Stock Quantity</label>
                            <input
                                type="number"
                                name="currentStock"
                                value={form.currentStock}
                                onChange={handleChange}
                                placeholder="Enter actual stock on hand"
                                min="0"
                                step="any"
                                autoFocus
                            />
                        </div>
                        <div className="rm-form-actions">
                            <button type="button" className="rm-btn-secondary" onClick={onClose}>
                                <X size={15} /> Cancel
                            </button>
                            <button type="submit" className="rm-btn-primary" disabled={loading}>
                                {loading
                                    ? <><Loader2 size={15} className="spinner" /> Updating...</>
                                    : <><Package size={15} /> Update Stock</>
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
