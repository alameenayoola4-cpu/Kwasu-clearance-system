'use client';

// About Page - KWASU Digital Clearance System
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="about-page">
            {/* Header */}
            <header className="page-header">
                <div className="container">
                    <div className="header-content">
                        <Link href="/" className="logo">
                            <Image
                                src="/logo.png"
                                alt="KWASU Logo"
                                width={42}
                                height={50}
                                priority
                            />
                            <span className="logo-text">KWASU Clearance</span>
                        </Link>
                        <nav className="nav-links">
                            <Link href="/">Home</Link>
                            <Link href="/login" className="btn btn-primary">Login</Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="about-main">
                <div className="container">
                    <div className="about-hero">
                        <h1>About KWASU Digital Clearance</h1>
                        <p>Modernizing the academic clearance process at Kwara State University</p>
                    </div>

                    <div className="about-content">
                        <section className="about-section">
                            <h2>Our Mission</h2>
                            <p>
                                The KWASU Digital Clearance System is designed to streamline and modernize the
                                academic clearance process at Kwara State University. We eliminate paperwork,
                                reduce waiting times, and provide a transparent, efficient clearance experience
                                for students and staff alike.
                            </p>
                        </section>

                        <section className="about-section">
                            <h2>What We Offer</h2>
                            <div className="features-grid">
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                        </svg>
                                    </div>
                                    <h3>SIWES Clearance</h3>
                                    <p>Complete your industrial training clearance online with ease.</p>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                    </div>
                                    <h3>Final Year Clearance</h3>
                                    <p>Seamless graduation clearance across all departments.</p>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                    </div>
                                    <h3>Real-time Tracking</h3>
                                    <p>Monitor your clearance status in real-time.</p>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <h3>Secure & Verified</h3>
                                    <p>All documents are digitally signed and verified.</p>
                                </div>
                            </div>
                        </section>

                        <section className="about-section">
                            <h2>About KWASU</h2>
                            <p>
                                Kwara State University (KWASU) was established in 2009 and is located in Malete,
                                Kwara State, Nigeria. The university is committed to providing quality education
                                and developing skilled graduates with integrity.
                            </p>
                            <p><strong>Motto:</strong> Skills & Integrity</p>
                        </section>
                    </div>

                    <div className="about-actions">
                        <Link href="/" className="btn btn-outline">← Back to Home</Link>
                        <Link href="/register" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="page-footer">
                <div className="container">
                    <p>© 2026 KWASU Digital Clearance System. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
                .about-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .page-header {
                    background: white;
                    padding: 1rem 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                }

                .logo-text {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1E8449;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .nav-links a {
                    color: #2c3e50;
                    font-weight: 500;
                }

                .about-main {
                    flex: 1;
                    padding: 3rem 0;
                    background: #f8f9fa;
                }

                .about-hero {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .about-hero h1 {
                    font-size: 2.5rem;
                    color: #1E8449;
                    margin-bottom: 0.5rem;
                }

                .about-hero p {
                    color: #7f8c8d;
                    font-size: 1.125rem;
                }

                .about-content {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .about-section {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .about-section h2 {
                    color: #1E8449;
                    margin-bottom: 1rem;
                }

                .about-section p {
                    color: #7f8c8d;
                    line-height: 1.7;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .feature-item {
                    padding: 1.5rem;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 1px solid #e9ecef;
                }

                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: #1E8449;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    margin-bottom: 1rem;
                }

                .feature-item h3 {
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                    font-size: 1rem;
                }

                .feature-item p {
                    margin: 0;
                    font-size: 0.875rem;
                }

                .about-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .page-footer {
                    background: #1a1a2e;
                    color: rgba(255,255,255,0.7);
                    padding: 1.5rem 0;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
