'use client';

// Officer Requests Page - View all clearance requests
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CustomDropdown from '../../components/CustomDropdown';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../officer.css';

export default function OfficerRequestsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

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

    const getStatusBadge = (status) => {
        const config = {
            pending: { class: 'status-pending', label: 'Pending' },
            approved: { class: 'status-approved', label: 'Approved' },
            rejected: { class: 'status-rejected', label: 'Rejected' },
        };
        const c = config[status] || { class: '', label: status };
        return <span className={`status-badge ${c.class}`}>{c.label}</span>;
    };

    const getTypeBadge = (type) => {
        const config = {
            siwes: { class: 'type-siwes', label: 'SIWES' },
            final: { class: 'type-final', label: 'Final Clearance' },
            faculty: { class: 'type-faculty', label: 'Faculty Clearance' },
        };
        const c = config[type] || { class: '', label: type };
        return <span className={`type-badge ${c.class}`}>{c.label}</span>;
    };

    const filteredRequests = (data?.requests || [])
        .filter(req => {
            if (statusFilter !== 'all' && req.status !== statusFilter) return false;
            if (typeFilter !== 'all' && req.type !== typeFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return req.student_name?.toLowerCase().includes(q) || req.matric_no?.toLowerCase().includes(q);
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
                <p>Loading requests...</p>
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
                    <Link href="/officer/requests" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V8z" />
                        </svg>
                        Requests
                    </Link>
                    <Link href="/officer/reports" className="nav-item">
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
                            <span className="current">All Requests</span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by Matric No or Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>All Clearance Requests</h1>
                            <p>View and manage all student clearance requests</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-row">
                        <div className="filter-tabs-row">
                            <button className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                            <button className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}>Pending</button>
                            <button className={`filter-tab ${statusFilter === 'approved' ? 'active' : ''}`} onClick={() => setStatusFilter('approved')}>Approved</button>
                            <button className={`filter-tab ${statusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setStatusFilter('rejected')}>Rejected</button>
                        </div>
                        <div className="filter-controls">
                            <CustomDropdown
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'siwes', label: 'SIWES' },
                                    { value: 'final', label: 'Final Year' },
                                    { value: 'faculty', label: 'Faculty' },
                                ]}
                            />
                            <CustomDropdown
                                value={sortBy}
                                onChange={setSortBy}
                                options={[
                                    { value: 'newest', label: 'Newest First' },
                                    { value: 'oldest', label: 'Oldest First' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STUDENT NAME</th>
                                    <th>MATRIC NO</th>
                                    <th>TYPE</th>
                                    <th>DEPARTMENT</th>
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
                                        <td>{req.department || '-'}</td>
                                        <td>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td>{getStatusBadge(req.status)}</td>
                                        <td>
                                            <Link href={`/officer/review/${req.id}`} className={`btn btn-sm ${req.status === 'pending' ? 'btn-primary' : 'btn-outline'}`}>
                                                {req.status === 'pending' ? 'Review' : 'View'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            <div className="empty-message">
                                                <p>No requests found</p>
                                                <span>Try adjusting your filters</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer">
                        <span className="showing-text">Showing {filteredRequests.length} of {data?.requests?.length || 0} requests</span>
                        <div className="pagination">
                            <button className="page-btn" disabled>&lt;</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn" disabled>&gt;</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
