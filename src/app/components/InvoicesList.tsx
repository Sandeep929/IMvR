import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Download, Search, Filter, FileText } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';
import { Invoice } from '@/types/invoice';
import { InvoiceForm } from '@/app/components/InvoiceForm';
import { InvoiceDetailView } from '@/app/components/InvoiceDetailView';

export function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAdd = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleSave = (invoiceData: Partial<Invoice>) => {
    if (editingInvoice) {
      setInvoices(invoices.map(inv => 
        inv.id === editingInvoice.id ? { ...inv, ...invoiceData } : inv
      ));
    } else {
      const newInvoice: Invoice = {
        ...invoiceData as Invoice,
        id: Math.max(...invoices.map(i => i.id)) + 1,
        sNo: invoices.length + 1,
      };
      setInvoices([...invoices, newInvoice]);
    }
    setShowForm(false);
    setEditingInvoice(null);
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

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.pavatiNo.toString().includes(searchTerm);
    
    const matchesProduct = filterProduct === 'all' || invoice.product === filterProduct;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'paid' && invoice.balance === 0) ||
      (filterStatus === 'pending' && invoice.balance > 0);
    
    return matchesSearch && matchesProduct && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    totalAdvance: filteredInvoices.reduce((sum, inv) => sum + inv.advance, 0),
    totalBalance: filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0),
    paid: filteredInvoices.filter(inv => inv.balance === 0).length,
    pending: filteredInvoices.filter(inv => inv.balance > 0).length
  };

  return (
    <div className="p-8 bg-slate-50">
      <div className="bg-white border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-slate-900 mb-1">Invoice Management</h3>
            <p className="text-sm text-slate-600">
              Total: <span className="text-slate-900">{invoices.length}</span> invoices
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              New Invoice
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer, site, vehicle, or pavati no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All Products</option>
                <option value="Fresh Bricks">Fresh Bricks</option>
                <option value="Khanjar">Khanjar</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-slate-600" />
                <p className="text-xs text-slate-600 uppercase tracking-wide">Invoices</p>
              </div>
              <p className="text-2xl text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Total Amount</p>
              <p className="text-xl text-slate-900">₹ {stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Advance</p>
              <p className="text-xl text-green-700">₹ {stats.totalAdvance.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Balance</p>
              <p className="text-xl text-red-700">₹ {stats.totalBalance.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Paid</p>
              <p className="text-xl text-green-700">{stats.paid}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Pending</p>
              <p className="text-xl text-red-700">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">S.No</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Product</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Qty</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Rate</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Amount</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Advance</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Balance</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Pavati No.</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Site</th>
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Vehicle</th>
                <th className="text-center px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredInvoices.map((invoice, index) => (
                <tr 
                  key={invoice.id} 
                  className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-slate-900">{invoice.sNo}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {new Date(invoice.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{invoice.product}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right">{invoice.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right">₹ {invoice.rate}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right">₹ {invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-700 text-right">₹ {invoice.advance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {invoice.balance > 0 ? (
                      <span className="text-red-700">₹ {invoice.balance.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-700">Paid</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{invoice.pavatiNo}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{invoice.customerName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{invoice.site}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{invoice.vehicleNo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleView(invoice)}
                        className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
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

        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-2">No invoices found</p>
            <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
