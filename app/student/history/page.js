'use client';

// Clearance History Page with Filters
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentSidebar from '../../components/StudentSidebar';
import CustomDropdown from '../../components/CustomDropdown';
import '../student.css';

export default function ClearanceHistory() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [clearances, setClearances] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [error, setError] = useState('');

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

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

    // Filter and sort clearances
    const filteredClearances = clearances
        .filter(c => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (typeFilter !== 'all' && c.type !== typeFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return c.request_id?.toLowerCase().includes(q) ||
                    c.type?.toLowerCase().includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            return 0;
        });

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
        const config = {
            siwes: { label: 'SIWES', class: 'type-badge type-siwes' },
            'final-year': { label: 'Final Year', class: 'type-badge type-final' },
            faculty: { label: 'Faculty', class: 'type-badge type-faculty' },
        };
        const c = config[type] || { label: type, class: 'type-badge' };
        return <span className={c.class}>{c.label}</span>;
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setTypeFilter('all');
        setSearchQuery('');
        setSortBy('newest');
    };

    const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || searchQuery;

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
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>Clearance History</h1>
                            <p>View all your clearance applications and their status</p>
                        </div>
                        <Link href="/student/apply" className="btn btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Application
                        </Link>
                    </div>

                    {/* Filters Row */}
                    <div className="filters-section">
                        <div className="filter-tabs-row">
                            <button
                                className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                All ({clearances.length})
                            </button>
                            <button
                                className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('pending')}
                            >
                                Pending ({clearances.filter(c => c.status === 'pending').length})
                            </button>
                            <button
                                className={`filter-tab ${statusFilter === 'approved' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('approved')}
                            >
                                Approved ({clearances.filter(c => c.status === 'approved').length})
                            </button>
                            <button
                                className={`filter-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('rejected')}
                            >
                                Rejected ({clearances.filter(c => c.status === 'rejected').length})
                            </button>
                        </div>
                        <div className="filter-controls">
                            <CustomDropdown
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'siwes', label: 'SIWES' },
                                    { value: 'final-year', label: 'Final Year' },
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
                            {hasActiveFilters && (
                                <button className="btn btn-sm btn-outline" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                        </div>
                    ) : filteredClearances.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            {hasActiveFilters ? (
                                <>
                                    <h3>No results found</h3>
                                    <p>Try adjusting your filters</p>
                                    <button className="btn btn-primary" onClick={clearFilters}>
                                        Clear Filters
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h3>No clearance applications yet</h3>
                                    <p>Apply for your first clearance to see it here</p>
                                    <Link href="/student/apply" className="btn btn-primary">
                                        Apply for Clearance
                                    </Link>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
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
                                        {filteredClearances.map((c) => (
                                            <tr key={c.id}>
                                                <td className="clearance-id">{c.request_id}</td>
                                                <td>{getTypeBadge(c.type)}</td>
                                                <td>{new Date(c.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}</td>
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
                            <div className="table-footer">
                                <span className="showing-text">
                                    Showing {filteredClearances.length} of {clearances.length} applications
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <style jsx>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .section-header h1 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .section-header p {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .filters-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }
                .filter-tabs-row {
                    display: flex;
                    gap: 0.5rem;
                }
                .filter-tab {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-tab:hover {
                    border-color: #1a4d2e;
                    color: #1a4d2e;
                }
                .filter-tab.active {
                    background: #1a4d2e;
                    border-color: #1a4d2e;
                    color: white;
                }
                .filter-controls {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
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
                .table-footer {
                    padding: 1rem;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                }
                .showing-text {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .type-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .type-siwes {
                    background: #dbeafe;
                    color: #1e40af;
                }
                .type-final {
                    background: #fef3c7;
                    color: #92400e;
                }
                .type-faculty {
                    background: #d1fae5;
                    color: #065f46;
                }
                @media (max-width: 768px) {
                    .filters-section {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .filter-tabs-row {
                        overflow-x: auto;
                    }
                    .filter-controls {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
}
