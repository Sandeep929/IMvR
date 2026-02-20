import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, FileText, Users, Loader2 } from 'lucide-react';
import { reportAPI } from '@/services/api';
import './reports.css';

export function Reports() {
    const [dateRange, setDateRange] = useState('30');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            setLoading(true);
            const res = await reportAPI.getData();
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

    return (
        <div className="reports-container">
            <div className="reports-header-card">
                <div className="header-content">
                    <div className="header-text">
                        <h3>Business Analytics & Reports</h3>
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
                        <button className="export-btn">
                            <Download size={18} />
                            Export Report
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-box">
                        <div className="stat-header">
                            <DollarSign size={16} className="stat-icon" />
                            <p className="stat-label">Total Revenue</p>
                        </div>
                        <p className="stat-value">₹ {summary?.totalRevenue?.toLocaleString() || 0}</p>
                        <p className="stat-trend">+12.5% from last period</p>
                    </div>

                    <div className="stat-box">
                        <div className="stat-header">
                            <FileText size={16} className="stat-icon" />
                            <p className="stat-label">Total Invoices</p>
                        </div>
                        <p className="stat-value">{summary?.totalInvoices || 0}</p>
                        <p className="stat-trend">+8 new this month</p>
                    </div>

                    <div className="stat-box">
                        <div className="stat-header">
                            <Users size={16} className="stat-icon" />
                            <p className="stat-label">Outstanding Balance</p>
                        </div>
                        <p className="stat-value">₹ {summary?.totalBalance?.toLocaleString() || 0}</p>
                        <p className="stat-trend text-red-600">Action required</p>
                    </div>

                    <div className="stat-box">
                        <div className="stat-header">
                            <TrendingUp size={16} className="stat-icon" />
                            <p className="stat-label">Avg Invoice Value</p>
                        </div>
                        <p className="stat-value">
                            ₹ {summary?.totalInvoices > 0
                                ? Math.round(summary.totalRevenue / summary.totalInvoices).toLocaleString()
                                : 0
                            }
                        </p>
                        <p className="stat-trend">+5.2% from last period</p>
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
                                    <p>₹ {customer.totalAmount?.toLocaleString() || 0}</p>
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
                                    <td className="text-right">₹ {month.revenue?.toLocaleString() || 0}</td>
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

