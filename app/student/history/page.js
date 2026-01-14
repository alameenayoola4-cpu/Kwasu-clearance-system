'use client';

// Clearance History Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentSidebar from '../../components/StudentSidebar';
import '../student.css';

export default function ClearanceHistory() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [clearances, setClearances] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/student/history');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load history');
            }

            setClearances(result.data?.requests || []);
            setStudentInfo(result.data?.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            pending: 'badge badge-pending',
            approved: 'badge badge-approved',
            rejected: 'badge badge-rejected',
        };
        const labels = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
        };
        return <span className={classes[status]}>{labels[status]}</span>;
    };

    const getTypeBadge = (type) => {
        const labels = {
            siwes: 'SIWES',
            'final-year': 'Final Year',
            faculty: 'Faculty',
        };
        return labels[type] || type;
    };

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName={studentInfo?.name || 'Student'} />

            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Clearance History</span>
                        </nav>
                        <h1>Clearance History</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    <p className="apply-intro">View all your clearance applications and their status</p>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                        </div>
                    ) : clearances.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <h3>No clearance applications yet</h3>
                            <p>Apply for your first clearance to see it here</p>
                            <Link href="/student/apply" className="btn btn-primary">
                                Apply for Clearance
                            </Link>
                        </div>
                    ) : (
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Clearance ID</th>
                                        <th>Type</th>
                                        <th>Date Applied</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clearances.map((c) => (
                                        <tr key={c.id}>
                                            <td className="clearance-id">{c.request_id}</td>
                                            <td>{getTypeBadge(c.type)}</td>
                                            <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(c.status)}</td>
                                            <td>
                                                <Link href={`/student/status/${c.id}`} className="btn btn-sm btn-outline">
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .loading-state,
                .error-state,
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }
                .empty-icon {
                    width: 80px;
                    height: 80px;
                    background: #f3f4f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    margin-bottom: 16px;
                }
                .empty-state h3 {
                    margin-bottom: 8px;
                }
                .empty-state p {
                    color: #6b7280;
                    margin-bottom: 20px;
                }
                .history-table-container {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .history-table th,
                .history-table td {
                    padding: 16px;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }
                .history-table th {
                    background: #f9fafb;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #6b7280;
                }
                .history-table tr:hover {
                    background: #f9fafb;
                }
                .clearance-id {
                    font-family: monospace;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
