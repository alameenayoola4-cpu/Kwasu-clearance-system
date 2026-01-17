'use client';

// Forgot Password Page - Students Only
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '../globals.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to process request');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <Link href="/" className="auth-logo">
                            <Image src="/logo.png" alt="KWASU" width={60} height={60} />
                        </Link>
                        <h1>Forgot Password</h1>
                        <p>Enter your student email to reset your password</p>
                    </div>

                    {success ? (
                        <div className="success-message">
                            <div className="success-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h2>Check Your Email</h2>
                            <p>
                                If a student account with that email exists, we've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <p className="note">
                                Check your spam folder if you don't see the email.
                            </p>
                            <Link href="/login" className="btn btn-primary">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            {error && (
                                <div className="alert alert-error">
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Student Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your student email"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="auth-footer">
                                <Link href="/login" className="back-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="19" y1="12" x2="5" y2="12" />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}

                    <div className="info-note">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>This is for students only. Officers and admins should contact IT support.</span>
                    </div>
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
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .form-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                }
                .form-group input {
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .form-group input:focus {
                    outline: none;
                    border-color: #16a34a;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
                }
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    text-align: center;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    color: white;
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn-block {
                    width: 100%;
                }
                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                }
                .alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                .auth-footer {
                    text-align: center;
                    padding-top: 16px;
                }
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #6b7280;
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: color 0.2s;
                }
                .back-link:hover {
                    color: #16a34a;
                }
                .success-message {
                    text-align: center;
                }
                .success-icon {
                    margin-bottom: 16px;
                }
                .success-message h2 {
                    font-size: 1.25rem;
                    color: #1f2937;
                    margin: 0 0 12px 0;
                }
                .success-message p {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0 0 12px 0;
                    line-height: 1.5;
                }
                .success-message .note {
                    color: #9ca3af;
                    font-size: 0.813rem;
                    margin-bottom: 24px;
                }
                .info-note {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-top: 24px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .info-note svg {
                    flex-shrink: 0;
                    margin-top: 2px;
                }
            `}</style>
        </div>
    );
}
