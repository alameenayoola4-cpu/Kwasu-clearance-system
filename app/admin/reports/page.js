'use client';

// Admin Analytics & Reports Page - Merged Dashboard
import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import MobileWarning from '../../components/MobileWarning';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../admin.css';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [dateRange, setDateRange] = useState('6months');

    useAuthSync('admin');

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/admin/analytics');
            if (response.ok) {
                const result = await response.json();
                setAnalytics(result.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportType: 'statistics' }),
            });

            if (response.ok) {
                const data = await response.json();
                const blob = new Blob([data.data.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = data.data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    // Calculate totals and percentages
    const totalRequests = (analytics?.statusDistribution?.approved || 0) +
        (analytics?.statusDistribution?.pending || 0) +
        (analytics?.statusDistribution?.rejected || 0);

    const approvedPercent = totalRequests > 0
        ? Math.round((analytics?.statusDistribution?.approved / totalRequests) * 100)
        : 0;
    const pendingPercent = totalRequests > 0
        ? Math.round((analytics?.statusDistribution?.pending / totalRequests) * 100)
        : 0;
    const rejectedPercent = totalRequests > 0
        ? Math.round((analytics?.statusDistribution?.rejected / totalRequests) * 100)
        : 0;

    // Calculate max for chart scaling
    const maxMonthly = analytics?.monthlyTrends?.reduce((max, m) => Math.max(max, m.total), 0) || 10;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <MobileWarning role="admin" />
            <AdminSidebar userName="Admin Central" />

            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span className="current">Analytics & Reports</span>
                        </nav>
                        <h1>Admin Analytics & Reports Dashboard</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="date-selector">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                            </svg>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="3months">Jan 2024 - Mar 2024</option>
                                <option value="6months">Jan 2024 - Jun 2024</option>
                                <option value="year">Jan 2024 - Dec 2024</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={handleExport}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export Report
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Top Charts Row */}
                    <div className="analytics-row">
                        {/* Line Chart - Clearance Completion Trends */}
                        <div className="chart-card chart-wide">
                            <div className="chart-header-row">
                                <div>
                                    <h3>Clearance Completion Trends</h3>
                                    <p className="chart-subtitle">Monthly volume of approved vs pending requests</p>
                                </div>
                                <div className="chart-legend-inline">
                                    <span className="legend-dot">
                                        <span className="dot" style={{ background: '#1e8449' }}></span>
                                        APPROVED
                                    </span>
                                    <span className="legend-dot">
                                        <span className="dot" style={{ background: '#e5e7eb' }}></span>
                                        TOTAL
                                    </span>
                                </div>
                            </div>
                            <div className="line-chart-container">
                                <svg className="line-chart" viewBox="0 0 600 180" preserveAspectRatio="none">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="600" y2="0" className="grid-line" />
                                    <line x1="0" y1="45" x2="600" y2="45" className="grid-line" />
                                    <line x1="0" y1="90" x2="600" y2="90" className="grid-line" />
                                    <line x1="0" y1="135" x2="600" y2="135" className="grid-line" />
                                    <line x1="0" y1="180" x2="600" y2="180" className="grid-line" />

                                    {/* Trend line */}
                                    {analytics?.monthlyTrends?.length > 0 && (
                                        <>
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="rgba(30, 132, 73, 0.3)" />
                                                    <stop offset="100%" stopColor="rgba(30, 132, 73, 0)" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d={`M ${analytics.monthlyTrends.map((m, i) => {
                                                    const x = (i / (analytics.monthlyTrends.length - 1 || 1)) * 600;
                                                    const y = 180 - (m.approved / maxMonthly) * 160;
                                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                }).join(' ')} L 600 180 L 0 180 Z`}
                                                fill="url(#lineGradient)"
                                            />
                                            <path
                                                d={`M ${analytics.monthlyTrends.map((m, i) => {
                                                    const x = (i / (analytics.monthlyTrends.length - 1 || 1)) * 600;
                                                    const y = 180 - (m.approved / maxMonthly) * 160;
                                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                }).join(' ')}`}
                                                fill="none"
                                                stroke="#1e8449"
                                                strokeWidth="2"
                                            />
                                        </>
                                    )}
                                </svg>
                                <div className="chart-x-axis">
                                    {analytics?.monthlyTrends?.map((m, i) => (
                                        <span key={i}>{m.month}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Donut Chart - Status Distribution */}
                        <div className="chart-card">
                            <h3>Status Distribution</h3>
                            <div className="donut-wrapper">
                                <svg viewBox="0 0 100 100" className="donut-chart-lg">
                                    {totalRequests > 0 ? (
                                        <>
                                            <circle
                                                cx="50" cy="50" r="40"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="8"
                                                strokeDasharray={`${approvedPercent * 2.51} 251`}
                                                strokeDashoffset="0"
                                                transform="rotate(-90 50 50)"
                                            />
                                            <circle
                                                cx="50" cy="50" r="40"
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="8"
                                                strokeDasharray={`${pendingPercent * 2.51} 251`}
                                                strokeDashoffset={`${-approvedPercent * 2.51}`}
                                                transform="rotate(-90 50 50)"
                                            />
                                            <circle
                                                cx="50" cy="50" r="40"
                                                fill="none"
                                                stroke="#ef4444"
                                                strokeWidth="8"
                                                strokeDasharray={`${rejectedPercent * 2.51} 251`}
                                                strokeDashoffset={`${-(approvedPercent + pendingPercent) * 2.51}`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </>
                                    ) : (
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                    )}
                                    <text x="50" y="46" textAnchor="middle" className="donut-value">{totalRequests.toLocaleString()}</text>
                                    <text x="50" y="58" textAnchor="middle" className="donut-label">TOTAL</text>
                                </svg>
                            </div>
                            <div className="distribution-legend">
                                <div className="legend-row">
                                    <span className="legend-dot"><span className="dot" style={{ background: '#10b981' }}></span> Approved</span>
                                    <span className="legend-value">{approvedPercent}%</span>
                                </div>
                                <div className="legend-row">
                                    <span className="legend-dot"><span className="dot" style={{ background: '#3b82f6' }}></span> Pending</span>
                                    <span className="legend-value">{pendingPercent}%</span>
                                </div>
                                <div className="legend-row">
                                    <span className="legend-dot"><span className="dot" style={{ background: '#ef4444' }}></span> Rejected</span>
                                    <span className="legend-value">{rejectedPercent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Processing Time Section */}
                    <div className="chart-card full-width">
                        <div className="chart-header-row">
                            <div>
                                <h3>Average Processing Time</h3>
                                <p className="chart-subtitle">Average days to complete clearance per department</p>
                            </div>
                            <span className="target-badge">Target: &lt; 2 Days</span>
                        </div>
                        <div className="processing-grid">
                            {analytics?.processingTimes?.length > 0 ? (
                                analytics.processingTimes.map((dept, index) => {
                                    const days = parseFloat(dept.avgDays);
                                    const isWarning = days > 2;
                                    const barWidth = Math.min((days / 3) * 100, 100);
                                    return (
                                        <div key={index} className="processing-item">
                                            <div className="processing-header">
                                                <span className="processing-name">{dept.name}</span>
                                                <span className={`processing-days ${isWarning ? 'warning' : ''}`}>
                                                    {dept.avgDays} DAYS
                                                </span>
                                            </div>
                                            <div className="processing-bar">
                                                <div
                                                    className={`processing-fill ${isWarning ? 'warning' : 'success'}`}
                                                    style={{ width: `${barWidth}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-muted" style={{ gridColumn: '1 / -1', padding: '20px' }}>
                                    No processing data available yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Performing Officers */}
                    <div className="chart-card full-width">
                        <div className="chart-header-row">
                            <div>
                                <h3>Top Performing Officers</h3>
                                <p className="chart-subtitle">Staff ranked by clearance processing speed and accuracy</p>
                            </div>
                            <button className="btn btn-link">View All Rankings</button>
                        </div>
                        <div className="table-container">
                            <table className="table officers-table">
                                <thead>
                                    <tr>
                                        <th>RANK</th>
                                        <th>OFFICER NAME</th>
                                        <th>DEPARTMENT</th>
                                        <th>AVG. TIME</th>
                                        <th>CLEARANCES</th>
                                        <th>PERFORMANCE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.topOfficers?.length > 0 ? (
                                        analytics.topOfficers.map((officer) => {
                                            const initials = officer.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
                                            const rankClass = officer.rank <= 3 ? `rank-${officer.rank}` : '';
                                            return (
                                                <tr key={officer.id}>
                                                    <td><span className={`rank-badge ${rankClass}`}>{officer.rank}</span></td>
                                                    <td>
                                                        <div className="officer-cell">
                                                            <div className="officer-avatar">{initials}</div>
                                                            <div>
                                                                <span className="officer-name">{officer.name}</span>
                                                                <span className="officer-email">{officer.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{officer.department}</td>
                                                    <td className="time-good">{officer.avgDays} Days</td>
                                                    <td>{officer.totalClearances}</td>
                                                    <td><span className="performance-score">★ {officer.performance}%</span></td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>
                                                No officer performance data available yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

