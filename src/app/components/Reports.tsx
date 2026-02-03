import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, FileText, Users } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';

export function Reports() {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  // Process data for charts
  const monthlyData = processMonthlyData();
  const productData = processProductData();
  const customerData = processTopCustomers();
  const paymentStatusData = processPaymentStatus();

  function processMonthlyData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      revenue: Math.floor(Math.random() * 500000) + 300000,
      advance: Math.floor(Math.random() * 300000) + 200000,
      balance: Math.floor(Math.random() * 200000) + 100000
    }));
  }

  function processProductData() {
    const products = new Map<string, number>();
    mockInvoices.forEach(inv => {
      products.set(inv.product, (products.get(inv.product) || 0) + inv.amount);
    });
    return Array.from(products.entries()).map(([name, value]) => ({ name, value }));
  }

  function processTopCustomers() {
    const customers = new Map<string, number>();
    mockInvoices.forEach(inv => {
      customers.set(inv.customerName, (customers.get(inv.customerName) || 0) + inv.amount);
    });
    return Array.from(customers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }

  function processPaymentStatus() {
    const paid = mockInvoices.filter(inv => inv.balance === 0).length;
    const pending = mockInvoices.filter(inv => inv.balance > 0).length;
    return [
      { name: 'Fully Paid', value: paid },
      { name: 'Pending', value: pending }
    ];
  }

  const stats = {
    totalRevenue: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    totalInvoices: mockInvoices.length,
    totalCustomers: new Set(mockInvoices.map(inv => inv.customerName)).size,
    avgInvoice: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0) / mockInvoices.length
  };

  const COLORS = ['#0f172a', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

  return (
    <div className="p-8 bg-slate-50">
      <div className="mb-6">
        <div className="bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg text-slate-900 mb-1">Business Analytics & Reports</h3>
              <p className="text-sm text-slate-600">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
              <button className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-slate-600" />
                <p className="text-xs text-slate-600 uppercase tracking-wide">Total Revenue</p>
              </div>
              <p className="text-2xl text-slate-900">₹ {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-1">+12.5% from last period</p>
            </div>

            <div className="p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-slate-600" />
                <p className="text-xs text-slate-600 uppercase tracking-wide">Total Invoices</p>
              </div>
              <p className="text-2xl text-slate-900">{stats.totalInvoices}</p>
              <p className="text-xs text-green-700 mt-1">+8 new this month</p>
            </div>

            <div className="p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-slate-600" />
                <p className="text-xs text-slate-600 uppercase tracking-wide">Active Customers</p>
              </div>
              <p className="text-2xl text-slate-900">{stats.totalCustomers}</p>
              <p className="text-xs text-green-700 mt-1">+3 new this month</p>
            </div>

            <div className="p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-slate-600" />
                <p className="text-xs text-slate-600 uppercase tracking-wide">Avg Invoice Value</p>
              </div>
              <p className="text-2xl text-slate-900">₹ {Math.round(stats.avgInvoice).toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-1">+5.2% from last period</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white border border-slate-200 p-6">
          <h4 className="text-sm text-slate-900 mb-4 uppercase tracking-wide">Revenue Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="advance" stroke="#16a34a" strokeWidth={2} name="Advance" />
              <Line type="monotone" dataKey="balance" stroke="#dc2626" strokeWidth={2} name="Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white border border-slate-200 p-6">
          <h4 className="text-sm text-slate-900 mb-4 uppercase tracking-wide">Product Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0'
                }} 
              />
              <Bar dataKey="value" fill="#0f172a" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status */}
        <div className="bg-white border border-slate-200 p-6">
          <h4 className="text-sm text-slate-900 mb-4 uppercase tracking-wide">Payment Status Distribution</h4>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : '#dc2626'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-600"></div>
                <p className="text-xs text-slate-600">Fully Paid</p>
              </div>
              <p className="text-xl text-slate-900">{paymentStatusData[0].value}</p>
            </div>
            <div className="p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-red-600"></div>
                <p className="text-xs text-slate-600">Pending</p>
              </div>
              <p className="text-xl text-slate-900">{paymentStatusData[1].value}</p>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-slate-200 p-6">
          <h4 className="text-sm text-slate-900 mb-4 uppercase tracking-wide">Top Customers by Revenue</h4>
          <div className="space-y-3">
            {customerData.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 flex items-center justify-center text-white text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-600">
                      {mockInvoices.filter(inv => inv.customerName === customer.name).length} invoices
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">₹ {customer.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mt-6 bg-white border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h4 className="text-sm text-slate-900 uppercase tracking-wide">Monthly Performance Summary</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Month</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Revenue</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Advance</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Balance</th>
                <th className="text-right px-4 py-3 text-xs text-slate-700 uppercase tracking-wide">Growth</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {monthlyData.map((month, index) => (
                <tr 
                  key={month.name} 
                  className={`border-b border-slate-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-slate-900">{month.name} 2026</td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right">₹ {month.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-700 text-right">₹ {month.advance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-700 text-right">₹ {month.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-700 text-right">
                    +{(Math.random() * 20).toFixed(1)}%
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
