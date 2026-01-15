'use client';

// Officer Reports Page - View statistics and reports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../officer.css';

export default function OfficerReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useAuthSync('officer');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/officer/dashboard');
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const requests = data?.requests || [];
    const totalRequests = requests.length;
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;
    const approvalRate = totalRequests > 0 ? ((approvedCount / totalRequests) * 100).toFixed(1) : 0;

    // Count by type
    const siwesCount = requests.filter(r => r.type === 'siwes').length;
    const finalCount = requests.filter(r => r.type === 'final').length;
    const facultyCount = requests.filter(r => r.type === 'faculty').length;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link href="/officer" className="sidebar-logo">
                        <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                        <div className="sidebar-logo-text">
                            <span className="logo-title">KWASU Clearance</span>
                            <span className="logo-subtitle">KWASU ED SYSTEM</span>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/officer" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/officer/requests" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V8z" />
                        </svg>
                        Requests
                    </Link>
                    <Link href="/officer/reports" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                        </svg>
                        Reports
                    </Link>
                    <Link href="/officer/settings" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                        </svg>
                        Settings
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user-profile">
                        <div className="user-avatar-lg">{data?.user?.name?.charAt(0)?.toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{data?.user?.name}</span>
                            <span className="user-dept">{data?.user?.department}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="breadcrumb-nav">
                            <Link href="/officer">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Reports</span>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>Reports & Statistics</h1>
                            <p>Overview of your clearance processing performance</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="stats-grid stats-grid-4">
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">TOTAL REQUESTS</span>
                                <span className="stat-value">{totalRequests}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon completed">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">APPROVED</span>
                                <span className="stat-value">{approvedCount}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon students">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">PENDING</span>
                                <span className="stat-value">{pendingCount}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon time">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">APPROVAL RATE</span>
                                <span className="stat-value">{approvalRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown by Type */}
                    <div className="reports-section">
                        <h2>Breakdown by Clearance Type</h2>
                        <div className="stats-grid stats-grid-3">
                            <div className="report-card">
                                <div className="report-header">
                                    <span className="type-badge type-siwes">SIWES</span>
                                </div>
                                <div className="report-value">{siwesCount}</div>
                                <div className="report-label">requests</div>
                            </div>
                            <div className="report-card">
                                <div className="report-header">
                                    <span className="type-badge type-final">Final Year</span>
                                </div>
                                <div className="report-value">{finalCount}</div>
                                <div className="report-label">requests</div>
                            </div>
                            <div className="report-card">
                                <div className="report-header">
                                    <span className="type-badge type-faculty">Faculty</span>
                                </div>
                                <div className="report-value">{facultyCount}</div>
                                <div className="report-label">requests</div>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="reports-section">
                        <h2>Status Breakdown</h2>
                        <div className="status-breakdown">
                            <div className="status-bar">
                                <div
                                    className="status-segment approved"
                                    style={{ width: `${totalRequests > 0 ? (approvedCount / totalRequests) * 100 : 0}%` }}
                                    title={`Approved: ${approvedCount}`}
                                ></div>
                                <div
                                    className="status-segment pending"
                                    style={{ width: `${totalRequests > 0 ? (pendingCount / totalRequests) * 100 : 0}%` }}
                                    title={`Pending: ${pendingCount}`}
                                ></div>
                                <div
                                    className="status-segment rejected"
                                    style={{ width: `${totalRequests > 0 ? (rejectedCount / totalRequests) * 100 : 0}%` }}
                                    title={`Rejected: ${rejectedCount}`}
                                ></div>
                            </div>
                            <div className="status-legend">
                                <div className="legend-item">
                                    <span className="legend-dot approved"></span>
                                    <span>Approved ({approvedCount})</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot pending"></span>
                                    <span>Pending ({pendingCount})</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot rejected"></span>
                                    <span>Rejected ({rejectedCount})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .reports-section {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e5e7eb;
                    margin-top: 1.5rem;
                }
                .reports-section h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                .stats-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }
                .report-card {
                    background: #f9fafb;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                }
                .report-header {
                    margin-bottom: 1rem;
                }
                .report-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a4d2e;
                }
                .report-label {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .status-breakdown {
                    margin-top: 1rem;
                }
                .status-bar {
                    display: flex;
                    height: 24px;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #e5e7eb;
                }
                .status-segment {
                    transition: width 0.3s ease;
                }
                .status-segment.approved { background: #10b981; }
                .status-segment.pending { background: #f59e0b; }
                .status-segment.rejected { background: #ef4444; }
                .status-legend {
                    display: flex;
                    gap: 2rem;
                    margin-top: 1rem;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }
                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .legend-dot.approved { background: #10b981; }
                .legend-dot.pending { background: #f59e0b; }
                .legend-dot.rejected { background: #ef4444; }
                @media (max-width: 768px) {
                    .stats-grid-3 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
