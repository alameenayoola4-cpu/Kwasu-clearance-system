'use client';

// Officer Dashboard - Redesigned to match reference layout
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MobileWarning from '../components/MobileWarning';
import { useAuthSync } from '../hooks/useAuthSync';
import '../student/student.css';
import './officer.css';

export default function OfficerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

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
            const { broadcastLogout } = await import('../hooks/useAuthSync');
            broadcastLogout();
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'status-pending', label: 'Pending' },
            approved: { class: 'status-approved', label: 'Approved' },
            rejected: { class: 'status-rejected', label: 'Rejected' },
            flagged: { class: 'status-flagged', label: 'Flagged' },
        };
        const config = statusConfig[status] || { class: '', label: status };
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    const getTypeBadge = (type) => {
        const typeConfig = {
            siwes: { class: 'type-siwes', label: 'SIWES' },
            final: { class: 'type-final', label: 'Final Clearance' },
            faculty: { class: 'type-faculty', label: 'Faculty Clearance' },
        };
        const config = typeConfig[type] || { class: '', label: type };
        return <span className={`type-badge ${config.class}`}>{config.label}</span>;
    };

    // Filter and sort requests
    const filteredRequests = (data?.requests || [])
        .filter(req => {
            if (statusFilter !== 'all' && req.status !== statusFilter) return false;
            if (typeFilter !== 'all' && req.type !== typeFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return req.student_name?.toLowerCase().includes(query) ||
                    req.matric_no?.toLowerCase().includes(query);
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            return 0;
        });

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
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                    </Link>
                </nav>

                {/* User Profile at Bottom */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-profile">
                        <div className="user-avatar-lg">
                            {data?.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{data?.user?.name}</span>
                            <span className="user-dept">{data?.user?.department}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Header Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <h1>Officer Clearance Dashboard</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search Matric No or Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="icon-btn notification-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {data?.stats?.pending > 0 && <span className="notification-dot"></span>}
                        </button>
                        <button className="icon-btn help-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Stats Cards Row */}
                    <div className="stats-grid stats-grid-4">
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">PENDING REVIEWS</span>
                                <div className="stat-value-row">
                                    <span className="stat-value">{data?.stats?.pending || 0}</span>
                                    <span className="stat-change positive">+5 new</span>
                                </div>
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
                                <div className="stat-value-row">
                                    <span className="stat-value">{data?.stats?.completedToday || 0}</span>
                                    <span className="stat-target">Target: 20</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon students">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
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

                    {/* Requests Section */}
                    <div className="requests-section">
                        <div className="requests-header">
                            <div className="requests-title">
                                <h2>Student Clearance Requests</h2>
                                <p>Review and approve pending documentation.</p>
                            </div>
                            <div className="requests-controls">
                                <div className="filter-dropdown">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                    </svg>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <option value="all">Filter Type</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="sort-dropdown">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="newest">Sort: Newest</option>
                                        <option value="oldest">Sort: Oldest</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Type Filter Tabs */}
                        <div className="filter-tabs-row">
                            <button
                                className={`filter-tab ${typeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setTypeFilter('all')}
                            >
                                All Requests
                            </button>
                            <button
                                className={`filter-tab ${typeFilter === 'siwes' ? 'active' : ''}`}
                                onClick={() => setTypeFilter('siwes')}
                            >
                                SIWES Clearance
                            </button>
                            <button
                                className={`filter-tab ${typeFilter === 'final' ? 'active' : ''}`}
                                onClick={() => setTypeFilter('final')}
                            >
                                Final Year Clearance
                            </button>
                            <button
                                className={`filter-tab ${typeFilter === 'faculty' ? 'active' : ''}`}
                                onClick={() => setTypeFilter('faculty')}
                            >
                                Faculty Clearance
                            </button>
                        </div>

                        {/* Requests Table */}
                        <div className="table-container">
                            <table className="data-table">
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
                                                    <span className="student-name">{req.student_name}</span>
                                                </div>
                                            </td>
                                            <td className="matric-cell">{req.matric_no}</td>
                                            <td>{getTypeBadge(req.type)}</td>
                                            <td>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td>{getStatusBadge(req.status)}</td>
                                            <td>
                                                {req.status === 'pending' ? (
                                                    <Link href={`/officer/review/${req.id}`} className="btn btn-primary btn-sm">
                                                        Review
                                                    </Link>
                                                ) : (
                                                    <Link href={`/officer/review/${req.id}`} className="btn btn-outline btn-sm">
                                                        View
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                <div className="empty-message">
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                    <p>No requests found</p>
                                                    <span>Requests matching your filters will appear here.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer with Pagination */}
                        <div className="table-footer">
                            <span className="showing-text">
                                Showing {filteredRequests.length} of {data?.requests?.length || 0} pending requests
                            </span>
                            <div className="pagination">
                                <button className="page-btn" disabled>&lt;</button>
                                <button className="page-btn active">1</button>
                                <button className="page-btn" disabled>&gt;</button>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards Row */}
                    <div className="info-grid">
                        <div className="info-card notice-card">
                            <div className="info-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        <div className="info-card office-hours-card">
                            <div className="office-hours-header">
                                <h4>OFFICE HOURS</h4>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
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
