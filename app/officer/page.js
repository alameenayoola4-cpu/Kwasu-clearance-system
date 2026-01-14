'use client';

// Officer Dashboard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MobileWarning from '../components/MobileWarning';
import { useAuthSync } from '../hooks/useAuthSync';
import './officer.css';

export default function OfficerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Listen for auth changes from other tabs
    useAuthSync('officer');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await fetch('/api/officer/dashboard');
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
        return <span className={classes[status]}>{status}</span>;
    };

    const getTypeBadge = (type) => {
        const classes = {
            siwes: 'badge badge-siwes',
            final: 'badge badge-final',
        };
        return <span className={classes[type]}>{type === 'siwes' ? 'SIWES' : 'Final Clearance'}</span>;
    };

    // Filter requests
    const filteredRequests = data?.requests?.filter(req => {
        if (filter !== 'all' && req.status !== filter) return false;
        if (typeFilter !== 'all' && req.type !== typeFilter) return false;
        return true;
    }) || [];

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
            {/* Mobile Warning for Officer */}
            <MobileWarning role="officer" />

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link href="/officer" className="sidebar-logo">
                        <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                        <div className="sidebar-logo-text">
                            <span className="logo-title">UniClearance</span>
                            <span className="logo-subtitle">KWASU ED SYSTEM</span>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/officer" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                            <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/officer/requests" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Requests
                    </Link>
                    <Link href="/officer/reports" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        Reports
                    </Link>
                    <Link href="/officer/settings" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v10" />
                        </svg>
                        Settings
                    </Link>
                </nav>

                <div className="sidebar-user">
                    <div className="user-avatar">
                        {data?.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{data?.user?.name}</span>
                        <span className="user-dept">{data?.user?.department}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <h1>Officer Clearance Dashboard</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input type="text" placeholder="Search Matric No or Name..." />
                        </div>
                        <button className="notification-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            </svg>
                            <span className="notification-dot"></span>
                        </button>
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                            Logout
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">PENDING REVIEWS</span>
                                <span className="stat-value">{data?.stats?.pending || 0}</span>
                                <span className="stat-change positive">+5 new</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon completed">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">COMPLETED TODAY</span>
                                <span className="stat-value">{data?.stats?.completedToday || 0}</span>
                                <span className="stat-change">Target: 20</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon students">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">ACTIVE STUDENTS</span>
                                <span className="stat-value">{data?.stats?.totalStudents?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon time">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">AVG RESPONSE TIME</span>
                                <span className="stat-value">{data?.stats?.avgResponseTime || '0'} <small>Days</small></span>
                            </div>
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div className="requests-section">
                        <div className="requests-header">
                            <div>
                                <h2>Student Clearance Requests</h2>
                                <p>Review and approve pending documentation.</p>
                            </div>
                            <div className="requests-filters">
                                <div className="filter-tabs">
                                    <button
                                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        All Requests
                                    </button>
                                    <button
                                        className={`filter-tab ${typeFilter === 'siwes' ? 'active' : ''}`}
                                        onClick={() => setTypeFilter(typeFilter === 'siwes' ? 'all' : 'siwes')}
                                    >
                                        SIWES Clearance
                                    </button>
                                    <button
                                        className={`filter-tab ${typeFilter === 'final' ? 'active' : ''}`}
                                        onClick={() => setTypeFilter(typeFilter === 'final' ? 'all' : 'final')}
                                    >
                                        Final Year Clearance
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>STUDENT NAME</th>
                                        <th>MATRIC NO</th>
                                        <th>TYPE</th>
                                        <th>DATE SUBMITTED</th>
                                        <th>STATUS</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map(req => (
                                        <tr key={req.id}>
                                            <td>
                                                <div className="student-cell">
                                                    <div className="student-avatar">
                                                        {req.student_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <span>{req.student_name}</span>
                                                </div>
                                            </td>
                                            <td>{req.matric_no}</td>
                                            <td>{getTypeBadge(req.type)}</td>
                                            <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(req.status)}</td>
                                            <td>
                                                {req.status === 'pending' ? (
                                                    <Link href={`/officer/review/${req.id}`} className="btn btn-primary btn-sm">
                                                        Review
                                                    </Link>
                                                ) : (
                                                    <Link href={`/officer/review/${req.id}`} className="btn btn-ghost btn-sm">
                                                        View
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>
                                                No requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span>Showing {filteredRequests.length} of {data?.requests?.length || 0} requests</span>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </div>
                            <div className="info-content">
                                <h4>Academic Year 2023/2024 Clearance Cycle</h4>
                                <p>The deadline for SIWES documentation submission for the current batch is Friday, November 15th. Please prioritize SIWES reviews to ensure students meet the industry deadline.</p>
                            </div>
                        </div>
                        <div className="info-card office-hours">
                            <h4>OFFICE HOURS</h4>
                            <div className="hours-row">
                                <span>Mon-Fri</span>
                                <span className="hours-value">08:00 - 16:00</span>
                            </div>
                            <div className="hours-row">
                                <span>Response Goal</span>
                                <span className="hours-value">&lt; 48 Hours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
