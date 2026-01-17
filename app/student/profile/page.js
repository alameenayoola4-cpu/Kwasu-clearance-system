'use client';

// Student Profile Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentSidebar from '../../components/StudentSidebar';
import { useAuthSync } from '../../hooks/useAuthSync';
import '../student.css';

export default function StudentProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useAuthSync('student');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/student/dashboard');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load profile');
            }

            setUser(result.data?.user);
            setFormData({
                phone: result.data?.user?.phone || '',
                address: result.data?.user?.address || '',
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/student/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
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
            const response = await fetch('/api/student/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'change_password',
                    ...passwordData,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to change password');
            }

            setSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Calculate profile completion percentage
    const getProfileCompletion = () => {
        let filled = 0;
        const fields = ['name', 'email', 'matric_no', 'department', 'phone', 'address'];
        fields.forEach(field => {
            if (user?.[field]) filled++;
        });
        return Math.round((filled / fields.length) * 100);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    const completion = getProfileCompletion();

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName={user?.name || 'Student'} />

            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Profile</span>
                        </nav>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <div>
                            <h1>My Profile</h1>
                            <p>Manage your account information</p>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                            <button onClick={() => setError('')} className="alert-close">&times;</button>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    <div className="profile-grid">
                        {/* Profile Overview Card */}
                        <div className="profile-card overview-card">
                            <div className="profile-avatar-large">
                                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <h2>{user?.name || 'Student'}</h2>
                            <p className="profile-matric">{user?.matric_no}</p>
                            <p className="profile-dept">{user?.department}</p>

                            <div className="profile-completion">
                                <div className="completion-header">
                                    <span>Profile Completion</span>
                                    <span className="completion-percent">{completion}%</span>
                                </div>
                                <div className="completion-bar">
                                    <div className="completion-fill" style={{ width: `${completion}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details Form */}
                        <div className="profile-card details-card">
                            <h3>Personal Information</h3>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={user?.name || ''}
                                            disabled
                                        />
                                        <span className="form-hint">Contact admin to change</span>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={user?.email || ''}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Matric Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={user?.matric_no || ''}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={user?.department || ''}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Level</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={user?.level ? `${user.level} Level` : ''}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="Enter phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Address</label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            placeholder="Enter your address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Password Section */}
                        <div className="profile-card password-card">
                            <div className="password-header">
                                <div>
                                    <h3>Password & Security</h3>
                                    <p>Keep your account secure</p>
                                </div>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                                </button>
                            </div>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="password-form">
                                    <div className="form-group">
                                        <label className="form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                            minLength={8}
                                        />
                                        <span className="form-hint">Minimum 8 characters</span>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Changing...' : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 1.5rem;
                }
                .profile-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e5e7eb;
                }
                .overview-card {
                    text-align: center;
                    grid-row: span 2;
                }
                .profile-avatar-large {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, var(--color-primary) 0%, #15803d 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 600;
                    margin: 0 auto 1rem;
                }
                .overview-card h2 {
                    font-size: 1.25rem;
                    margin-bottom: 0.25rem;
                }
                .profile-matric {
                    color: var(--color-primary);
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .profile-dept {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                }
                .profile-completion {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }
                .completion-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                .completion-percent {
                    font-weight: 600;
                    color: var(--color-primary);
                }
                .completion-bar {
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .completion-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--color-primary), #15803d);
                    border-radius: 4px;
                    transition: width 0.3s;
                }
                .details-card h3,
                .password-card h3 {
                    font-size: 1rem;
                    margin-bottom: 1.5rem;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .form-group.full-width {
                    grid-column: span 2;
                }
                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    color: #374151;
                }
                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    transition: border-color 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
                .form-input:disabled {
                    background: #f9fafb;
                    color: #6b7280;
                }
                .form-hint {
                    display: block;
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin-top: 0.25rem;
                }
                .password-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .password-header p {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0.25rem 0 0 0;
                }
                .password-form {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }
                .password-form .form-group {
                    margin-bottom: 1rem;
                }
                .alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
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
                @media (max-width: 768px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                    .overview-card {
                        grid-row: auto;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-group.full-width {
                        grid-column: auto;
                    }
                }
            `}</style>
        </div>
    );
}
