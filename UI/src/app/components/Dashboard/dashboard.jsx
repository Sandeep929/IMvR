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

    /* ─── Monthly KPIs from backend ─────────────────────── */
    const totalRevenue  = dashboardData?.totalRevenue  || 0;   // current month
    const totalAdvance  = dashboardData?.totalAdvance  || 0;   // current month
    const totalBalance  = dashboardData?.totalBalance  || 0;   // current month
    const totalInvoices = dashboardData?.totalInvoices || 0;   // current month
    const currentMonthPaid = dashboardData?.currentMonthPaid || 0;

    // Growth vs full previous month
    const revenueGrowth = dashboardData?.revenueGrowth;
    const advanceGrowth = dashboardData?.advanceGrowth;
    const balanceGrowth = dashboardData?.balanceGrowth;
    const invoiceGrowth = dashboardData?.invoiceGrowth;

    // Parse raw growth values (number or 'new')
    const parseGrowth = (v) => (v === 'new' || v === undefined || v === null) ? v : parseFloat(v);
    const rg = parseGrowth(revenueGrowth);
    const ag = parseGrowth(advanceGrowth);
    const bg = parseGrowth(balanceGrowth);
    const ig = parseGrowth(invoiceGrowth);

    // Previous month reference values
    const lastMonthRevenue  = dashboardData?.lastMonthRevenue  || 0;
    const lastMonthAdvance  = dashboardData?.lastMonthAdvance  || 0;
    const lastMonthBalance  = dashboardData?.lastMonthBalance  || 0;
    const lastMonthCount    = dashboardData?.lastMonthCount    || 0;

    /* ─── All-time values for secondary cards ────────────── */
    const uniqueCustomers = dashboardData?.totalCustomers || 0;
    const totalQuantity   = invoices.reduce(
        (sum, inv) => sum + (inv.items || []).reduce((s, item) => s + Number(item.quantity || 0), 0), 0
    );
    const allTimeRevenue  = dashboardData?.allTimeRevenue || 0;
    const allTimeInvoices = invoices.length;
    const avgInvoiceValue = allTimeInvoices > 0 ? Math.round(allTimeRevenue / allTimeInvoices) : 0;

    /* ─── Helper: format growth badge ───────────────────── */
    const fmtPct = (val) => `${val > 0 ? '+' : ''}${val}%`;

    const stats = [
        {
            title      : 'This Month Revenue',
            value      : `₹ ${totalRevenue.toLocaleString()}`,
            change     : fmtPct(revenueGrowth),
            changeLabel: `vs ₹${lastMonthRevenue.toLocaleString()} last month`,
            trend      : revenueGrowth >= 0 ? 'up' : 'down',
            icon       : IndianRupee,
            iconBg     : 'bg-slate-900-custom',
        },
        {
            title      : 'Advance Received',
            value      : `₹ ${totalAdvance.toLocaleString()}`,
            change     : totalRevenue > 0 ? `${((totalAdvance / totalRevenue) * 100).toFixed(1)}%` : '0%',
            changeLabel: `collection rate · ${fmtPct(advanceGrowth)} vs last month`,
            trend      : advanceGrowth >= 0 ? 'up' : 'down',
            icon       : TrendingUp,
            iconBg     : 'bg-slate-900-custom',
        },
        {
            title      : 'Balance Due',
            value      : `₹ ${totalBalance.toLocaleString()}`,
            change     : totalRevenue > 0 ? `${((totalBalance / totalRevenue) * 100).toFixed(1)}%` : '0%',
            changeLabel: `of this month's revenue`,
            trend      : balanceGrowth <= 0 ? 'up' : 'down',   // lower balance = better
            icon       : TrendingDown,
            iconBg     : 'bg-slate-900-custom',
        },
        {
            title      : 'This Month Invoices',
            value      : totalInvoices.toString(),
            change     : fmtPct(invoiceGrowth),
            changeLabel: `vs ${lastMonthCount} invoices last month`,
            trend      : invoiceGrowth >= 0 ? 'up' : 'down',
            icon       : FileText,
            iconBg     : 'bg-slate-900-custom',
        }
    ];

    const recentInvoices = dashboardData?.recentInvoices || invoices.slice(0, 5);

    // Build top customers from all-time invoice data
    const topCustomers = Object.entries(
        invoices.reduce((acc, inv) => {
            acc[inv.customerName] = (acc[inv.customerName] || 0) + (inv.totalAmount || 0);
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

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
                        <p className="secondary-footer">Total units delivered (all time)</p>
                    </div>

                    <div className="secondary-card">
                        <div className="secondary-card-content">
                            <div className="secondary-icon-box">
                                <IndianRupee size={20} className="secondary-icon" />
                            </div>
                            <div>
                                <p className="secondary-title">Avg Invoice Value</p>
                                <p className="secondary-value">₹ {avgInvoiceValue.toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="secondary-footer">Per transaction average (all time)</p>
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

                {/* Payment Status Overview — this month */}
                <div className="payment-overview">
                    <h3 className="overview-title">This Month — Payment Status</h3>
                    <div className="overview-grid">
                        <div>
                            <p className="overview-card-title">Collection Rate</p>
                            <p className="overview-card-value">
                                {totalRevenue > 0 ? ((totalAdvance / totalRevenue) * 100).toFixed(1) : '0'}%
                            </p>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${totalRevenue > 0 ? Math.min((totalAdvance / totalRevenue) * 100, 100) : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <p className="overview-card-title">Outstanding</p>
                            <p className="overview-card-value">₹ {totalBalance.toLocaleString()}</p>
                            <p className="overview-helper-text">
                                {totalRevenue > 0 ? ((totalBalance / totalRevenue) * 100).toFixed(1) : '0'}% of this month's revenue
                            </p>
                        </div>
                        <div>
                            <p className="overview-card-title">Fully Paid (this month)</p>
                            <p className="overview-card-value">{currentMonthPaid}</p>
                            <p className="overview-helper-text">
                                {totalInvoices > 0 ? ((currentMonthPaid / totalInvoices) * 100).toFixed(0) : '0'}% completion rate
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
