'use client';

// Clearance Status Page - View current status of a clearance request
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentSidebar from '../../../components/StudentSidebar';
import '../../student.css';
import '../status.css';

export default function StatusPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStatus();
    }, [id]);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`/api/student/clearance/${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load status');
            }

            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved':
                return {
                    icon: (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    ),
                    class: 'approved',
                    title: 'Clearance Approved!',
                    message: 'Your clearance has been approved. You can now download your clearance certificate.',
                };
            case 'rejected':
                return {
                    icon: (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    ),
                    class: 'rejected',
                    title: 'Clearance Rejected',
                    message: 'Your clearance request has been rejected. Please review the reason and take action.',
                };
            default:
                return {
                    icon: (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    ),
                    class: 'pending',
                    title: 'Under Review',
                    message: 'Your clearance request is currently being reviewed by the clearance officer.',
                };
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <StudentSidebar userName="Student" />
                <main className="dashboard-main">
                    <div className="dashboard-loading">
                        <div className="spinner spinner-lg"></div>
                        <p>Loading status...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-layout">
                <StudentSidebar userName="Student" />
                <main className="dashboard-main">
                    <div className="dashboard-error">
                        <p>{error}</p>
                        <button onClick={() => router.push('/student')} className="btn btn-primary">
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const statusInfo = getStatusInfo(data?.request?.status);

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName="Student" />

            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <Link href="/student/history">History</Link>
                            <span>&gt;</span>
                            <span className="current">Status</span>
                        </nav>
                        <h1>Clearance Status</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* Status Card */}
                    <div className={`status-card ${statusInfo.class}`}>
                        <div className="status-icon">
                            {statusInfo.icon}
                        </div>
                        <h2>{statusInfo.title}</h2>
                        <p>{statusInfo.message}</p>

                        {data?.request?.status === 'approved' && (
                            <Link href={`/student/certificate/${id}`} className="btn btn-primary">
                                Download Certificate
                            </Link>
                        )}

                        {data?.request?.status === 'rejected' && (
                            <Link href={`/student/apply/${data?.request?.type}`} className="btn btn-primary">
                                Re-apply for Clearance
                            </Link>
                        )}
                    </div>

                    {/* Details Card */}
                    <div className="details-card">
                        <h2>Application Details</h2>

                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Application ID</span>
                                <span className="detail-value">{data?.request?.request_id}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Clearance Type</span>
                                <span className="detail-value">
                                    {data?.request?.type === 'final' ? 'Final Year Clearance' : 'SIWES Clearance'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Date Submitted</span>
                                <span className="detail-value">{data?.request?.created_at}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <span className={`badge badge-${data?.request?.status}`}>
                                    {data?.request?.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {data?.request?.rejection_reason && (
                            <div className="rejection-reason">
                                <h3>Rejection Reason</h3>
                                <p>{data?.request?.rejection_reason}</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="timeline-card">
                        <h2>Application Timeline</h2>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-dot submitted"></div>
                                <div className="timeline-content">
                                    <span className="timeline-status">SUBMITTED</span>
                                    <p>Application submitted successfully</p>
                                    <span className="timeline-date">{data?.request?.created_at}</span>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className={`timeline-dot ${data?.request?.status === 'pending' ? 'active' : 'completed'}`}></div>
                                <div className="timeline-content">
                                    <span className="timeline-status">UNDER REVIEW</span>
                                    <p>Clearance officer reviewing your documents</p>
                                </div>
                            </div>
                            {data?.request?.status !== 'pending' && (
                                <div className="timeline-item">
                                    <div className={`timeline-dot ${data?.request?.status}`}></div>
                                    <div className="timeline-content">
                                        <span className="timeline-status">
                                            {data?.request?.status === 'approved' ? 'APPROVED' : 'REJECTED'}
                                        </span>
                                        <p>
                                            {data?.request?.status === 'approved'
                                                ? 'Your clearance has been approved'
                                                : 'Your clearance was rejected'
                                            }
                                        </p>
                                        <span className="timeline-date">{data?.request?.reviewed_at}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
