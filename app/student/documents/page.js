'use client';

// Document Uploads Page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentSidebar from '../../components/StudentSidebar';
import '../student.css';

export default function DocumentUploads() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated document data - in real app, fetch from API
        setTimeout(() => {
            setDocuments([]);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName="Student" />

            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Document Uploads</span>
                        </nav>
                        <h1>Document Uploads</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    <p className="apply-intro">Upload and manage your clearance documents</p>

                    {/* Upload Area */}
                    <div className="upload-area">
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <h3>Drag and drop files here</h3>
                        <p>or click to browse from your computer</p>
                        <p className="upload-hint">Supported: PDF, JPG, PNG (Max 10MB)</p>
                    </div>

                    {/* Documents List */}
                    <div className="documents-section">
                        <h2>Uploaded Documents</h2>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="empty-state">
                                <p>No documents uploaded yet</p>
                            </div>
                        ) : (
                            <div className="documents-grid">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="document-card">
                                        <div className="document-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <div className="document-info">
                                            <h4>{doc.name}</h4>
                                            <p>{doc.size} • {doc.date}</p>
                                        </div>
                                        <div className="document-actions">
                                            <button className="btn-icon" title="Download">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                            </button>
                                            <button className="btn-icon danger" title="Delete">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .upload-area {
                    background: white;
                    border: 2px dashed #e5e7eb;
                    border-radius: 12px;
                    padding: 48px;
                    text-align: center;
                    margin-bottom: 32px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .upload-area:hover {
                    border-color: #16a34a;
                    background: #f0fdf4;
                }
                .upload-icon {
                    width: 80px;
                    height: 80px;
                    background: #f3f4f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    margin: 0 auto 16px;
                }
                .upload-area h3 {
                    margin-bottom: 4px;
                }
                .upload-area p {
                    color: #6b7280;
                }
                .upload-hint {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin-top: 8px;
                }
                .documents-section {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                .documents-section h2 {
                    font-size: 1.1rem;
                    margin-bottom: 16px;
                }
                .documents-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .document-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .document-card:hover {
                    background: #f0fdf4;
                }
                .document-icon {
                    width: 40px;
                    height: 40px;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #16a34a;
                    border: 1px solid #e5e7eb;
                }
                .document-info {
                    flex: 1;
                }
                .document-info h4 {
                    font-size: 0.95rem;
                    margin-bottom: 2px;
                }
                .document-info p {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .document-actions {
                    display: flex;
                    gap: 8px;
                }
                .btn-icon {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    transition: all 0.2s ease;
                }
                .btn-icon:hover {
                    background: #e5e7eb;
                    color: #374151;
                }
                .btn-icon.danger:hover {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .loading-state,
                .empty-state {
                    padding: 40px;
                    text-align: center;
                    color: #6b7280;
                }
            `}</style>
        </div>
    );
}
