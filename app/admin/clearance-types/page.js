'use client';

// Admin Clearance Types Management Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '../../components/AdminSidebar';
import '../../student/student.css';
import '../admin.css';

export default function ClearanceTypesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [clearanceTypes, setClearanceTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        display_name: '',
        description: '',
        is_faculty_based: false,
        target_level: '',
        requirements: [{ name: '', description: '', is_required: true }],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/admin/clearance-types');
            if (response.ok) {
                const data = await response.json();
                setClearanceTypes(data.data?.clearanceTypes || []);
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
            const url = editingType
                ? `/api/admin/clearance-types/${editingType.id}`
                : '/api/admin/clearance-types';

            const response = await fetch(url, {
                method: editingType ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save clearance type');
            }

            closeModal();
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            display_name: type.display_name,
            description: type.description || '',
            is_faculty_based: type.is_faculty_based,
            target_level: type.target_level || '',
            requirements: type.requirements?.length > 0
                ? type.requirements
                : [{ name: '', description: '', is_required: true }],
        });
        setShowModal(true);
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Are you sure you want to deactivate this clearance type?')) return;

        try {
            await fetch(`/api/admin/clearance-types/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Deactivate error:', err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingType(null);
        setFormData({
            name: '',
            display_name: '',
            description: '',
            is_faculty_based: false,
            target_level: '',
            requirements: [{ name: '', description: '', is_required: true }],
        });
        setError('');
    };

    const addRequirement = () => {
        setFormData({
            ...formData,
            requirements: [...formData.requirements, { name: '', description: '', is_required: true }],
        });
    };

    const removeRequirement = (index) => {
        setFormData({
            ...formData,
            requirements: formData.requirements.filter((_, i) => i !== index),
        });
    };

    const updateRequirement = (index, field, value) => {
        const updated = [...formData.requirements];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, requirements: updated });
    };



    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading clearance types...</p>
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
                        <span className="current">Clearance Types</span>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>Clearance Types</h1>
                            <p>Configure clearance types and their document requirements</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Type
                        </button>
                    </div>

                    {/* Clearance Types Grid */}
                    <div className="types-grid">
                        {clearanceTypes.map((type) => (
                            <div key={type.id} className={`type-card ${!type.is_active ? 'inactive' : ''}`}>
                                <div className="type-card-header">
                                    <div className="type-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                    <div className="type-info">
                                        <h3>{type.display_name}</h3>
                                        <span className="type-name">{type.name}</span>
                                    </div>
                                    <span className={`badge ${type.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                                        {type.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="type-card-body">
                                    <p className="type-description">{type.description || 'No description'}</p>
                                    {type.target_level && (
                                        <span className="badge badge-level">
                                            {type.target_level === 'final' ? 'Final Year' : `${type.target_level} Level`}
                                        </span>
                                    )}
                                    {type.is_faculty_based && (
                                        <span className="badge badge-info">Faculty-Based</span>
                                    )}
                                    <div className="requirements-count">
                                        <strong>{type.requirements?.length || 0}</strong> document requirements
                                    </div>
                                </div>
                                <div className="type-card-footer">
                                    <button className="btn btn-sm btn-outline" onClick={() => handleEdit(type)}>
                                        Edit
                                    </button>
                                    {type.is_active && (
                                        <button className="btn btn-sm btn-error" onClick={() => handleDeactivate(type.id)}>
                                            Deactivate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingType ? 'Edit Clearance Type' : 'Add Clearance Type'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-error">{error}</div>}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">System Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., siwes, final-year"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!!editingType}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Display Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., SIWES Clearance"
                                            value={formData.display_name}
                                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input"
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Target Student Level *</label>
                                    <select
                                        className="form-input"
                                        value={formData.target_level}
                                        onChange={(e) => setFormData({ ...formData, target_level: e.target.value })}
                                        required
                                    >
                                        <option value="">Select target level</option>
                                        <option value="100">100 Level</option>
                                        <option value="200">200 Level</option>
                                        <option value="300">300 Level</option>
                                        <option value="final">Final Year (auto-detects based on program)</option>
                                    </select>
                                    <small className="form-hint">Only students at this level will see this clearance</small>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_faculty_based}
                                            onChange={(e) => setFormData({ ...formData, is_faculty_based: e.target.checked })}
                                        />
                                        Faculty-Based (requires officer per faculty)
                                    </label>
                                </div>

                                <div className="requirements-section">
                                    <div className="requirements-header">
                                        <h4>Document Requirements</h4>
                                        <button type="button" className="btn btn-sm btn-outline" onClick={addRequirement}>
                                            + Add Requirement
                                        </button>
                                    </div>

                                    {formData.requirements.map((req, index) => (
                                        <div key={index} className="requirement-item">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Document name"
                                                        value={req.name}
                                                        onChange={(e) => updateRequirement(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Description (optional)"
                                                        value={req.description || ''}
                                                        onChange={(e) => updateRequirement(index, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => removeRequirement(index)}
                                                    disabled={formData.requirements.length === 1}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingType ? 'Save Changes' : 'Create Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .types-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }
                .type-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .type-card.inactive {
                    opacity: 0.6;
                }
                .type-card-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1.25rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .type-icon {
                    width: 48px;
                    height: 48px;
                    background: #e8f5e9;
                    color: #1E8449;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .type-info {
                    flex: 1;
                }
                .type-info h3 {
                    margin: 0;
                    font-size: 1rem;
                }
                .type-name {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .type-card-body {
                    padding: 1.25rem;
                }
                .type-description {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0 0 1rem;
                }
                .requirements-count {
                    font-size: 0.875rem;
                    color: #374151;
                    margin-top: 0.5rem;
                }
                .type-card-footer {
                    display: flex;
                    gap: 0.5rem;
                    padding: 1rem 1.25rem;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
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
                .modal-lg {
                    max-width: 700px;
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
                    align-items: end;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .requirements-section {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }
                .requirements-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .requirements-header h4 {
                    margin: 0;
                }
                .requirement-item {
                    margin-bottom: 0.75rem;
                }
                .requirement-item .form-row {
                    grid-template-columns: 1fr 1.5fr auto;
                }
                .badge-info {
                    background: #e0f2fe;
                    color: #0369a1;
                }
                .badge-level {
                    background: #fef3c7;
                    color: #d97706;
                    margin-right: 0.5rem;
                }
                .form-hint {
                    display: block;
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }
                .btn-error {
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                }
                .btn-error:hover {
                    background: #fecaca;
                }
            `}</style>
        </div>
    );
}
