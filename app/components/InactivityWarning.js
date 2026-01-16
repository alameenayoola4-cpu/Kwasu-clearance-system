'use client';

/**
 * InactivityWarning Component
 * Shows a warning modal when user is about to be logged out due to inactivity
 */

import { useState, useEffect } from 'react';

export default function InactivityWarning() {
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(120); // 2 minutes in seconds

    useEffect(() => {
        const handleWarning = (event) => {
            setShowWarning(true);
            setCountdown(120);
        };

        window.addEventListener('inactivity-warning', handleWarning);
        return () => window.removeEventListener('inactivity-warning', handleWarning);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!showWarning) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [showWarning]);

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        // Trigger any activity to reset the timer
        document.dispatchEvent(new Event('click'));
    };

    if (!showWarning) return null;

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="inactivity-overlay">
            <div className="inactivity-modal">
                <div className="inactivity-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <h2>Session Expiring Soon</h2>
                <p>
                    You will be automatically logged out in{' '}
                    <strong>{minutes}:{seconds.toString().padStart(2, '0')}</strong>
                </p>
                <p className="inactivity-hint">
                    For your security, sessions expire after a period of inactivity.
                </p>
                <button className="btn btn-primary" onClick={handleStayLoggedIn}>
                    Stay Logged In
                </button>
            </div>

            <style jsx>{`
                .inactivity-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(4px);
                }

                .inactivity-modal {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .inactivity-icon {
                    width: 80px;
                    height: 80px;
                    background: #fef3c7;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: #d97706;
                }

                h2 {
                    margin: 0 0 16px;
                    color: #1f2937;
                    font-size: 24px;
                }

                p {
                    color: #6b7280;
                    margin: 0 0 12px;
                    font-size: 16px;
                }

                p strong {
                    color: #dc2626;
                    font-size: 20px;
                }

                .inactivity-hint {
                    font-size: 13px;
                    color: #9ca3af;
                    margin-bottom: 24px;
                }

                .btn {
                    padding: 12px 32px;
                    background: #1e8449;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn:hover {
                    background: #166534;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}
