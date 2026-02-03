import { useState } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, DollarSign, X, AlertTriangle } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  rate: number;
  unit: string;
  totalSold: number;
  revenue: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  minStock: number;
  currentStock: number;
}

export function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');

  // Generate product data from invoices
  const productsMap = new Map<string, Product>();
  let productId = 1;

  mockInvoices.forEach(invoice => {
    if (!productsMap.has(invoice.product)) {
      productsMap.set(invoice.product, {
        id: productId++,
        name: invoice.product,
        category: invoice.product.includes('Fresh') ? 'Fresh' : invoice.product.includes('Khanjar') ? 'Khanjar' : 'Standard',
        description: `High quality ${invoice.product.toLowerCase()} for construction`,
        rate: invoice.rate,
        unit: 'piece',
        totalSold: 0,
        revenue: 0,
        stockStatus: 'in-stock',
        minStock: 10000,
        currentStock: Math.floor(Math.random() * 50000) + 20000
      });
    }

    const product = productsMap.get(invoice.product)!;
    product.totalSold += invoice.quantity;
    product.revenue += invoice.amount;
    
    // Update stock status
    if (product.currentStock < product.minStock) {
      product.stockStatus = 'low-stock';
    } else if (product.currentStock === 0) {
      product.stockStatus = 'out-of-stock';
    }
  });

  const products = Array.from(productsMap.values());

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStock = filterStock === 'all' || product.stockStatus === filterStock;
    return matchesCategory && matchesStock;
  });

  const stats = {
    total: products.length,
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    totalSold: products.reduce((sum, p) => sum + p.totalSold, 0),
    lowStock: products.filter(p => p.stockStatus === 'low-stock').length
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      alert('Product deleted');
    }
  };

  if (showForm) {
    return <ProductForm product={editingProduct} onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="p-8 bg-slate-50">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Total Products</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl text-slate-900">₹ {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Total Sold</p>
                <p className="text-2xl text-slate-900">{stats.totalSold.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Low Stock Items</p>
                <p className="text-2xl text-slate-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-slate-900 mb-1">Product Catalog</h3>
            <p className="text-sm text-slate-600">Manage inventory and product information</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Categories</option>
              <option value="Fresh">Fresh Bricks</option>
              <option value="Khanjar">Khanjar</option>
              <option value="Standard">Standard</option>
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <Package size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-base text-slate-900 mb-1">{product.name}</h4>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">{product.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">Rate</p>
                    <p className="text-lg text-slate-900">₹ {product.rate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">Total Sold</p>
                    <p className="text-lg text-slate-900">{product.totalSold.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">Revenue</p>
                    <p className="text-lg text-slate-900">₹ {product.revenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 uppercase tracking-wide">Stock Status</span>
                    <span className={`px-2 py-1 text-xs uppercase tracking-wide ${
                      product.stockStatus === 'in-stock' 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : product.stockStatus === 'low-stock'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {product.stockStatus.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Current: {product.currentStock.toLocaleString()}</span>
                    <span className="text-slate-600">Min: {product.minStock.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 h-2">
                    <div 
                      className={`h-2 ${
                        product.stockStatus === 'in-stock' 
                          ? 'bg-green-600' 
                          : product.stockStatus === 'low-stock' 
                          ? 'bg-yellow-600' 
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min((product.currentStock / (product.minStock * 2)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ product, onCancel }: { product: Product | null; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Standard',
    description: product?.description || '',
    rate: product?.rate || 0,
    unit: product?.unit || 'piece',
    minStock: product?.minStock || 10000,
    currentStock: product?.currentStock || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Product saved successfully');
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['rate', 'minStock', 'currentStock'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="p-8 bg-slate-50">
      <div className="bg-white border border-slate-200 max-w-3xl mx-auto">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-slate-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
            <p className="text-sm text-slate-600 mt-0.5">Fill in the product details below</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Product Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Fresh">Fresh Bricks</option>
                  <option value="Khanjar">Khanjar</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Rate (₹) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Unit <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="piece, kg, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Minimum Stock Level <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Current Stock <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
