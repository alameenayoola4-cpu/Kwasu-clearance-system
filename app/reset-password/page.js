'use client';

// Reset Password Page - Students Only
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import '../globals.css';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (tokenParam && emailParam) {
            setToken(tokenParam);
            setEmail(emailParam);
            validateToken(tokenParam, emailParam);
        } else {
            setValidating(false);
            setError('Invalid or missing reset link. Please request a new one.');
        }
    }, [searchParams]);

    const validateToken = async (token, email) => {
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, action: 'validate' }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setTokenValid(true);
            } else {
                setError(result.message || 'Invalid or expired reset link.');
            }
        } catch (err) {
            setError('Failed to validate reset link.');
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, password, action: 'reset' }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to reset password');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Validating reset link...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="success-message">
                <div className="success-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h2>Password Reset Successful!</h2>
                <p>Your password has been updated. You can now login with your new password.</p>
                <Link href="/login" className="btn btn-primary">
                    Go to Login
                </Link>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="error-state">
                <div className="error-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h2>Invalid Reset Link</h2>
                <p>{error || 'This password reset link is invalid or has expired.'}</p>
                <Link href="/forgot-password" className="btn btn-primary">
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    disabled={loading}
                    minLength={6}
                />
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
            >
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <Link href="/" className="auth-logo">
                            <Image src="/logo.png" alt="KWASU" width={60} height={60} />
                        </Link>
                        <h1>Reset Password</h1>
                        <p>Create a new password for your account</p>
                    </div>

                    <Suspense fallback={
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading...</p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            <style jsx>{`
                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
                    padding: 20px;
                }
                .auth-container {
                    width: 100%;
                    max-width: 420px;
                }
                .auth-card {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .auth-logo {
                    display: inline-block;
                    margin-bottom: 16px;
                }
                .auth-header h1 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 8px 0;
                }
                .auth-header p {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0;
                }
                .loading-state, .error-state, .success-message {
                    text-align: center;
                    padding: 20px 0;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #16a34a;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .error-icon, .success-icon {
                    margin-bottom: 16px;
                }
            `}</style>
        </div>
    );
}
