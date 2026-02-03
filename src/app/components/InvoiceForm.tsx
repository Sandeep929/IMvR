import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Invoice } from '@/types/invoice';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSave: (invoice: Partial<Invoice>) => void;
  onCancel: () => void;
}

export function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    product: 'Fresh Bricks',
    quantity: 0,
    rate: 6.8,
    amount: 0,
    advance: 0,
    balance: 0,
    pavatiNo: 0,
    customerName: '',
    site: '',
    vehicleNo: '',
    marfat: '',
    remarks: ''
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        date: invoice.date,
        product: invoice.product,
        quantity: invoice.quantity,
        rate: invoice.rate,
        amount: invoice.amount,
        advance: invoice.advance,
        balance: invoice.balance,
        pavatiNo: invoice.pavatiNo,
        customerName: invoice.customerName,
        site: invoice.site,
        vehicleNo: invoice.vehicleNo,
        marfat: invoice.marfat,
        remarks: invoice.remarks
      });
    }
  }, [invoice]);

  // Auto-calculate amount when quantity or rate changes
  useEffect(() => {
    const calculatedAmount = formData.quantity * formData.rate;
    const calculatedBalance = calculatedAmount - formData.advance;
    setFormData(prev => ({
      ...prev,
      amount: calculatedAmount,
      balance: calculatedBalance
    }));
  }, [formData.quantity, formData.rate, formData.advance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['quantity', 'rate', 'advance', 'pavatiNo'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  return (
    <div className="p-8 bg-slate-50">
      <div className="bg-white border border-slate-200 max-w-5xl mx-auto">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-slate-900">{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
            <p className="text-sm text-slate-600 mt-0.5">Fill in the invoice details below</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-wide text-slate-600 mb-4 pb-2 border-b border-slate-200">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Product <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Fresh Bricks">Fresh Bricks</option>
                    <option value="Khanjar">Khanjar</option>
                    <option value="Red Bricks">Red Bricks</option>
                    <option value="Fly Ash Bricks">Fly Ash Bricks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Pavati Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="pavatiNo"
                    value={formData.pavatiNo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-wide text-slate-600 mb-4 pb-2 border-b border-slate-200">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Customer Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Site Location <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="Enter site location"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Vehicle Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="Enter vehicle number"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Marfat (Via)
                  </label>
                  <input
                    type="text"
                    name="marfat"
                    value={formData.marfat}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="Enter via/through (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-wide text-slate-600 mb-4 pb-2 border-b border-slate-200">
                Pricing Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Quantity <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="0"
                  />
                </div>
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
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    readOnly
                    className="w-full px-3 py-2.5 border border-slate-300 bg-slate-50 text-slate-900 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-wide text-slate-600 mb-4 pb-2 border-b border-slate-200">
                Payment Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Advance Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="advance"
                    value={formData.advance}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Balance Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    readOnly
                    className="w-full px-3 py-2.5 border border-slate-300 bg-slate-50 text-slate-900 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-wide text-slate-600 mb-4 pb-2 border-b border-slate-200">
                Additional Information
              </h4>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="Add any additional notes or remarks..."
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 border border-slate-200 p-6">
              <h4 className="text-sm text-slate-900 mb-4 uppercase tracking-wide">Invoice Summary</h4>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Amount</p>
                  <p className="text-2xl text-slate-900">₹ {formData.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Advance Paid</p>
                  <p className="text-2xl text-green-700">₹ {formData.advance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Balance Due</p>
                  <p className={`text-2xl ${formData.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    ₹ {formData.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}