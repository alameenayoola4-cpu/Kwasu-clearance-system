'use client';

// Component that shows a warning on mobile for admin/officer pages
import { useState, useEffect } from 'react';

export default function MobileWarning({ role = 'admin' }) {
    const [isMobile, setIsMobile] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isMobile || dismissed) return null;

    return (
        <div className="mobile-warning-overlay">
            <div className="mobile-warning-card">
                <div className="warning-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                </div>
                <h2>Desktop Recommended</h2>
                <p>
                    {role === 'admin'
                        ? 'For the best experience managing the clearance system, please access this page on a desktop computer.'
                        : 'For accurate document review and clearance approval, please access this page on a desktop computer.'}
                </p>
                <div className="warning-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setDismissed(true)}
                    >
                        Continue Anyway
                    </button>
                </div>
            </div>

            <style jsx>{`
                .mobile-warning-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                }

                .mobile-warning-card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    max-width: 400px;
                    width: 100%;
                }

                .warning-icon {
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

                .mobile-warning-card h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 12px;
                }

                .mobile-warning-card p {
                    color: #6b7280;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .warning-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }

                .btn-primary {
                    background: #16a34a;
                    color: white;
                }

                .btn-primary:hover {
                    background: #15803d;
                }
            `}</style>
        </div>
    );
}
