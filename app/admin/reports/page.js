'use client';

// Admin Reports Page
import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import '../../student/student.css';
import '../admin.css';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalOfficers: 0,
        pendingClearances: 0,
        approvedClearances: 0,
        rejectedClearances: 0,
    });
    const [dateRange, setDateRange] = useState('30days');

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            const response = await fetch('/api/admin/dashboard');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalStudents: data.stats?.totalStudents || 0,
                    totalOfficers: data.stats?.totalOfficers || 0,
                    pendingClearances: data.stats?.pendingClearances || 0,
                    approvedClearances: data.stats?.approvedClearances || 0,
                    rejectedClearances: data.stats?.rejectedClearances || 0,
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (reportType = 'statistics') => {
        try {
            const response = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportType }),
            });

            if (response.ok) {
                const data = await response.json();
                // Create and download file
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

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <AdminSidebar userName="Admin Central" />

            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span className="current">Reports</span>
                        </nav>
                        <h1>Reports & Analytics</h1>
                    </div>
                    <div className="topbar-right">
                        <select
                            className="filter-select"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="year">This Year</option>
                        </select>
                        <button className="btn btn-outline" onClick={() => handleExport('statistics')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Stats Overview */}
                    <div className="stats-grid admin-stats">
                        <div className="stat-card">
                            <div className="stat-icon students">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73c1.17-.51 2.61-.9 4.24-.9zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.62c0-.83.23-1.61.63-2.28zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1c.4.67.63 1.45.63 2.28V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3z" />
                                </svg>
                            </div>
                            <span className="stat-label">TOTAL STUDENTS</span>
                            <span className="stat-value">{stats.totalStudents.toLocaleString()}</span>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon officers">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                            </div>
                            <span className="stat-label">ACTIVE OFFICERS</span>
                            <span className="stat-value">{stats.totalOfficers}</span>
                        </div>

                        <div className="stat-card highlight">
                            <div className="stat-badge">Priority</div>
                            <div className="stat-icon pending-highlight">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm-2 14l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                            </div>
                            <span className="stat-label">PENDING CLEARANCES</span>
                            <span className="stat-value">{stats.pendingClearances.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Reports Grid */}
                    <div className="reports-grid">
                        {/* Clearance Summary */}
                        <div className="officers-section">
                            <div className="section-header">
                                <div>
                                    <h2>Clearance Summary</h2>
                                    <p className="section-subtitle">Overview of clearance requests status</p>
                                </div>
                            </div>
                            <div className="report-stats">
                                <div className="report-stat-item">
                                    <div className="report-stat-icon approved">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    </div>
                                    <div className="report-stat-content">
                                        <span className="report-stat-value">{stats.approvedClearances}</span>
                                        <span className="report-stat-label">Approved</span>
                                    </div>
                                </div>
                                <div className="report-stat-item">
                                    <div className="report-stat-icon pending">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                        </svg>
                                    </div>
                                    <div className="report-stat-content">
                                        <span className="report-stat-value">{stats.pendingClearances}</span>
                                        <span className="report-stat-label">Pending</span>
                                    </div>
                                </div>
                                <div className="report-stat-item">
                                    <div className="report-stat-icon rejected">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </div>
                                    <div className="report-stat-content">
                                        <span className="report-stat-value">{stats.rejectedClearances}</span>
                                        <span className="report-stat-label">Rejected</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="officers-section">
                            <div className="section-header">
                                <div>
                                    <h2>Quick Reports</h2>
                                    <p className="section-subtitle">Generate common reports</p>
                                </div>
                            </div>
                            <div className="quick-actions-list">
                                <button className="quick-action-btn" onClick={() => handleExport('clearance')}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                    Student Clearance Report
                                </button>
                                <button className="quick-action-btn" onClick={() => handleExport('officers')}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Officer Activity Report
                                </button>
                                <button className="quick-action-btn" onClick={() => handleExport('statistics')}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                    Monthly Statistics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-5);
                }

                .report-stats {
                    display: flex;
                    gap: var(--space-6);
                    padding: var(--space-4) 0;
                }

                .report-stat-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .report-stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .report-stat-icon.approved {
                    background-color: #dcfce7;
                    color: #16a34a;
                }

                .report-stat-icon.pending {
                    background-color: #fef3c7;
                    color: #d97706;
                }

                .report-stat-icon.rejected {
                    background-color: #fee2e2;
                    color: #dc2626;
                }

                .report-stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .report-stat-value {
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    color: var(--color-text);
                }

                .report-stat-label {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-muted);
                }

                .quick-actions-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .quick-action-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    width: 100%;
                    padding: var(--space-3) var(--space-4);
                    background-color: var(--color-background);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    color: var(--color-text);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .quick-action-btn:hover {
                    background-color: var(--color-primary);
                    color: var(--color-white);
                    border-color: var(--color-primary);
                }

                .filter-select {
                    padding: var(--space-2) var(--space-4);
                    padding-right: var(--space-6);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    background-color: var(--color-white);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    color: var(--color-text);
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    transition: all 0.2s ease;
                }

                .filter-select:hover {
                    border-color: var(--color-primary);
                }

                .filter-select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
                }

                @media (max-width: 768px) {
                    .reports-grid {
                        grid-template-columns: 1fr;
                    }

                    .report-stats {
                        flex-direction: column;
                        gap: var(--space-4);
                    }
                }
            `}</style>
        </div>
    );
}
