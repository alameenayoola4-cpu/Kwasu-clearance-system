'use client';

// Officer Requests Page - View all clearance requests with Batch Processing
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomDropdown from '../../components/CustomDropdown';
import OfficerSidebar from '../../components/OfficerSidebar';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../officer.css';

export default function OfficerRequestsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');

    // Batch selection state
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);

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

    // Only pending requests can be bulk actioned
    const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
    const selectableIds = pendingRequests.map(r => r.id);

    const toggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === selectableIds.length && selectableIds.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(selectableIds));
        }
    };

    const openBulkModal = (action) => {
        if (selectedIds.size === 0) return;
        setBulkAction(action);
        setShowBulkModal(true);
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.size === 0) return;

        setBulkProcessing(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/officer/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: bulkAction,
                    requestIds: Array.from(selectedIds),
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            setSuccess(`Successfully ${bulkAction}d ${selectedIds.size} request(s)`);
            setSelectedIds(new Set());
            setShowBulkModal(false);
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.message);
        } finally {
            setBulkProcessing(false);
        }
    };

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
            <OfficerSidebar userName={data?.user?.name} userDepartment={data?.user?.department} />

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
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                            {error}
                            <button onClick={() => setError('')} className="alert-close">&times;</button>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                            {success}
                        </div>
                    )}

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

                    {/* Batch Action Bar */}
                    {selectedIds.size > 0 && (
                        <div className="batch-action-bar">
                            <span className="selected-count">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                {selectedIds.size} selected
                            </span>
                            <div className="batch-actions">
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => openBulkModal('approve')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Approve Selected ({selectedIds.size})
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => openBulkModal('reject')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Reject Selected ({selectedIds.size})
                                </button>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setSelectedIds(new Set())}
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Requests Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectableIds.length > 0 && selectedIds.size === selectableIds.length}
                                            onChange={toggleSelectAll}
                                            disabled={selectableIds.length === 0}
                                            title="Select all pending requests"
                                        />
                                    </th>
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
                                    <tr key={req.id} className={selectedIds.has(req.id) ? 'selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(req.id)}
                                                onChange={() => toggleSelect(req.id)}
                                                disabled={req.status !== 'pending'}
                                            />
                                        </td>
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
                                        <td colSpan="8" className="empty-state">
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

            {/* Bulk Action Confirmation Modal */}
            {showBulkModal && (
                <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Bulk {bulkAction === 'approve' ? 'Approval' : 'Rejection'}</h3>
                            <button className="modal-close" onClick={() => setShowBulkModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to <strong>{bulkAction}</strong> {selectedIds.size} clearance request(s)?
                            </p>
                            <p className="modal-warning">
                                {bulkAction === 'approve'
                                    ? 'This will grant clearance to all selected students.'
                                    : 'This will reject all selected requests. Students will need to reapply.'}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowBulkModal(false)}
                                disabled={bulkProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${bulkAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={handleBulkAction}
                                disabled={bulkProcessing}
                            >
                                {bulkProcessing ? 'Processing...' : `${bulkAction === 'approve' ? 'Approve' : 'Reject'} ${selectedIds.size} Request(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .batch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, #1a4d2e 0%, #15803d 100%);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    color: white;
                }
                .selected-count {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }
                .batch-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-success {
                    background: #10b981;
                    color: white;
                    border: none;
                }
                .btn-success:hover {
                    background: #059669;
                }
                .btn-danger {
                    background: #ef4444;
                    color: white;
                    border: none;
                }
                .btn-danger:hover {
                    background: #dc2626;
                }
                .selected-row {
                    background: #f0fdf4 !important;
                }
                input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                input[type="checkbox"]:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .modal-header h3 {
                    font-size: 1.125rem;
                    margin: 0;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b7280;
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .modal-body p {
                    margin: 0 0 1rem 0;
                }
                .modal-warning {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                    border-radius: 0 0 12px 12px;
                }
                .alert {
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                .alert-success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #16a34a;
                }
                .alert-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
}
