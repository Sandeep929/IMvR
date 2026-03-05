import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, DollarSign, X, AlertTriangle, Loader2 } from 'lucide-react';
import { productAPI } from '@/services/api';
import './products.css';
export function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStock, setFilterStock] = useState('all');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await productAPI.getAll();
            setProducts(res.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (product) => {
        if (product.currentStock <= 0) return 'out-of-stock';
        if (product.currentStock < product.minStock) return 'low-stock';
        return 'in-stock';
    };

    const filteredProducts = products.filter(product => {
        const productStockStatus = getStockStatus(product);
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesStock = filterStock === 'all' || productStockStatus === filterStock;
        return matchesCategory && matchesStock;
    });

    const stats = {
        total: products.length,
        totalRevenue: 0, // In real app, this should come from analytics or backend
        totalSold: 0,    // In real app, this should come from analytics or backend
        lowStock: products.filter(p => getStockStatus(p) === 'low-stock').length
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(id);
                setProducts(products.filter(p => p._id !== id));
            } catch (err) {
                alert('Error deleting product: ' + err.message);
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingProduct) {
                const res = await productAPI.update(editingProduct._id, formData);
                setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
            } else {
                const res = await productAPI.create(formData);
                setProducts([res.data, ...products]);
            }
            setShowForm(false);
            setEditingProduct(null);
        } catch (err) {
            alert('Error saving product: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="products-container">
                <div className="dashboard-loading">
                    <Loader2 size={40} className="spinner" />
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    if (showForm) {
        return <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="products-container">
            <div className="products-header-stats">
                <div className="products-stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-slate-900">
                                <Package size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Total Products</p>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-blue-600">
                                <DollarSign size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Available Items</p>
                                <p className="stat-value">{products.filter(p => p.currentStock > 0).length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-green-600">
                                <TrendingUp size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Stock Value</p>
                                <p className="stat-value">₹ {products.reduce((sum, p) => sum + (p.currentStock * p.rate), 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon-box bg-red-600">
                                <AlertTriangle size={20} className="stat-icon" />
                            </div>
                            <div>
                                <p className="stat-label">Low Stock Items</p>
                                <p className="stat-value">{stats.lowStock}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="products-content">
                {error && <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 mb-4">{error}</div>}

                <div className="content-header">
                    <div className="content-title">
                        <h3>Product Catalog</h3>
                        <p>Manage inventory and product information</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="add-btn"
                    >
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>

                <div className="filter-section">
                    <div className="filter-controls">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Categories</option>
                            <option value="Fresh">Fresh Bricks</option>
                            <option value="Khanjar">Khanjar</option>
                            <option value="Standard">Standard</option>
                        </select>
                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Stock Status</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="products-grid">
                    {filteredProducts.map((product) => {
                        const status = getStockStatus(product);
                        return (
                            <div key={product._id} className="product-card">
                                <div className="product-card-body">
                                    <div className="product-header">
                                        <div className="product-info">
                                            <div className="product-icon-box">
                                                <Package size={24} className="stat-icon" />
                                            </div>
                                            <div>
                                                <h4 className="product-name">{product.name}</h4>
                                                <p className="product-category">{product.category}</p>
                                            </div>
                                        </div>
                                        <div className="product-actions">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="action-btn action-btn-edit"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="action-btn action-btn-delete"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="product-description">{product.description}</p>

                                    <div className="product-stats">
                                        <div>
                                            <p className="stat-label-mini">Rate</p>
                                            <p className="stat-value-mini">₹ {product.rate}</p>
                                        </div>
                                        <div>
                                            <p className="stat-label-mini">Stock</p>
                                            <p className="stat-value-mini">{product.currentStock?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="stat-label-mini">Value</p>
                                            <p className="stat-value-mini">₹ {(product.currentStock * product.rate).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="product-footer">
                                        <div className="stock-status-row">
                                            <span className="status-label">Stock Status</span>
                                            <span className={`status-badge ${status === 'in-stock'
                                                ? 'status-in-stock'
                                                : status === 'low-stock'
                                                    ? 'status-low-stock'
                                                    : 'status-out-of-stock'
                                                }`}>
                                                {status.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <div className="stock-details">
                                            <span>Current: {product.currentStock?.toLocaleString()}</span>
                                            <span>Min: {product.minStock?.toLocaleString()}</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div
                                                className={`progress-bar-fill ${status === 'in-stock'
                                                    ? 'progress-green'
                                                    : status === 'low-stock'
                                                        ? 'progress-yellow'
                                                        : 'progress-red'
                                                    }`}
                                                style={{ width: `${Math.min((product.currentStock / (product.minStock * 2)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ProductForm({ product, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || 'Standard',
        description: product?.description || '',
        rate: product?.rate || 0,
        unit: product?.unit || 'piece',
        minStock: product?.minStock || 10000,
        currentStock: product?.currentStock || 0
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['rate', 'minStock', 'currentStock'].includes(name) ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <div className="form-header">
                    <div className="form-title">
                        <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
                        <p>Fill in the product details below</p>
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
                        <div className="form-group-grid">
                            <div>
                                <label className="form-label">
                                    Product Name <span className="required-star">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Category <span className="required-star">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="form-select"
                                >
                                    <option value="Fresh">Fresh Bricks</option>
                                    <option value="Khanjar">Khanjar</option>
                                    <option value="Standard">Standard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="form-textarea"
                                placeholder="Enter product description"
                            />
                        </div>

                        <div className="form-group-grid">
                            <div>
                                <label className="form-label">
                                    Rate (₹) <span className="required-star">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={formData.rate}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Unit <span className="required-star">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="piece, kg, etc."
                                />
                            </div>
                        </div>

                        <div className="form-group-grid">
                            <div>
                                <label className="form-label">
                                    Minimum Stock Level <span className="required-star">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="minStock"
                                    value={formData.minStock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Current Stock <span className="required-star">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="currentStock"
                                    value={formData.currentStock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>
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
                            {saving ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
