import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { rawMaterialAPI } from '../../../services/api';

const MATERIALS_LIST = [
    'Cement', 'Sand', 'Gravel', 'Brick', 'Steel', 'Lime',
    'Clay', 'Fly Ash', 'Water', 'Coal', 'Other'
];

export function RawMaterialForm({ onSuccess, onCancel }) {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        materialName: '',
        customMaterial: '',
        quantity: '',
        rate: '',
        supplier: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalCost = (parseFloat(form.quantity) || 0) * (parseFloat(form.rate) || 0);
    const effectiveMaterial = form.materialName === 'Other' ? form.customMaterial : form.materialName;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.date || !effectiveMaterial || !form.quantity || !form.rate) {
            setError('Date, Material, Quantity, and Rate are required.');
            return;
        }
        setLoading(true);
        try {
            await rawMaterialAPI.createExpense({
                date: form.date,
                materialName: effectiveMaterial,
                quantity: parseFloat(form.quantity),
                rate: parseFloat(form.rate),
                supplier: form.supplier,
                notes: form.notes
            });
            onSuccess('Expense added successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save expense.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rm-card">
            <p className="rm-card-title">Add Raw Material Expense</p>

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

            <form onSubmit={handleSubmit}>
                <div className="rm-form-grid">
                    {/* Date */}
                    <div className="rm-form-group">
                        <label>Date *</label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Material */}
                    <div className="rm-form-group">
                        <label>Material *</label>
                        <select name="materialName" value={form.materialName} onChange={handleChange} required>
                            <option value="">Select material...</option>
                            {MATERIALS_LIST.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Custom material if "Other" */}
                    {form.materialName === 'Other' && (
                        <div className="rm-form-group">
                            <label>Material Name *</label>
                            <input
                                type="text"
                                name="customMaterial"
                                value={form.customMaterial}
                                onChange={handleChange}
                                placeholder="Enter material name"
                                required
                            />
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="rm-form-group">
                        <label>Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="any"
                            required
                        />
                    </div>

                    {/* Rate */}
                    <div className="rm-form-group">
                        <label>Rate (₹ per unit) *</label>
                        <input
                            type="number"
                            name="rate"
                            value={form.rate}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="any"
                            required
                        />
                    </div>

                    {/* Total cost — auto */}
                    <div className="rm-form-group">
                        <label>Total Cost (auto)</label>
                        <div className="rm-total-display">
                            ₹ {totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Supplier */}
                    <div className="rm-form-group">
                        <label>Supplier</label>
                        <input
                            type="text"
                            name="supplier"
                            value={form.supplier}
                            onChange={handleChange}
                            placeholder="Supplier name"
                        />
                    </div>

                    {/* Notes */}
                    <div className="rm-form-group" style={{ gridColumn: '1/-1' }}>
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Optional notes..."
                            rows={2}
                        />
                    </div>
                </div>

                <div className="rm-form-actions">
                    {onCancel && (
                        <button type="button" className="rm-btn-secondary" onClick={onCancel}>
                            <X size={15} />
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="rm-btn-primary" disabled={loading}>
                        {loading
                            ? <><Loader2 size={15} className="spinner" /> Saving...</>
                            : <><Plus size={15} /> Add Expense</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
