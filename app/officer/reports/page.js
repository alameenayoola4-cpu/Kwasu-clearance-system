'use client';

// Officer Reports Page - View statistics and reports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OfficerSidebar from '../../components/OfficerSidebar';
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
            <OfficerSidebar userName={data?.user?.name} userDepartment={data?.user?.department} />

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
