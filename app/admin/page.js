'use client';

// Admin Dashboard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import MobileWarning from '../components/MobileWarning';
import { useAuthSync } from '../hooks/useAuthSync';
import '../student/student.css';
import './admin.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOfficer, setNewOfficer] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        clearance_type: 'siwes',
    });
    const [submitting, setSubmitting] = useState(false);

    // Listen for auth changes from other tabs
    useAuthSync('admin');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await fetch('/api/admin/dashboard');
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
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleAddOfficer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/admin/officers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOfficer),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create officer');
            }

            // Success - refresh and close modal
            setShowAddModal(false);
            setNewOfficer({
                name: '',
                email: '',
                password: '',
                department: '',
                clearance_type: 'siwes',
            });
            fetchDashboard();

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getClearanceTypeBadge = (type) => {
        const labels = {
            siwes: 'SIWES',
            final: 'Final Clearance',
            both: 'All Types',
        };
        return <span className="badge badge-siwes">{labels[type] || type}</span>;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    if (error && !data) {
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
            {/* Mobile Warning for Admin */}
            <MobileWarning role="admin" />

            {/* Sidebar */}
            <AdminSidebar userName="Admin Central" />

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span className="current">Overview</span>
                        </nav>
                        <h1>Admin System Overview</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <input type="text" placeholder="Search data..." />
                        </div>
                        <button className="notification-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Stats Grid */}
                    <div className="stats-grid admin-stats">
                        <div className="stat-card">
                            <span className="stat-change positive">+2.5%</span>
                            <div className="stat-icon students">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73c1.17-.51 2.61-.9 4.24-.9zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.62c0-.83.23-1.61.63-2.28zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1c.4.67.63 1.45.63 2.28V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3z" />
                                </svg>
                            </div>
                            <span className="stat-label">TOTAL STUDENTS</span>
                            <span className="stat-value">{data?.stats?.totalStudents?.toLocaleString() || 0}</span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-change negative">-1.2%</span>
                            <div className="stat-icon officers">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                            </div>
                            <span className="stat-label">ACTIVE OFFICERS</span>
                            <span className="stat-value">{data?.stats?.totalOfficers || 0}</span>
                        </div>

                        <div className="stat-card highlight">
                            <div className="stat-badge">Priority</div>
                            <div className="stat-icon pending-highlight">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm-2 14l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                            </div>
                            <span className="stat-label">PENDING CLEARANCES</span>
                            <span className="stat-value">{data?.stats?.pendingClearances?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    {/* Officers Section */}
                    <div className="officers-section">
                        <div className="section-header">
                            <div>
                                <h2>Manage Officers</h2>
                                <p>Configure department heads and clearance approvers.</p>
                            </div>
                            <div className="section-actions">
                                <button className="btn btn-ghost">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                    </svg>
                                    Filter
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                    + Add New Officer
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>OFFICER NAME</th>
                                        <th>DEPARTMENT / OFFICE</th>
                                        <th>CLEARANCE TYPE</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.officers?.map(officer => (
                                        <tr key={officer.id}>
                                            <td>
                                                <div className="officer-cell">
                                                    <div className="officer-avatar">
                                                        {officer.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <div className="officer-info">
                                                        <span className="officer-name">{officer.name}</span>
                                                        <span className="officer-email">{officer.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{officer.department}</td>
                                            <td>{getClearanceTypeBadge(officer.clearance_type)}</td>
                                            <td>
                                                <span className={`status-dot ${officer.status}`}>
                                                    {officer.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn" title="Edit">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button className="action-btn" title="Link">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!data?.officers || data.officers.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>
                                                No officers found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span>Showing {data?.officers?.length || 0} officers</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Officer Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Add Clearance Officer</h3>
                                <p>Assign a new officer to manage student clearances.</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddOfficer}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div className="input-with-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Dr. Samuel Adeyemi"
                                            value={newOfficer.name}
                                            onChange={(e) => setNewOfficer(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Official Email</label>
                                    <div className="input-with-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="s.adeyemi@kwasu.edu.ng"
                                            value={newOfficer.email}
                                            onChange={(e) => setNewOfficer(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Initial password"
                                        value={newOfficer.password}
                                        onChange={(e) => setNewOfficer(prev => ({ ...prev, password: e.target.value }))}
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-select"
                                            value={newOfficer.department}
                                            onChange={(e) => setNewOfficer(prev => ({ ...prev, department: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            <option value="SIWES Unit">SIWES Unit</option>
                                            <option value="Registry">Registry</option>
                                            <option value="Bursary">Bursary</option>
                                            <option value="Library">Library</option>
                                            <option value="Student Affairs">Student Affairs</option>
                                            <option value="Faculty of Sciences">Faculty of Sciences</option>
                                            <option value="Faculty of Engineering">Faculty of Engineering</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Clearance Type</label>
                                        <select
                                            className="form-select"
                                            value={newOfficer.clearance_type}
                                            onChange={(e) => setNewOfficer(prev => ({ ...prev, clearance_type: e.target.value }))}
                                            required
                                        >
                                            <option value="siwes">SIWES</option>
                                            <option value="final">Final Clearance</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save Officer
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
