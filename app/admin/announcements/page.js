'use client';

// Admin Announcements Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import MobileWarning from '../../components/MobileWarning';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../admin.css';

export default function AdminAnnouncements() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'normal',
        target_audience: 'all',
        is_active: true,
    });
    const [submitting, setSubmitting] = useState(false);

    useAuthSync('admin');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/admin/announcements');
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setAnnouncements(result.data.announcements || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const method = editingAnnouncement ? 'PUT' : 'POST';
            const body = editingAnnouncement
                ? { id: editingAnnouncement.id, ...formData }
                : formData;

            const response = await fetch('/api/admin/announcements', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            setShowModal(false);
            resetForm();
            fetchAnnouncements();

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const response = await fetch(`/api/admin/announcements?id=${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            fetchAnnouncements();

        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            target_audience: announcement.target_audience,
            is_active: announcement.is_active,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingAnnouncement(null);
        setFormData({
            title: '',
            content: '',
            priority: 'normal',
            target_audience: 'all',
            is_active: true,
        });
    };

    const getPriorityBadge = (priority) => {
        return <span className={`priority-badge ${priority}`}>{priority}</span>;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading announcements...</p>
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
                            <span className="current">Announcements</span>
                        </nav>
                        <h1>System Announcements</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="announcements-header">
                        <p className="text-muted">Create and manage system-wide announcements</p>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                            + New Announcement
                        </button>
                    </div>

                    <div className="announcement-cards">
                        {announcements.map(ann => (
                            <div key={ann.id} className={`announcement-card ${!ann.is_active ? 'inactive' : ''}`}>
                                <div className="announcement-header">
                                    <h3 className="announcement-title">{ann.title}</h3>
                                    {getPriorityBadge(ann.priority)}
                                </div>
                                <p className="announcement-content">{ann.content}</p>
                                <div className="announcement-meta">
                                    <div className="meta-info">
                                        <span className="meta-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                            </svg>
                                            {ann.target_audience}
                                        </span>
                                        <span className="meta-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                                            </svg>
                                            {formatDate(ann.created_at)}
                                        </span>
                                    </div>
                                    <div className="announcement-actions">
                                        <button
                                            className="action-btn"
                                            title="Edit"
                                            onClick={() => handleEdit(ann)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            title="Delete"
                                            onClick={() => handleDelete(ann.id)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <div className="text-center text-muted" style={{ padding: '60px', gridColumn: '1 / -1' }}>
                                <p>No announcements yet</p>
                                <p>Create your first announcement to broadcast messages to users</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
                                <p>Broadcast a message to users</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Announcement title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="Write your announcement message..."
                                        rows="4"
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <select
                                            className="form-select"
                                            value={formData.priority}
                                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Target Audience</label>
                                        <select
                                            className="form-select"
                                            value={formData.target_audience}
                                            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                                        >
                                            <option value="all">All Users</option>
                                            <option value="students">Students Only</option>
                                            <option value="officers">Officers Only</option>
                                            <option value="admins">Admins Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        />
                                        <span>Active (visible to users)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
