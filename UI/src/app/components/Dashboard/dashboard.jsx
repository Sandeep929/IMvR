import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, FileText, Users, Package, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { dashboardAPI, invoiceAPI } from '@/services/api';
import './dashboard.css';

export function Dashboard({ setActiveTab }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, invRes] = await Promise.all([
                dashboardAPI.getStats(),
                invoiceAPI.getAll()
            ]);
            setDashboardData(dashRes.data);
            setInvoices(invRes.data);
        } catch (err) {
            setError(err.message);
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <Loader2 size={40} className="spinner" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <p>Error loading dashboard: {error}</p>
                    <button onClick={loadDashboardData} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    const totalInvoices = dashboardData?.totalInvoices || 0;
    const totalAmount = dashboardData?.totalRevenue || 0;
    const totalAdvance = invoices.reduce((sum, inv) => sum + (inv.totalAdvance || 0), 0);
    const totalBalance = dashboardData?.totalBalance || 0;
    const uniqueCustomers = dashboardData?.totalCustomers || 0;
    const totalQuantity = invoices.reduce((sum, inv) => sum + (inv.items || []).reduce((s, item) => s + Number(item.quantity || 0), 0), 0);
    const revenueGrowth = dashboardData?.revenueGrowth || '0';

    const stats = [
        {
            title: 'Total Revenue',
            value: `₹ ${totalAmount.toLocaleString()}`,
            change: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`,
            changeLabel: 'vs last month',
            trend: revenueGrowth >= 0 ? 'up' : 'down',
            icon: IndianRupee,
            iconBg: 'bg-slate-900-custom',
        },
        {
            title: 'Advance Received',
            value: `₹ ${totalAdvance.toLocaleString()}`,
            change: totalAmount > 0 ? `${((totalAdvance / totalAmount) * 100).toFixed(1)}%` : '0%',
            changeLabel: 'collection rate',
            trend: 'up',
            icon: TrendingUp,
            iconBg: 'bg-slate-900-custom',
        },
        {
            title: 'Balance Due',
            value: `₹ ${totalBalance.toLocaleString()}`,
            change: totalAmount > 0 ? `${((totalBalance / totalAmount) * 100).toFixed(1)}%` : '0%',
            changeLabel: 'of total revenue',
            trend: 'down',
            icon: TrendingDown,
            iconBg: 'bg-slate-900-custom',
        },
        {
            title: 'Total Invoices',
            value: totalInvoices.toString(),
            change: `${dashboardData?.currentMonthRevenue ? '₹' + Math.round(dashboardData.currentMonthRevenue).toLocaleString() : '₹0'}`,
            changeLabel: 'this month',
            trend: 'up',
            icon: FileText,
            iconBg: 'bg-slate-900-custom',
        }
    ];

    const recentInvoices = dashboardData?.recentInvoices || invoices.slice(0, 5);

    // Build top customers from invoice data
    const topCustomers = Object.entries(
        invoices.reduce((acc, inv) => {
            acc[inv.customerName] = (acc[inv.customerName] || 0) + (inv.totalAmount || 0);
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const paidInvoices = invoices.filter(inv => inv.balance === 0).length;

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="stat-card">
                                <div className="stat-header">
                                    <div className={`stat-icon-box ${stat.iconBg}`}>
                                        <Icon size={24} className="stat-icon" />
                                    </div>
                                    <div className={`stat-trend ${stat.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                                        {stat.trend === 'up' ? (
                                            <ArrowUpRight size={14} />
                                        ) : (
                                            <ArrowDownRight size={14} />
                                        )}
                                        <span>{stat.change}</span>
                                    </div>
                                </div>
                                <h3 className="stat-title">{stat.title}</h3>
                                <p className="stat-value">{stat.value}</p>
                                <p className="stat-change-label">{stat.changeLabel}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="secondary-stats-grid">
                    <div className="secondary-card">
                        <div className="secondary-card-content">
                            <div className="secondary-icon-box">
                                <Users size={20} className="secondary-icon" />
                            </div>
                            <div>
                                <p className="secondary-title">Total Customers</p>
                                <p className="secondary-value">{uniqueCustomers}</p>
                            </div>
                        </div>
                        <p className="secondary-footer">Active customer base</p>
                    </div>

                    <div className="secondary-card">
                        <div className="secondary-card-content">
                            <div className="secondary-icon-box">
                                <Package size={20} className="secondary-icon" />
                            </div>
                            <div>
                                <p className="secondary-title">Bricks Sold</p>
                                <p className="secondary-value">{totalQuantity.toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="secondary-footer">Total units delivered</p>
                    </div>

                    <div className="secondary-card">
                        <div className="secondary-card-content">
                            <div className="secondary-icon-box">
                                <IndianRupee size={20} className="secondary-icon" />
                            </div>
                            <div>
                                <p className="secondary-title">Avg Invoice Value</p>
                                <p className="secondary-value">₹ {totalInvoices > 0 ? Math.round(totalAmount / totalInvoices).toLocaleString() : '0'}</p>
                            </div>
                        </div>
                        <p className="secondary-footer">Per transaction average</p>
                    </div>
                </div>

                <div className="tables-grid">
                    {/* Recent Invoices */}
                    <div className="table-card">
                        <div className="table-header">
                            <h3 className="table-title">Recent Invoices</h3>
                            <button
                                onClick={() => setActiveTab('invoices')}
                                className="view-all-btn"
                            >
                                View All
                            </button>
                        </div>
                        <div className="table-list">
                            {recentInvoices.map((invoice) => (
                                <div key={invoice._id || invoice.id} className="table-item">
                                    <div className="invoice-row">
                                        <div>
                                            <p className="invoice-customer">{invoice.customerName}</p>
                                            <p className="invoice-number">{invoice.pavatiNo}</p>
                                        </div>
                                        <div className="invoice-amount-box">
                                            <p className="invoice-amount">₹ {(invoice.totalAmount || 0).toLocaleString()}</p>
                                            <p className="invoice-date">
                                                {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="invoice-meta">
                                        <span className="invoice-units">
                                            {(invoice.items || []).map(i => i.product).join(', ') || 'N/A'}
                                        </span>
                                        {invoice.balance > 0 ? (
                                            <span className="status-badge status-due">
                                                Due: ₹{(invoice.balance || 0).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="status-badge status-paid">
                                                Paid
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="table-card">
                        <div className="table-header">
                            <h3 className="table-title">Top Customers</h3>
                        </div>
                        <div className="table-list">
                            {topCustomers.map(([name, amount], index) => (
                                <div key={name} className="table-item">
                                    <div className="customer-row">
                                        <div className="customer-info">
                                            <div className="customer-rank">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="customer-name">{name}</p>
                                                <p className="customer-count">
                                                    {invoices.filter(inv => inv.customerName === name).length} invoices
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="customer-amount">₹ {amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Status Overview */}
                <div className="payment-overview">
                    <h3 className="overview-title">Payment Status Overview</h3>
                    <div className="overview-grid">
                        <div>
                            <p className="overview-card-title">Collection Rate</p>
                            <p className="overview-card-value">{totalAmount > 0 ? ((totalAdvance / totalAmount) * 100).toFixed(1) : '0'}%</p>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${totalAmount > 0 ? (totalAdvance / totalAmount) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <p className="overview-card-title">Outstanding</p>
                            <p className="overview-card-value">₹ {totalBalance.toLocaleString()}</p>
                            <p className="overview-helper-text">{totalAmount > 0 ? ((totalBalance / totalAmount) * 100).toFixed(1) : '0'}% of total revenue</p>
                        </div>
                        <div>
                            <p className="overview-card-title">Fully Paid Invoices</p>
                            <p className="overview-card-value">{paidInvoices}</p>
                            <p className="overview-helper-text">
                                {totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(0) : '0'}% completion rate
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
