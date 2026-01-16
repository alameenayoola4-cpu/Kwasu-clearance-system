'use client';

// Admin Officers Management Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '../../components/AdminSidebar';
import { KWASU_FACULTIES } from '../../../lib/kwasuData';
import '../../student/student.css';
import '../admin.css';

export default function OfficersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [officers, setOfficers] = useState([]);
    const [clearanceTypes, setClearanceTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOfficer, setEditingOfficer] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        staff_id: '',
        password: '',
        phone: '',
        department: '',
        faculty: '',
        assigned_clearance_type: '',
        assigned_faculty: '',
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        faculty: '',
        assigned_clearance_type: '',
        assigned_faculty: '',
        status: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [officersRes, typesRes] = await Promise.all([
                fetch('/api/admin/officers'),
                fetch('/api/admin/clearance-types'),
            ]);

            if (officersRes.ok) {
                const officersData = await officersRes.json();
                setOfficers(officersData.data?.officers || []);
            }

            if (typesRes.ok) {
                const typesData = await typesRes.json();
                setClearanceTypes(typesData.data?.clearanceTypes || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/admin/officers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create officer');
            }

            setShowModal(false);
            setFormData({
                name: '',
                staff_id: '',
                password: '',
                phone: '',
                department: '',
                faculty: '',
                assigned_clearance_type: '',
                assigned_faculty: '',
            });
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (officer) => {
        setEditingOfficer(officer);
        setEditFormData({
            name: officer.name || '',
            email: officer.email || '',
            phone: officer.phone || '',
            department: officer.department || '',
            faculty: officer.faculty || '',
            assigned_clearance_type: officer.assigned_clearance_type || '',
            assigned_faculty: officer.assigned_faculty || '',
            status: officer.status || 'active',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`/api/admin/officers/${editingOfficer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update officer');
            }

            setShowEditModal(false);
            setEditingOfficer(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to deactivate this officer?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/officers/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to deactivate officer');
            }

            fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to deactivate officer: ' + err.message);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch(`/api/admin/officers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update status');
            }

            fetchData();
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update status: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading officers...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <AdminSidebar userName="Admin" />

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="topbar">
                    <div className="breadcrumb-nav">
                        <Link href="/admin">Dashboard</Link>
                        <span>&gt;</span>
                        <span className="current">Officers</span>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>Manage Officers</h1>
                            <p>Create and manage clearance officers</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Officer
                        </button>
                    </div>

                    {/* Officers Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Officer Name</th>
                                    <th>Department / Office</th>
                                    <th>Clearance Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {officers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                            No officers found. Click "Add Officer" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    officers.map((officer) => (
                                        <tr key={officer.id}>
                                            <td>
                                                <div className="officer-cell">
                                                    <div className="officer-avatar">
                                                        {officer.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div className="officer-info">
                                                        <span className="officer-name">{officer.name}</span>
                                                        <span className="officer-email">{officer.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{officer.department || '-'}</td>
                                            <td>
                                                <span className="badge badge-primary">
                                                    {officer.assigned_type_name || 'Not Assigned'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-dot ${officer.status}`}>
                                                    {officer.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn"
                                                        title="Edit"
                                                        onClick={() => handleEdit(officer)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className={`action-btn ${officer.status === 'active' ? 'danger' : ''}`}
                                                        onClick={() => handleStatusToggle(officer.id, officer.status)}
                                                        title={officer.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {officer.status === 'active' ? (
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                            </svg>
                                                        ) : (
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                                <polyline points="22 4 12 14.01 9 11.01" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="table-footer">
                            <span className="showing-text">
                                Showing {officers.length} of {officers.length} officers
                            </span>
                            <div className="pagination">
                                <button className="page-btn" disabled>&lt;</button>
                                <button className="page-btn active">1</button>
                                <button className="page-btn" disabled>&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Officer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Officer</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-error">{error}</div>}

                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Staff ID *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., KWASU/STAFF/001"
                                            value={formData.staff_id}
                                            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password *</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Assigned Clearance Type</label>
                                    <select
                                        className="form-input"
                                        value={formData.assigned_clearance_type}
                                        onChange={(e) => setFormData({ ...formData, assigned_clearance_type: e.target.value })}
                                    >
                                        <option value="">Select Type</option>
                                        {clearanceTypes.map((type) => (
                                            <option key={type.id} value={type.id}>{type.display_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Assigned Faculty (for Faculty Clearance)</label>
                                    <select
                                        className="form-input"
                                        value={formData.assigned_faculty}
                                        onChange={(e) => setFormData({ ...formData, assigned_faculty: e.target.value })}
                                    >
                                        <option value="">All Faculties</option>
                                        {KWASU_FACULTIES.map((faculty) => (
                                            <option key={faculty.id} value={faculty.shortName}>{faculty.shortName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Officer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Officer Modal */}
            {showEditModal && editingOfficer && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Officer</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-error">{error}</div>}

                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={editFormData.phone}
                                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editFormData.department}
                                            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Assigned Clearance Type</label>
                                    <select
                                        className="form-input"
                                        value={editFormData.assigned_clearance_type}
                                        onChange={(e) => setEditFormData({ ...editFormData, assigned_clearance_type: e.target.value })}
                                    >
                                        <option value="">Select Type</option>
                                        {clearanceTypes.map((type) => (
                                            <option key={type.id} value={type.id}>{type.display_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Assigned Faculty</label>
                                    <select
                                        className="form-input"
                                        value={editFormData.assigned_faculty}
                                        onChange={(e) => setEditFormData({ ...editFormData, assigned_faculty: e.target.value })}
                                    >
                                        <option value="">All Faculties</option>
                                        {KWASU_FACULTIES.map((faculty) => (
                                            <option key={faculty.id} value={faculty.shortName}>{faculty.shortName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-input"
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Officer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
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
                    z-index: 100;
                }
                .modal {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
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
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
            `}</style>
        </div>
    );
}
