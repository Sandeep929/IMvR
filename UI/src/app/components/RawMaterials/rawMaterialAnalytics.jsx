import { useState, useEffect } from 'react';
import {
    TrendingUp, AlertTriangle, Package, Trophy,
    BarChart3, Boxes, RefreshCw, Loader2, CheckCircle
} from 'lucide-react';
import { rawMaterialAPI } from '../../../services/api';

/* Colours that work in light & dark — using slate palette */
const CHART_COLORS = [
    '#1e293b', '#475569', '#64748b', '#94a3b8',
    '#2563eb', '#16a34a', '#dc2626', '#d97706'
];

function DonutChart({ data, size = 120 }) {
    if (!data || data.length === 0) return null;
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;

    let cumAngle = -90;
    const cx = size / 2, cy = size / 2, r = size * 0.38, inner = size * 0.22;

    const polarToXY = (angleDeg, radius) => {
        const rad = (angleDeg * Math.PI) / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    const slices = data.map((d, i) => {
        const pct = d.value / total;
        const sweep = pct * 360;
        const start = cumAngle;
        const end = cumAngle + sweep - 0.5;
        cumAngle += sweep;

        const s1 = polarToXY(start, r), e1 = polarToXY(end, r);
        const s2 = polarToXY(end, inner), e2 = polarToXY(start, inner);
        const large = sweep > 180 ? 1 : 0;

        return (
            <path
                key={i}
                d={`M ${s1.x} ${s1.y} A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${inner} ${inner} 0 ${large} 0 ${e2.x} ${e2.y} Z`}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
            />
        );
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
            {slices}
        </svg>
    );
}

function BarChart({ rows, maxVal, unit = '' }) {
    if (!rows || rows.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
                <BarChart3 size={32} className="empty-icon" />
                <p className="empty-subtext">No data in this period</p>
            </div>
        );
    }
    return (
        <div className="rm-chart-bars">
            {rows.map((row, i) => {
                const pct = maxVal > 0 ? (row.value / maxVal) * 100 : 0;
                return (
                    <div className="rm-bar-row" key={i}>
                        <div className="rm-bar-label" title={row.label}>{row.label}</div>
                        <div className="rm-bar-track">
                            <div
                                className="rm-bar-fill"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                                }}
                            />
                        </div>
                        <div className="rm-bar-val">
                            {unit}{row.value?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function RawMaterialAnalytics() {
    const today = new Date().toISOString().split('T')[0];
    const firstOfYear = `${new Date().getFullYear()}-01-01`;

    const [startDate, setStartDate] = useState(firstOfYear);
    const [endDate, setEndDate] = useState(today);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await rawMaterialAPI.getAnalytics({ startDate, endDate });
            setData(res.data.data);
        } catch {
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, [startDate, endDate]);

    /* ── Derived data ────────────────────────────────────────────────── */
    const consumptionByMaterial = data
        ? Object.values(
            data.consumptionTrend.reduce((acc, row) => {
                if (!acc[row.materialName]) acc[row.materialName] = { label: row.materialName, value: 0 };
                acc[row.materialName].value += row.totalQty;
                return acc;
            }, {})
          ).sort((a, b) => b.value - a.value)
        : [];

    const costByMaterial = data
        ? Object.values(
            data.consumptionTrend.reduce((acc, row) => {
                if (!acc[row.materialName]) acc[row.materialName] = { label: row.materialName, value: 0 };
                acc[row.materialName].value += row.totalCost;
                return acc;
            }, {})
          ).sort((a, b) => b.value - a.value)
        : [];

    const sellingRows = data?.sellingRate?.slice(0, 8).map(s => ({
        label: s.materialName,
        value: s.qtyPerOrder
    })) || [];

    const donutData = consumptionByMaterial.slice(0, 6).map((d, i) => ({
        label: d.label, value: d.value,
        color: CHART_COLORS[i % CHART_COLORS.length]
    }));

    const totalExpense = data?.sellingRate?.reduce((s, r) => s + r.totalCost, 0) || 0;
    const totalQty = consumptionByMaterial.reduce((s, r) => s + r.value, 0);
    const uniqueMaterials = consumptionByMaterial.length;

    const maxConsumption = consumptionByMaterial[0]?.value || 1;
    const maxCost = costByMaterial[0]?.value || 1;
    const maxSelling = sellingRows[0]?.value || 1;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 size={36} className="spinner" />
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <AlertTriangle size={48} className="empty-icon" />
                <p className="empty-text">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* ── Date filter + KPI row ──────────────────────────────── */}
            <div className="rm-card">
                <div className="rm-date-filter">
                    <label>From</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <label>To</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <button className="rm-btn-secondary" onClick={fetchAnalytics} style={{ marginLeft: 'auto' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                <div className="rm-stat-row">
                    <div className="rm-stat-card blue">
                        <div className="rm-stat-label">Total Spend</div>
                        <div className="rm-stat-value">
                            ₹{totalExpense >= 100000
                                ? (totalExpense / 100000).toFixed(1) + 'L'
                                : totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="rm-stat-sub">in selected period</div>
                    </div>
                    <div className="rm-stat-card green">
                        <div className="rm-stat-label">Total Qty</div>
                        <div className="rm-stat-value">
                            {totalQty.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="rm-stat-sub">units consumed</div>
                    </div>
                    <div className="rm-stat-card amber">
                        <div className="rm-stat-label">Materials</div>
                        <div className="rm-stat-value">{uniqueMaterials}</div>
                        <div className="rm-stat-sub">unique tracked</div>
                    </div>
                    <div className="rm-stat-card red">
                        <div className="rm-stat-label">Cost Alerts</div>
                        <div className="rm-stat-value">{data?.costAlerts?.length || 0}</div>
                        <div className="rm-stat-sub">rate increase &ge;10%</div>
                    </div>
                </div>
            </div>

            {/* ── Row 1: Consumption trend + Most consumed ──────────── */}
            <div className="rm-analytics-grid">

                <div className="rm-card">
                    <p className="rm-card-title">
                        <TrendingUp size={15} /> Consumption Trend
                    </p>
                    <BarChart rows={consumptionByMaterial} maxVal={maxConsumption} />
                </div>

                <div className="rm-card">
                    <p className="rm-card-title">
                        <Trophy size={15} /> Most Consumed Material
                    </p>
                    {data?.mostConsumed ? (
                        <>
                            <div className="rm-top-material">
                                <div className="rm-top-material-name">
                                    {data.mostConsumed.materialName}
                                </div>
                                <div className="rm-top-material-sub">
                                    {data.mostConsumed.totalQty?.toLocaleString('en-IN')} units consumed
                                    &nbsp;&middot;&nbsp;
                                    ₹{data.mostConsumed.totalCost?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent
                                </div>
                            </div>
                            {donutData.length > 0 && (
                                <div className="rm-donut-wrap">
                                    <DonutChart data={donutData} size={120} />
                                    <div className="rm-donut-legend">
                                        {donutData.map((d, i) => (
                                            <div className="rm-legend-item" key={i}>
                                                <div className="rm-legend-dot" style={{ backgroundColor: d.color }} />
                                                <span>{d.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state" style={{ padding: '1.5rem' }}>
                            <Package size={32} className="empty-icon" />
                            <p className="empty-subtext">No data in this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 2: Cost alerts + Usage per order ─────────────── */}
            <div className="rm-analytics-grid">

                <div className="rm-card">
                    <p className="rm-card-title">
                        <AlertTriangle size={15} /> Cost Increase Alerts
                    </p>
                    <p className="summary-label" style={{ marginBottom: '1rem' }}>
                        Materials with &ge;10% average rate increase vs. prior month
                    </p>
                    {data?.costAlerts?.length > 0 ? (
                        <div className="rm-alert-list">
                            {data.costAlerts.map((alert, i) => (
                                <div className="rm-alert-item" key={i}>
                                    <div>
                                        <div className="rm-alert-material">{alert.materialName}</div>
                                        <div className="rm-alert-detail">
                                            ₹{alert.prevAvgRate} &rarr; ₹{alert.currentAvgRate}
                                        </div>
                                    </div>
                                    <div className="rm-alert-pct">
                                        &#9650; {alert.increasePercent}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '1.5rem' }}>
                            <CheckCircle size={32} className="empty-icon" style={{ color: '#16a34a' }} />
                            <p className="empty-subtext">No significant cost increases this month</p>
                        </div>
                    )}
                </div>

                <div className="rm-card">
                    <p className="rm-card-title">
                        <Package size={15} /> Material Usage per Order
                    </p>
                    <p className="summary-label" style={{ marginBottom: '1rem' }}>
                        Avg qty per invoice &mdash; based on {data?.totalOrders || 0} orders
                    </p>
                    <BarChart rows={sellingRows} maxVal={maxSelling} />
                </div>
            </div>

            {/* ── Row 3: Cost breakdown + Stock levels ──────────────── */}
            <div className="rm-analytics-grid">

                <div className="rm-card">
                    <p className="rm-card-title">
                        <BarChart3 size={15} /> Cost Breakdown by Material
                    </p>
                    <BarChart rows={costByMaterial} maxVal={maxCost} unit="₹" />
                </div>

                <div className="rm-card">
                    <p className="rm-card-title">
                        <Boxes size={15} /> Current Stock Levels
                    </p>
                    {data?.stockLevels?.length > 0 ? (
                        <div className="table-container">
                            <table className="invoices-table">
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Unit</th>
                                        <th className="text-right">On Hand</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.stockLevels.map((s, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                                            <td>{s.name}</td>
                                            <td>
                                                <span className="status-badge" style={{
                                                    background: '#eff6ff',
                                                    color: '#1d4ed8',
                                                    border: '1px solid #bfdbfe'
                                                }}>
                                                    {s.unit || '—'}
                                                </span>
                                            </td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>
                                                {s.currentStock?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '1.5rem' }}>
                            <Boxes size={32} className="empty-icon" />
                            <p className="empty-subtext">No stock data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
