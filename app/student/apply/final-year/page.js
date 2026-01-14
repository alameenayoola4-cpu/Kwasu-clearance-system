'use client';

// Final Year Clearance Application Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import '../../student.css';

export default function ApplyFinalYear() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        graduationYear: new Date().getFullYear(),
        libraryCleared: false,
        hostelCleared: false,
        feesCleared: false,
        projectSubmitted: false,
        comments: '',
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/student/dashboard');
            const result = await response.json();
            if (result.data?.user) {
                setUser(result.data.user);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/student/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clearance_type: 'final_year',
                    ...formData,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit application');
            }

            setSuccess(true);
            setTimeout(() => router.push('/student'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="dashboard-layout">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <Link href="/student" className="sidebar-logo">
                            <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                            <div className="sidebar-logo-text">
                                <span className="logo-title">Digital Clearance</span>
                                <span className="logo-subtitle">KWASU SYSTEM</span>
                            </div>
                        </Link>
                    </div>
                </aside>

                <main className="dashboard-main">
                    <div className="dashboard-content">
                        <div className="success-page">
                            <div className="success-icon-large">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h1>Application Submitted!</h1>
                            <p>Your Final Year clearance application has been submitted successfully.</p>
                            <p>Redirecting to dashboard...</p>
                        </div>
                    </div>
                </main>

                <style jsx>{`
                    .success-page {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 60vh;
                        text-align: center;
                    }
                    .success-icon-large {
                        width: 100px;
                        height: 100px;
                        background: #dcfce7;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #16a34a;
                        margin-bottom: 24px;
                    }
                    .success-page h1 {
                        color: #16a34a;
                        margin-bottom: 12px;
                    }
                    .success-page p {
                        color: #6b7280;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link href="/student" className="sidebar-logo">
                        <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                        <div className="sidebar-logo-text">
                            <span className="logo-title">Digital Clearance</span>
                            <span className="logo-subtitle">KWASU SYSTEM</span>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/student" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                            <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                        </svg>
                        Dashboard
                    </Link>

                    <div className="nav-section-label">Clearance Types</div>

                    <Link href="/student/apply/siwes" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                        </svg>
                        SIWES Clearance
                    </Link>
                    <Link href="/student/apply/final-year" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                        </svg>
                        Final Year Clearance
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Apply for Final Year Clearance</span>
                        </nav>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="apply-form-container">
                        <div className="apply-form-header">
                            <div className="form-icon final">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                </svg>
                            </div>
                            <div>
                                <h1>Final Year Clearance Application</h1>
                                <p>Complete your graduation clearance requirements</p>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <strong>Error</strong>
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="apply-form">
                            <div className="form-section">
                                <h3>Student Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={user?.name || ''} disabled className="input-disabled" />
                                    </div>
                                    <div className="form-group">
                                        <label>Matric Number</label>
                                        <input type="text" value={user?.matric_no || ''} disabled className="input-disabled" />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input type="text" value={user?.department || ''} disabled className="input-disabled" />
                                    </div>
                                    <div className="form-group">
                                        <label>Faculty</label>
                                        <input type="text" value={user?.faculty || ''} disabled className="input-disabled" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Graduation Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Expected Graduation Year *</label>
                                        <select
                                            name="graduationYear"
                                            value={formData.graduationYear}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value={2024}>2024</option>
                                            <option value={2025}>2025</option>
                                            <option value={2026}>2026</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Clearance Checklist</h3>
                                <p className="section-note">Please confirm the following items have been completed:</p>
                                <div className="checklist">
                                    <label className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name="libraryCleared"
                                            checked={formData.libraryCleared}
                                            onChange={handleChange}
                                        />
                                        <span className="checkbox-label">Library clearance obtained</span>
                                    </label>
                                    <label className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name="hostelCleared"
                                            checked={formData.hostelCleared}
                                            onChange={handleChange}
                                        />
                                        <span className="checkbox-label">Hostel clearance obtained (if applicable)</span>
                                    </label>
                                    <label className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name="feesCleared"
                                            checked={formData.feesCleared}
                                            onChange={handleChange}
                                        />
                                        <span className="checkbox-label">All fees paid and cleared</span>
                                    </label>
                                    <label className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            name="projectSubmitted"
                                            checked={formData.projectSubmitted}
                                            onChange={handleChange}
                                        />
                                        <span className="checkbox-label">Final year project submitted</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-group full-width">
                                    <label>Additional Comments</label>
                                    <textarea
                                        name="comments"
                                        value={formData.comments}
                                        onChange={handleChange}
                                        placeholder="Any additional information..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link href="/student" className="btn btn-outline">
                                    Cancel
                                </Link>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .apply-form-container {
                    max-width: 800px;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                .apply-form-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 24px;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border-bottom: 1px solid #e5e7eb;
                }
                .form-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .form-icon.final {
                    background: #e8f5e9;
                    color: #16a34a;
                }
                .apply-form-header h1 {
                    font-size: 1.5rem;
                    margin: 0 0 4px;
                }
                .apply-form-header p {
                    color: #6b7280;
                    margin: 0;
                }
                .apply-form {
                    padding: 24px;
                }
                .form-section {
                    margin-bottom: 32px;
                }
                .form-section h3 {
                    font-size: 1rem;
                    color: #374151;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .section-note {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 16px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .form-group.full-width {
                    grid-column: 1 / -1;
                }
                .form-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                }
                .form-group input,
                .form-group textarea,
                .form-group select {
                    padding: 10px 14px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                }
                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #16a34a;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
                }
                .input-disabled {
                    background: #f9fafb;
                    color: #6b7280;
                }
                .checklist {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .checkbox-item:hover {
                    background: #f0fdf4;
                }
                .checkbox-item input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    accent-color: #16a34a;
                }
                .checkbox-label {
                    font-size: 0.95rem;
                    color: #374151;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                }
                .breadcrumb-nav a {
                    color: #6b7280;
                }
                .breadcrumb-nav .current {
                    color: #374151;
                    font-weight: 500;
                }
                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
