'use client';

// Officer Review Page - Review and approve/reject clearance requests
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import '../../officer.css';
import '../review.css';

export default function ReviewPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [remarks, setRemarks] = useState('');
    const [officerNotes, setOfficerNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            const response = await fetch(`/api/officer/requests/${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load request');
            }

            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            const response = await fetch(`/api/officer/requests/${id}?action=approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: officerNotes }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to approve request');
            }

            // Success - redirect back
            router.push('/officer?success=approved');

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!remarks.trim() || remarks.length < 10) {
            setError('Rejection reason must be at least 10 characters');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/officer/requests/${id}?action=reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: remarks }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to reject request');
            }

            // Success - redirect back
            router.push('/officer?success=rejected');

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
            setShowRejectModal(false);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            pending: 'badge badge-pending',
            approved: 'badge badge-approved',
            rejected: 'badge badge-rejected',
        };
        const labels = {
            pending: 'PENDING OFFICER APPROVAL',
            approved: 'APPROVED',
            rejected: 'REJECTED',
        };
        return <span className={classes[status]}>{labels[status]}</span>;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading request details...</p>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={() => router.push('/officer')} className="btn btn-primary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="review-page">
            {/* Header */}
            <header className="review-header">
                <Link href="/officer" className="header-logo">
                    <Image src="/logo.png" alt="KWASU" width={32} height={32} />
                    <span>UniClear</span>
                </Link>
                <nav className="header-nav">
                    <Link href="/officer">Dashboard</Link>
                    <span className="active">Applications</span>
                    <Link href="/officer/reports">Reports</Link>
                    <Link href="/officer/settings">Settings</Link>
                </nav>
                <div className="header-search">
                    <input type="text" placeholder="Search Application ID..." />
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link href="/officer">Dashboard</Link>
                <span>/</span>
                <span>Pending Clearances</span>
                <span>/</span>
                <span className="current">Review {data?.request?.request_id}</span>
            </div>

            {/* Main Content */}
            <main className="review-main">
                <div className="review-content">
                    {/* Title Section */}
                    <div className="review-title-section">
                        <div>
                            <h1>Review Clearance Application</h1>
                            <p>
                                Application ID: {data?.request?.request_id}
                                <span className="status-inline">
                                    {getStatusBadge(data?.request?.status)}
                                </span>
                            </p>
                        </div>
                        <div className="review-actions-top">
                            <Link href="/officer" className="btn btn-ghost">
                                ← Back to List
                            </Link>
                            <button className="btn btn-ghost">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 6 2 18 2 18 9" />
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                    <rect x="6" y="14" width="12" height="8" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Student Info Card */}
                    <div className="student-info-card">
                        <div className="student-photo">
                            <div className="photo-placeholder">
                                {data?.student?.name?.charAt(0)}
                            </div>
                        </div>
                        <div className="student-details">
                            <h2>{data?.student?.name}</h2>
                            <p className="matric">{data?.student?.matric_no}</p>
                            <div className="detail-row">
                                <span>FACULTY / DEPT</span>
                                <p>{data?.student?.faculty} / {data?.student?.department}</p>
                            </div>
                            <div className="detail-row">
                                <span>ACADEMIC SESSION</span>
                                <p>2025/2026 Session</p>
                            </div>
                            <div className="detail-row">
                                <span>LEVEL / STANDING</span>
                                <p>500 Level (Finalist)</p>
                            </div>
                            <div className="detail-row">
                                <span>CLEARANCE CATEGORY</span>
                                <p>{data?.request?.type === 'final' ? 'Final Graduation Clearance' : 'SIWES Clearance'}</p>
                            </div>
                        </div>
                        <div className="current-status">
                            <span>CURRENT STATUS</span>
                            {getStatusBadge(data?.request?.status)}
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="documents-section">
                        <div className="section-header">
                            <h3>REQUIRED DOCUMENTS</h3>
                            <span>{data?.documents?.length || 0} Documents Uploaded</span>
                        </div>

                        {data?.documents?.length > 0 ? (
                            <div className="documents-list">
                                {data.documents.map((doc, index) => (
                                    <div key={doc.id} className="document-item">
                                        <div className="doc-icon">
                                            {doc.file_type.includes('pdf') ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="doc-info">
                                            <span className="doc-name">{doc.name}</span>
                                            <span className="doc-meta">
                                                Uploaded: {doc.uploaded_at} • {(doc.file_size / 1024).toFixed(1)}KB • {doc.file_type.split('/')[1]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="doc-actions">
                                            <button className="btn btn-ghost btn-sm" title="View">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                            <button className="btn btn-ghost btn-sm" title="Download">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-documents">
                                <p>No documents uploaded yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="timeline-section">
                        <h3>APPLICATION TIMELINE</h3>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-dot submitted"></div>
                                <div className="timeline-content">
                                    <span className="timeline-status">APPLICATION SUBMITTED</span>
                                    <p>Student submitted the initial clearance request.</p>
                                    <span className="timeline-date">{data?.request?.created_at}</span>
                                </div>
                            </div>
                            {data?.request?.status !== 'pending' && (
                                <div className="timeline-item">
                                    <div className={`timeline-dot ${data.request.status}`}></div>
                                    <div className="timeline-content">
                                        <span className="timeline-status">
                                            {data.request.status === 'approved' ? 'APPLICATION APPROVED' : 'APPLICATION REJECTED'}
                                        </span>
                                        <p>
                                            {data.request.status === 'approved'
                                                ? 'Clearance approved by officer.'
                                                : data.request.rejection_reason
                                            }
                                        </p>
                                        <span className="timeline-date">{data?.request?.reviewed_at}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decision Panel */}
                <aside className="decision-panel">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        </svg>
                        Decision Panel
                    </h3>

                    <div className="remarks-section">
                        <label>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            INTERNAL NOTES (Optional)
                        </label>
                        <textarea
                            placeholder="Add internal notes for record keeping..."
                            value={officerNotes}
                            onChange={(e) => setOfficerNotes(e.target.value)}
                            disabled={data?.request?.status !== 'pending'}
                            rows={2}
                        ></textarea>
                        <small className="notes-hint">These notes are saved with the decision for audit purposes.</small>
                    </div>

                    <div className="remarks-section">
                        <label>REJECTION REASON</label>
                        <textarea
                            placeholder="Required if rejecting. Explain why the request cannot be approved..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            disabled={data?.request?.status !== 'pending'}
                        ></textarea>
                    </div>

                    {data?.request?.status === 'pending' && (
                        <>
                            <button
                                className="btn btn-primary btn-lg btn-block"
                                onClick={handleApprove}
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        APPROVE APPLICATION
                                    </>
                                )}
                            </button>

                            <button
                                className="btn btn-danger btn-lg btn-block btn-outline"
                                onClick={() => setShowRejectModal(true)}
                                disabled={submitting}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                REJECT & NOTIFY
                            </button>
                        </>
                    )}

                    {data?.request?.status === 'approved' && (
                        <div className="decision-made approved">
                            <span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                This application has been approved
                            </span>
                        </div>
                    )}

                    {data?.request?.status === 'rejected' && (
                        <div className="decision-made rejected">
                            <span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                This application has been rejected
                            </span>
                            <p>{data.request.rejection_reason}</p>
                        </div>
                    )}

                    <div className="decision-note">
                        <p>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Decision will be final once submitted. The student will receive an automatic email notification.
                        </p>
                    </div>

                    <div className="review-checklist">
                        <h4>REVIEW CHECKLIST</h4>
                        <label className="checklist-item">
                            <input type="checkbox" />
                            <span>Matric number valid</span>
                        </label>
                        <label className="checklist-item">
                            <input type="checkbox" />
                            <span>Payment records confirmed</span>
                        </label>
                        <label className="checklist-item">
                            <input type="checkbox" />
                            <span>Document legibility verified</span>
                        </label>
                    </div>
                </aside>
            </main>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Rejection</h3>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Please provide a detailed reason for rejection:</p>
                            <textarea
                                className="form-textarea"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="The uploaded documents are unclear..."
                                rows={4}
                            ></textarea>
                            {error && <p className="text-error text-sm">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={submitting}
                            >
                                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
