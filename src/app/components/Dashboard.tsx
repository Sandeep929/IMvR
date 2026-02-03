import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockInvoices } from '@/data/mockData';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  // Calculate statistics
  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalAdvance = mockInvoices.reduce((sum, inv) => sum + inv.advance, 0);
  const totalBalance = mockInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const uniqueCustomers = new Set(mockInvoices.map(inv => inv.customerName)).size;
  const totalQuantity = mockInvoices.reduce((sum, inv) => sum + inv.quantity, 0);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹ ${totalAmount.toLocaleString()}`,
      change: '+12.5%',
      changeLabel: 'vs last month',
      trend: 'up',
      icon: DollarSign,
      iconBg: 'bg-slate-900',
      textColor: 'text-slate-900'
    },
    {
      title: 'Advance Received',
      value: `₹ ${totalAdvance.toLocaleString()}`,
      change: '+8.2%',
      changeLabel: 'vs last month',
      trend: 'up',
      icon: TrendingUp,
      iconBg: 'bg-green-600',
      textColor: 'text-green-700'
    },
    {
      title: 'Balance Due',
      value: `₹ ${totalBalance.toLocaleString()}`,
      change: '-3.1%',
      changeLabel: 'vs last month',
      trend: 'down',
      icon: TrendingDown,
      iconBg: 'bg-red-600',
      textColor: 'text-red-700'
    },
    {
      title: 'Total Invoices',
      value: totalInvoices.toString(),
      change: '+5',
      changeLabel: 'this month',
      trend: 'up',
      icon: FileText,
      iconBg: 'bg-blue-600',
      textColor: 'text-blue-700'
    }
  ];

  const recentInvoices = mockInvoices.slice(0, 5);
  const topCustomers = Object.entries(
    mockInvoices.reduce((acc, inv) => {
      acc[inv.customerName] = (acc[inv.customerName] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.iconBg} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-700' : 'text-red-700'}`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 mb-1 uppercase tracking-wide">{stat.title}</h3>
                <p className="text-2xl text-slate-900 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.changeLabel}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Additional Stats */}
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 flex items-center justify-center">
                <Users size={20} className="text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600 uppercase tracking-wide">Total Customers</p>
                <p className="text-2xl text-slate-900">{uniqueCustomers}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Active customer base</p>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 flex items-center justify-center">
                <Package size={20} className="text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600 uppercase tracking-wide">Bricks Sold</p>
                <p className="text-2xl text-slate-900">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Total units delivered</p>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 flex items-center justify-center">
                <DollarSign size={20} className="text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600 uppercase tracking-wide">Avg Invoice Value</p>
                <p className="text-2xl text-slate-900">₹ {Math.round(totalAmount / totalInvoices).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Per transaction average</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-white border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-wide text-slate-900">Recent Invoices</h3>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-sm text-slate-700 hover:text-slate-900 underline"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-slate-900">{invoice.customerName}</p>
                      <p className="text-xs text-slate-500">{invoice.pavatiNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-900">₹ {invoice.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{invoice.quantity} units</span>
                    {invoice.balance > 0 ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200">
                        Due: ₹{invoice.balance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm uppercase tracking-wide text-slate-900">Top Customers</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {topCustomers.map(([name, amount], index) => (
                <div key={name} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center text-xs flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">
                          {mockInvoices.filter(inv => inv.customerName === name).length} invoices
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-900">₹ {amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="mt-6 bg-white border border-slate-200 p-6">
          <h3 className="text-sm uppercase tracking-wide text-slate-900 mb-4">Payment Status Overview</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">Collection Rate</p>
              <p className="text-3xl text-slate-900 mb-1">{((totalAdvance / totalAmount) * 100).toFixed(1)}%</p>
              <div className="w-full bg-slate-200 h-2 mt-2">
                <div 
                  className="bg-green-600 h-2" 
                  style={{ width: `${(totalAdvance / totalAmount) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">Outstanding</p>
              <p className="text-3xl text-slate-900 mb-1">₹ {totalBalance.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">{((totalBalance / totalAmount) * 100).toFixed(1)}% of total revenue</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide">Fully Paid Invoices</p>
              <p className="text-3xl text-slate-900 mb-1">{mockInvoices.filter(inv => inv.balance === 0).length}</p>
              <p className="text-xs text-slate-500 mt-2">
                {((mockInvoices.filter(inv => inv.balance === 0).length / totalInvoices) * 100).toFixed(0)}% completion rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
