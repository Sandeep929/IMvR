import { useState } from 'react';
import { Plus, Edit, Trash2, Phone, MapPin, FileText, DollarSign, TrendingUp, User, X, Mail } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  lastInvoiceDate: string;
}

export function Customers() {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate customer data from invoices
  const customersMap = new Map<string, Customer>();
  let customerId = 1;

  mockInvoices.forEach(invoice => {
    if (!customersMap.has(invoice.customerName)) {
      customersMap.set(invoice.customerName, {
        id: customerId++,
        name: invoice.customerName,
        phone: invoice.vehicleNo, // Using vehicle as phone placeholder
        email: `${invoice.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        address: invoice.site,
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        balance: 0,
        lastInvoiceDate: invoice.date
      });
    }

    const customer = customersMap.get(invoice.customerName)!;
    customer.totalInvoices++;
    customer.totalAmount += invoice.amount;
    customer.totalPaid += invoice.advance;
    customer.balance += invoice.balance;
    
    if (new Date(invoice.date) > new Date(customer.lastInvoiceDate)) {
      customer.lastInvoiceDate = invoice.date;
    }
  });

  const customers = Array.from(customersMap.values());

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.balance > 0).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalAmount, 0),
    avgRevenue: customers.reduce((sum, c) => sum + c.totalAmount, 0) / customers.length
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      // In real app, would delete from state
      alert('Customer deleted');
    }
  };

  if (showForm) {
    return <CustomerForm customer={editingCustomer} onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="p-8 bg-slate-50">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Total Customers</p>
                <p className="text-2xl text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Active Customers</p>
                <p className="text-2xl text-slate-900">{stats.active}</p>
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
              <div className="w-10 h-10 bg-slate-100 flex items-center justify-center">
                <DollarSign size={20} className="text-slate-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Avg per Customer</p>
                <p className="text-2xl text-slate-900">₹ {Math.round(stats.avgRevenue).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-slate-900 mb-1">Customer Management</h3>
            <p className="text-sm text-slate-600">Manage all customer records and transactions</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Address</th>
                <th className="text-center px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Invoices</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Total Amount</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Paid</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Balance</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Last Invoice</th>
                <th className="text-center px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredCustomers.map((customer, index) => (
                <tr 
                  key={customer.id} 
                  className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">{customer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      {customer.address}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 text-xs text-slate-700">
                      <FileText size={12} />
                      {customer.totalInvoices}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-900 text-right">
                    ₹ {customer.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-green-700 text-right">
                    ₹ {customer.totalPaid.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    {customer.balance > 0 ? (
                      <span className="text-red-700">₹ {customer.balance.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-700">Paid</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {new Date(customer.lastInvoiceDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 transition-colors"
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

function CustomerForm({ customer, onCancel }: { customer: Customer | null; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would save to state/backend
    alert('Customer saved successfully');
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="p-8 bg-slate-50">
      <div className="bg-white border border-slate-200 max-w-3xl mx-auto">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-slate-900">{customer ? 'Edit Customer' : 'Add New Customer'}</h3>
            <p className="text-sm text-slate-600 mt-0.5">Fill in the customer details below</p>
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
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Customer Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                placeholder="Enter customer name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Address <span className="text-red-600">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                placeholder="Enter customer address"
              />
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
              {customer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
