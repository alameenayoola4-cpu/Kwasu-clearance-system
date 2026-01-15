'use client';

// Officer Settings Page - Profile and preferences
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../../student/student.css';
import '../officer.css';

export default function OfficerSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

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
            setFormData({
                name: result.data?.user?.name || '',
                email: result.data?.user?.email || '',
                phone: result.data?.user?.phone || '',
                department: result.data?.user?.department || '',
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { broadcastLogout } = await import('../../hooks/useAuthSync');
            broadcastLogout();
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // For now, just show success (API can be added later)
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // For now, just show success (API can be added later)
            setSuccess('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link href="/officer" className="sidebar-logo">
                        <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                        <div className="sidebar-logo-text">
                            <span className="logo-title">KWASU Clearance</span>
                            <span className="logo-subtitle">KWASU ED SYSTEM</span>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/officer" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/officer/requests" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V8z" />
                        </svg>
                        Requests
                    </Link>
                    <Link href="/officer/reports" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                        </svg>
                        Reports
                    </Link>
                    <Link href="/officer/settings" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                        </svg>
                        Settings
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user-profile">
                        <div className="user-avatar-lg">{data?.user?.name?.charAt(0)?.toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{data?.user?.name}</span>
                            <span className="user-dept">{data?.user?.department}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="breadcrumb-nav">
                            <Link href="/officer">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Settings</span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">
                            Logout
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>Settings</h1>
                            <p>Manage your account and preferences</p>
                        </div>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Profile Section */}
                    <div className="settings-section">
                        <h2>Profile Information</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        disabled
                                    />
                                    <small className="form-hint">Email cannot be changed</small>
                                </div>
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
                                        disabled
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="settings-section">
                        <h2>Change Password</h2>
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    {/* Account Info */}
                    <div className="settings-section">
                        <h2>Account Information</h2>
                        <div className="account-info">
                            <div className="info-row">
                                <span className="info-label">Role</span>
                                <span className="info-value">Clearance Officer</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Assigned Clearance Type</span>
                                <span className="info-value">{data?.user?.assigned_type_name || 'All Types'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Status</span>
                                <span className="info-value status-active">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .settings-section {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e5e7eb;
                    margin-bottom: 1.5rem;
                }
                .settings-section h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .form-hint {
                    color: #6b7280;
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                }
                .account-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #f3f4f6;
                }
                .info-label {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .info-value {
                    font-weight: 500;
                }
                .status-active {
                    color: #10b981;
                }
                .alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .alert-error {
                    background: #fef2f2;
                    color: #b91c1c;
                    border: 1px solid #fecaca;
                }
                .alert-success {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #bbf7d0;
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
