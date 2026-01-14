'use client';

// Student Dashboard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSync } from '../hooks/useAuthSync';
import StudentSidebar from '../components/StudentSidebar';
import './student.css';

export default function StudentDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    // Listen for auth changes from other tabs
    useAuthSync('student');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await fetch('/api/student/dashboard');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load dashboard');
            }

            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Broadcast logout to other tabs
            const { broadcastLogout } = await import('../hooks/useAuthSync');
            broadcastLogout();

            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            pending: 'badge badge-pending',
            approved: 'badge badge-approved',
            rejected: 'badge badge-rejected',
        };
        const labels = {
            pending: 'PENDING REVIEW',
            approved: 'APPROVED',
            rejected: 'REJECTED',
        };
        return <span className={classes[status]}>{labels[status]}</span>;
    };

    // Get current approval stage for progress stepper
    const getApprovalStage = (clearance) => {
        if (!clearance) return 0;
        if (clearance.status === 'approved') return 3;
        if (clearance.status === 'rejected') return -1;
        // For pending, return current stage (simulated based on data)
        return clearance.current_stage || 1;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={() => router.push('/login')} className="btn btn-primary">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName={data?.user?.name || 'Student'} />

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <span className="session-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Academic Session: {data?.session?.academic || '2025/2026'}
                        </span>
                    </div>
                    <div className="topbar-right">
                        <button className="notification-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="notification-dot"></span>
                        </button>
                        <div className="user-info">
                            <span className="user-name">{data?.user?.name}</span>
                            <span className="user-matric">MAT NO: {data?.user?.matric_no}</span>
                        </div>
                        <div className="user-avatar">
                            {data?.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <div className="welcome-text">
                            <h1>Welcome back, {data?.user?.name?.split(' ')[0]}</h1>
                            <p>
                                Your clearance journey is <strong className="text-primary">{data?.progress || 0}% complete</strong>.
                            </p>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${data?.progress || 0}%` }}></div>
                            </div>
                        </div>
                        <Link href="/student/apply" className="btn btn-primary btn-lg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Apply for New Clearance
                        </Link>
                    </div>

                    {/* Clearance Cards - Dynamic from database */}
                    <div className="clearance-grid">
                        {(!data?.eligibleClearanceTypes || data.eligibleClearanceTypes.length === 0) ? (
                            <div className="no-clearances-card">
                                <div className="no-clearances-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v4M12 16h.01" />
                                    </svg>
                                </div>
                                <h3>No Clearances Available</h3>
                                <p>There are no clearances available for your level ({data?.user?.level || 100} Level) at this time.</p>
                                <p className="text-muted">Please check back later or contact the administration.</p>
                            </div>
                        ) : (
                            <>
                                {/* SIWES Clearance Card */}
                                <div className="clearance-card">
                                    <div className="clearance-card-header">
                                        <div className="clearance-icon siwes">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                            </svg>
                                        </div>
                                        <h3>SIWES Clearance</h3>
                                        {data?.siwes && getStatusBadge(data.siwes.status)}
                                    </div>

                                    {data?.siwes ? (
                                        <div className="clearance-card-body">
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <span className="info-label">APPLICATION ID</span>
                                                    <span className="info-value">{data.siwes.request_id}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">SUBMITTED DATE</span>
                                                    <span className="info-value">{new Date(data.siwes.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>

                                            {/* Progress Stepper */}
                                            <div className="progress-stepper">
                                                <span className="stepper-label">CURRENT STATUS: <strong className="text-primary">DEPARTMENTAL LEVEL</strong></span>
                                                <div className="stepper-dots">
                                                    <div className={`stepper-step ${getApprovalStage(data.siwes) >= 1 ? 'completed' : ''}`}>
                                                        <div className="step-dot"></div>
                                                        <span className="step-label">SUPERVISOR</span>
                                                    </div>
                                                    <div className="stepper-line"></div>
                                                    <div className={`stepper-step ${getApprovalStage(data.siwes) >= 2 ? 'completed' : ''} ${getApprovalStage(data.siwes) === 1 ? 'active' : ''}`}>
                                                        <div className="step-dot"></div>
                                                        <span className="step-label">HOD OFFICE</span>
                                                    </div>
                                                    <div className="stepper-line"></div>
                                                    <div className={`stepper-step ${getApprovalStage(data.siwes) >= 3 ? 'completed' : ''}`}>
                                                        <div className="step-dot"></div>
                                                        <span className="step-label">SIWES UNIT</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href={`/student/status/${data.siwes.id}`} className="btn btn-outline btn-block">
                                                View Full Details
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="clearance-card-body empty">
                                            <p>You haven't applied for SIWES clearance yet.</p>
                                            <Link href="/student/apply/siwes" className="btn btn-primary">
                                                Apply Now
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Final Clearance Card */}
                                <div className="clearance-card">
                                    <div className="clearance-card-header">
                                        <div className="clearance-icon final">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                <polyline points="9 12 11 14 15 10" />
                                            </svg>
                                        </div>
                                        <h3>Final Clearance</h3>
                                        {data?.final && getStatusBadge(data.final.status)}
                                    </div>

                                    {data?.final ? (
                                        <div className="clearance-card-body">
                                            {data.final.status === 'approved' ? (
                                                <>
                                                    {/* Requirement Checklist */}
                                                    <div className="requirement-checklist">
                                                        <span className="checklist-title">REQUIREMENT CHECKLIST</span>
                                                        <div className="checklist-items">
                                                            <div className="checklist-item">
                                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                                                                </svg>
                                                                <span>University Library</span>
                                                                <span className="cleared-badge">Cleared</span>
                                                            </div>
                                                            <div className="checklist-item">
                                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                                                                </svg>
                                                                <span>Bursary (School Fees)</span>
                                                                <span className="cleared-badge">Cleared</span>
                                                            </div>
                                                            <div className="checklist-item">
                                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                                                                </svg>
                                                                <span>Student Affairs</span>
                                                                <span className="cleared-badge">Cleared</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="success-message">
                                                        <div className="success-icon">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <line x1="12" y1="16" x2="12" y2="12" />
                                                                <line x1="12" y1="8" x2="12.01" y2="8" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <strong>CONGRATULATION!</strong>
                                                            <p>Your final clearance has been fully approved by all units. You can now download your certificate.</p>
                                                        </div>
                                                    </div>
                                                    <Link href={`/student/certificate/${data.final.id}`} className="btn btn-primary btn-block">
                                                        Download Clearance Letter
                                                    </Link>
                                                </>
                                            ) : data.final.status === 'rejected' ? (
                                                <>
                                                    <div className="error-message">
                                                        <strong>Action Required</strong>
                                                        <p>{data.final.rejection_reason}</p>
                                                    </div>
                                                    <Link href={`/student/status/${data.final.id}`} className="btn btn-danger btn-block">
                                                        View Details & Re-upload
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="info-grid">
                                                        <div className="info-item">
                                                            <span className="info-label">APPLICATION ID</span>
                                                            <span className="info-value">{data.final.request_id}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">SUBMITTED DATE</span>
                                                            <span className="info-value">{new Date(data.final.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/student/status/${data.final.id}`} className="btn btn-outline btn-block">
                                                        View Full Details
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="clearance-card-body empty">
                                            <p>You haven't applied for Final clearance yet.</p>
                                            <Link href="/student/apply/final-year" className="btn btn-primary">
                                                Apply Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recent Updates */}
                    <div className="recent-updates">
                        <h2>Recent Status Updates</h2>
                        <div className="updates-list">
                            {data?.recentUpdates?.length > 0 ? (
                                data.recentUpdates.map((update, index) => (
                                    <div key={index} className="update-item">
                                        <div className={`update-icon-badge ${update.type}`}>
                                            {update.type === 'approved' ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : update.type === 'document' ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="update-content">
                                            <strong>{update.title}</strong>
                                            <p>{update.description}</p>
                                        </div>
                                        <span className="update-time">{update.time}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-updates">
                                    <p>No recent activity yet. Your clearance updates will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
}
