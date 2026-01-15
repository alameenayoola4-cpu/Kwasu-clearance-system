'use client';

// Admin Analytics Dashboard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import MobileWarning from '../../components/MobileWarning';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../admin.css';

export default function AdminAnalytics() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useAuthSync('admin');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/admin/analytics');
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate max value for bar chart scaling
    const maxMonthlyValue = data?.monthlyTrends?.reduce((max, m) => Math.max(max, m.total), 0) || 10;

    // Calculate total for pie chart
    const totalRequests = (data?.typeDistribution?.siwes || 0) +
        (data?.typeDistribution?.final || 0) +
        (data?.typeDistribution?.faculty || 0);

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
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span className="current">Analytics</span>
                        </nav>
                        <h1>System Analytics</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Overview Stats */}
                    <div className="analytics-overview">
                        <div className="stat-card analytics-stat">
                            <div className="stat-icon primary">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Total Requests</span>
                                <span className="stat-value">{data?.overview?.totalRequests || 0}</span>
                            </div>
                        </div>

                        <div className="stat-card analytics-stat">
                            <div className="stat-icon success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Approval Rate</span>
                                <span className="stat-value">{data?.overview?.approvalRate || 0}%</span>
                            </div>
                        </div>

                        <div className="stat-card analytics-stat">
                            <div className="stat-icon warning">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Avg Processing</span>
                                <span className="stat-value">{data?.overview?.avgProcessingDays || 0} days</span>
                            </div>
                        </div>

                        <div className="stat-card analytics-stat">
                            <div className="stat-icon info">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Active Students</span>
                                <span className="stat-value">{data?.overview?.totalStudents || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="charts-grid">
                        {/* Monthly Trends Bar Chart */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Monthly Clearance Trends</h3>
                                <span className="chart-subtitle">Last 6 months</span>
                            </div>
                            <div className="bar-chart">
                                {data?.monthlyTrends?.length > 0 ? (
                                    data.monthlyTrends.map((m, i) => (
                                        <div key={i} className="bar-group">
                                            <div className="bar-container">
                                                <div
                                                    className="bar bar-approved"
                                                    style={{ height: `${(m.approved / maxMonthlyValue) * 100}%` }}
                                                    title={`Approved: ${m.approved}`}
                                                />
                                                <div
                                                    className="bar bar-pending"
                                                    style={{ height: `${(m.pending / maxMonthlyValue) * 100}%` }}
                                                    title={`Pending: ${m.pending}`}
                                                />
                                                <div
                                                    className="bar bar-rejected"
                                                    style={{ height: `${(m.rejected / maxMonthlyValue) * 100}%` }}
                                                    title={`Rejected: ${m.rejected}`}
                                                />
                                            </div>
                                            <span className="bar-label">{m.month}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data">No data available</div>
                                )}
                            </div>
                            <div className="chart-legend">
                                <span className="legend-item"><span className="dot approved"></span> Approved</span>
                                <span className="legend-item"><span className="dot pending"></span> Pending</span>
                                <span className="legend-item"><span className="dot rejected"></span> Rejected</span>
                            </div>
                        </div>

                        {/* Type Distribution */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Clearance by Type</h3>
                                <span className="chart-subtitle">Distribution breakdown</span>
                            </div>
                            <div className="donut-chart-container">
                                <svg viewBox="0 0 100 100" className="donut-chart">
                                    {totalRequests > 0 ? (
                                        <>
                                            <circle
                                                className="donut-segment siwes"
                                                cx="50" cy="50" r="40"
                                                strokeDasharray={`${(data?.typeDistribution?.siwes / totalRequests) * 251.2} 251.2`}
                                                strokeDashoffset="0"
                                            />
                                            <circle
                                                className="donut-segment final"
                                                cx="50" cy="50" r="40"
                                                strokeDasharray={`${(data?.typeDistribution?.final / totalRequests) * 251.2} 251.2`}
                                                strokeDashoffset={`${-((data?.typeDistribution?.siwes / totalRequests) * 251.2)}`}
                                            />
                                            <circle
                                                className="donut-segment faculty"
                                                cx="50" cy="50" r="40"
                                                strokeDasharray={`${(data?.typeDistribution?.faculty / totalRequests) * 251.2} 251.2`}
                                                strokeDashoffset={`${-(((data?.typeDistribution?.siwes + data?.typeDistribution?.final) / totalRequests) * 251.2)}`}
                                            />
                                        </>
                                    ) : (
                                        <circle className="donut-empty" cx="50" cy="50" r="40" />
                                    )}
                                    <text x="50" y="50" className="donut-center-text">
                                        {totalRequests}
                                    </text>
                                    <text x="50" y="60" className="donut-center-label">
                                        Total
                                    </text>
                                </svg>
                            </div>
                            <div className="type-breakdown">
                                <div className="type-item">
                                    <span className="type-color siwes"></span>
                                    <span className="type-name">SIWES</span>
                                    <span className="type-count">{data?.typeDistribution?.siwes || 0}</span>
                                </div>
                                <div className="type-item">
                                    <span className="type-color final"></span>
                                    <span className="type-name">Final Year</span>
                                    <span className="type-count">{data?.typeDistribution?.final || 0}</span>
                                </div>
                                <div className="type-item">
                                    <span className="type-color faculty"></span>
                                    <span className="type-name">Faculty</span>
                                    <span className="type-count">{data?.typeDistribution?.faculty || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div className="chart-card full-width">
                            <div className="chart-header">
                                <h3>Request Status Overview</h3>
                                <span className="chart-subtitle">Current status distribution</span>
                            </div>
                            <div className="status-bars">
                                <div className="status-bar-item">
                                    <div className="status-bar-header">
                                        <span className="status-name">Approved</span>
                                        <span className="status-count">{data?.statusDistribution?.approved || 0}</span>
                                    </div>
                                    <div className="status-bar-track">
                                        <div
                                            className="status-bar-fill approved"
                                            style={{ width: `${totalRequests > 0 ? (data?.statusDistribution?.approved / totalRequests) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="status-bar-item">
                                    <div className="status-bar-header">
                                        <span className="status-name">Pending</span>
                                        <span className="status-count">{data?.statusDistribution?.pending || 0}</span>
                                    </div>
                                    <div className="status-bar-track">
                                        <div
                                            className="status-bar-fill pending"
                                            style={{ width: `${totalRequests > 0 ? (data?.statusDistribution?.pending / totalRequests) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="status-bar-item">
                                    <div className="status-bar-header">
                                        <span className="status-name">Rejected</span>
                                        <span className="status-count">{data?.statusDistribution?.rejected || 0}</span>
                                    </div>
                                    <div className="status-bar-track">
                                        <div
                                            className="status-bar-fill rejected"
                                            style={{ width: `${totalRequests > 0 ? (data?.statusDistribution?.rejected / totalRequests) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
