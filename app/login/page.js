'use client';

// Login Page with Role Selector
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRecaptcha } from '../hooks/useRecaptcha';
import './auth.css';

export default function LoginPage() {
    const router = useRouter();
    const { executeRecaptcha } = useRecaptcha();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({ ...prev, role }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Get reCAPTCHA token
            const recaptchaToken = await executeRecaptcha('login');

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    recaptchaToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Broadcast login to other tabs
            const { broadcastLogin } = await import('../hooks/useAuthSync');
            broadcastLogin(data.user?.id, formData.role);

            // Redirect based on role
            const redirectPath = `/${formData.role}`;
            router.push(redirectPath);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Header */}
            <header className="auth-header">
                <Link href="/" className="logo">
                    <Image
                        src="/logo.png"
                        alt="KWASU Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    <span className="logo-text">Digital Clearance Portal</span>
                </Link>
                <div className="auth-header-links">
                    <Link href="#">Contact Support</Link>
                    <Link href="#">FAQ</Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="auth-main">
                <div className="auth-container">
                    {/* University Title */}
                    <div className="auth-university">
                        <h1>Kwara State University</h1>
                        <p>Institutional clearance and digital approval system</p>
                    </div>

                    {/* Login Card */}
                    <div className="auth-card">
                        <div className="auth-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14M9 9h1M9 13h1M9 17h1" />
                            </svg>
                        </div>

                        <h2>Welcome Back</h2>

                        {/* Role Selector */}
                        <div className="role-selector">
                            <label>Access Role</label>
                            <div className="role-buttons">
                                <button
                                    type="button"
                                    className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                                    onClick={() => handleRoleChange('student')}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    className={`role-btn ${formData.role === 'officer' ? 'active' : ''}`}
                                    onClick={() => handleRoleChange('officer')}
                                >
                                    Officer
                                </button>
                                <button
                                    type="button"
                                    className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleRoleChange('admin')}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-with-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder={formData.role === 'student' ? 'matric@kwasu.edu.ng' : 'name@kwasu.edu.ng'}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label-row">
                                    <label className="form-label">Password</label>
                                    <Link href="/forgot-password" className="forgot-link">Forgot Password?</Link>
                                </div>
                                <div className="input-with-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Login to Portal →
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Registration Link */}
                        {formData.role === 'student' && (
                            <p className="auth-switch">
                                New student? <Link href="/register">Begin Registration</Link>
                            </p>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="auth-footer-info">
                        <p>USE YOUR INSTITUTIONAL CREDENTIALS TO LOG IN.</p>
                        <p>© 2026 KWASU Digital Infrastructure. v1.0.0</p>
                    </div>
                </div>
            </main>

            {/* Help Button */}
            <button className="help-btn">
                <span>?</span>
                Need Help?
            </button>
        </div>
    );
}
