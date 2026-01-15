'use client';

// Admin Audit Logs Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import MobileWarning from '../../components/MobileWarning';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../admin.css';

export default function AdminAuditLogs() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });

    useAuthSync('admin');

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const url = filter === 'all'
                ? '/api/admin/audit-logs'
                : `/api/admin/audit-logs?action=${filter}`;

            const response = await fetch(url);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setLogs(result.data.logs || []);
            setPagination(result.data.pagination || { total: 0, limit: 50, offset: 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        const colors = {
            'login': 'info',
            'logout': 'muted',
            'create': 'success',
            'update': 'warning',
            'delete': 'danger',
            'approve': 'success',
            'reject': 'danger',
        };
        const color = colors[action?.toLowerCase()] || 'default';
        return <span className={`audit-badge ${color}`}>{action}</span>;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && logs.length === 0) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading audit logs...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <MobileWarning role="admin" />
            <AdminSidebar userName="Admin Central" />

            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span className="current">Audit Logs</span>
                        </nav>
                        <h1>System Audit Logs</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Filters */}
                    <div className="audit-controls">
                        <div className="filter-tabs-row">
                            <button
                                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All Actions
                            </button>
                            <button
                                className={`filter-tab ${filter === 'login' ? 'active' : ''}`}
                                onClick={() => setFilter('login')}
                            >
                                Logins
                            </button>
                            <button
                                className={`filter-tab ${filter === 'approve' ? 'active' : ''}`}
                                onClick={() => setFilter('approve')}
                            >
                                Approvals
                            </button>
                            <button
                                className={`filter-tab ${filter === 'reject' ? 'active' : ''}`}
                                onClick={() => setFilter('reject')}
                            >
                                Rejections
                            </button>
                            <button
                                className={`filter-tab ${filter === 'create' ? 'active' : ''}`}
                                onClick={() => setFilter('create')}
                            >
                                Creates
                            </button>
                        </div>
                        <div className="audit-stats">
                            <span className="log-count">{pagination.total} total logs</span>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="table-container">
                        <table className="table audit-table">
                            <thead>
                                <tr>
                                    <th>TIMESTAMP</th>
                                    <th>USER</th>
                                    <th>ACTION</th>
                                    <th>ENTITY</th>
                                    <th>DETAILS</th>
                                    <th>IP ADDRESS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="timestamp-cell">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="user-name">{log.user_name || 'System'}</span>
                                                <span className="user-email">{log.user_email || '-'}</span>
                                            </div>
                                        </td>
                                        <td>{getActionBadge(log.action)}</td>
                                        <td>
                                            {log.entity_type ? (
                                                <span className="entity-info">
                                                    {log.entity_type} #{log.entity_id}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="details-cell">
                                            {log.details ? (
                                                <code className="details-json">
                                                    {typeof log.details === 'object'
                                                        ? JSON.stringify(log.details)
                                                        : log.details}
                                                </code>
                                            ) : '-'}
                                        </td>
                                        <td className="ip-cell">{log.ip_address || '-'}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>
                                            No audit logs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer">
                        <span>Showing {logs.length} of {pagination.total} logs</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
