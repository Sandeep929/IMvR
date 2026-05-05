import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, FileText, Users, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { reportAPI } from '@/services/api';
import './reports.css';

export function Reports() {
    const [dateRange, setDateRange] = useState('30');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReportData();
    }, [dateRange]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const res = await reportAPI.getData({ days: dateRange });
            setData(res.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="reports-container">
                <div className="dashboard-loading">
                    <Loader2 size={40} className="spinner" />
                    <p>Loading reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-container">
                <div className="dashboard-error">
                    <p>Error loading reports: {error}</p>
                    <button onClick={loadReportData} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    const { summary, topCustomers, monthlyReport } = data || {};

    /* ─── Growth values from backend (based on selected filter) ─── */
    const parseGrowth = (v) => (v === 'new' || v === undefined || v === null) ? v : parseFloat(v);
    const revenueGrowth  = parseGrowth(summary?.revenueGrowth);
    const invoiceGrowth  = parseGrowth(summary?.invoiceGrowth);
    const avgGrowth      = parseGrowth(summary?.avgGrowth);
    const prevPeriodLabel = summary?.prevPeriodLabel || 'previous period';
    const hasPrevData    = (summary?.prevRevenue || 0) > 0 || (summary?.prevCount || 0) > 0;

    /* ─── Helper ─── */
    const fmtPct = (val) => val === 'new' ? 'New' : `${val > 0 ? '+' : ''}${parseFloat(val).toFixed(1)}%`;
    const TrendIcon = ({ val }) => val === 'new' || val >= 0
        ? <ArrowUpRight size={12} style={{ display: 'inline' }} />
        : <ArrowDownRight size={12} style={{ display: 'inline' }} />;

    return (
        <div className="reports-container">
            <div className="reports-header-card">
                <div className="header-content">
                    <div className="header-text">
                        <h3>Business Analytics &amp; Reports</h3>
                        <p>Comprehensive insights and performance metrics</p>
                    </div>
                    <div className="header-controls">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="date-select"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>
                </div>

                <div className="stats-grid">
                    {/* Total Revenue */}
                    <div className="stat-box">
                        <div className="stat-header">
                            <IndianRupee size={16} className="stat-icon" />
                            <p className="stat-label">Total Revenue</p>
                        </div>
                        <p className="stat-value">₹ {(summary?.totalRevenue || 0).toLocaleString()}</p>
                        <p className="stat-trend">
                            {hasPrevData
                                ? <><TrendIcon val={revenueGrowth} /> {fmtPct(revenueGrowth)} vs {prevPeriodLabel}</>
                                : `No data for ${prevPeriodLabel}`}
                        </p>
                    </div>

                    {/* Total Invoices */}
                    <div className="stat-box">
                        <div className="stat-header">
                            <FileText size={16} className="stat-icon" />
                            <p className="stat-label">Total Invoices</p>
                        </div>
                        <p className="stat-value">{summary?.totalInvoices || 0}</p>
                        <p className="stat-trend">
                            {hasPrevData
                                ? <><TrendIcon val={invoiceGrowth} /> {fmtPct(invoiceGrowth)} vs {prevPeriodLabel} ({summary?.prevCount || 0} invoices)</>
                                : `No data for ${prevPeriodLabel}`}
                        </p>
                    </div>

                    {/* Outstanding Balance */}
                    <div className="stat-box">
                        <div className="stat-header">
                            <Users size={16} className="stat-icon" />
                            <p className="stat-label">Outstanding Balance</p>
                        </div>
                        <p className="stat-value">₹ {(summary?.totalBalance || 0).toLocaleString()}</p>
                        <p className="stat-trend">
                            {summary?.totalRevenue > 0
                                ? `${((summary.totalBalance / summary.totalRevenue) * 100).toFixed(1)}% of period revenue`
                                : 'No revenue in period'}
                        </p>
                    </div>

                    {/* Avg Invoice Value */}
                    <div className="stat-box">
                        <div className="stat-header">
                            <TrendingUp size={16} className="stat-icon" />
                            <p className="stat-label">Avg Invoice Value</p>
                        </div>
                        <p className="stat-value">
                            ₹ {(summary?.avgInvoiceVal || 0).toLocaleString()}
                        </p>
                        <p className="stat-trend">
                            {hasPrevData
                                ? <><TrendIcon val={avgGrowth} /> {fmtPct(avgGrowth)} vs {prevPeriodLabel}</>
                                : `No data for ${prevPeriodLabel}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h4 className="chart-title">Top Customers by Revenue</h4>
                    <div className="customers-list">
                        {(topCustomers || []).slice(0, 5).map((customer, index) => (
                            <div key={customer.name} className="customer-item">
                                <div className="customer-info">
                                    <div className="rank-badge">
                                        {index + 1}
                                    </div>
                                    <div className="customer-text">
                                        <p className="customer-name">{customer.name}</p>
                                        <p className="customer-count">
                                            {customer.invoiceCount} invoices
                                        </p>
                                    </div>
                                </div>
                                <div className="customer-value">
                                    <p>₹ {(customer.totalAmount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="detailed-table-card">
                <div className="table-header">
                    <h4 className="table-header-title">Monthly Performance Summary</h4>
                </div>
                <div className="table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th className="text-right">Revenue</th>
                                <th className="text-right">Invoices</th>
                                <th className="text-right">Avg Val</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(monthlyReport || []).map((month, index) => (
                                <tr
                                    key={month.month}
                                    className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                                >
                                    <td>{month.month}</td>
                                    <td className="text-right">₹ {(month.revenue || 0).toLocaleString()}</td>
                                    <td className="text-right">{month.invoiceCount}</td>
                                    <td className="text-right">
                                        ₹ {month.invoiceCount > 0 ? Math.round(month.revenue / month.invoiceCount).toLocaleString() : 0}
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
