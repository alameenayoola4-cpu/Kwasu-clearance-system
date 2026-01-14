'use client';

// Contact Page - KWASU Digital Clearance System
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
    return (
        <div className="contact-page">
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
            <main className="contact-main">
                <div className="container">
                    <div className="contact-hero">
                        <h1>Contact Us</h1>
                        <p>Get in touch with our support team for any inquiries about the Digital Clearance System.</p>
                    </div>

                    <div className="contact-grid">
                        {/* General Contact */}
                        <div className="contact-card">
                            <div className="contact-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <h3>Address</h3>
                            <p>P.M.B 1530 Ilorin, 23431</p>
                            <p>Malete, Kwara State, Nigeria</p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <h3>Phone</h3>
                            <p><a href="tel:+2348031915699">(+234) 803 191 5699</a></p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h3>Email</h3>
                            <p><a href="mailto:ur@kwasu.edu.ng">ur@kwasu.edu.ng</a></p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Hours of Operation</h3>
                            <p>Monday - Friday: 08:00 - 18:00</p>
                            <p>Saturday & Sunday: 10:00 - 16:00</p>
                        </div>
                    </div>

                    {/* Department Contacts */}
                    <div className="department-section">
                        <h2>Department Contacts</h2>
                        <div className="department-grid">
                            <div className="department-card">
                                <h4>Admissions & Aid (Undergraduate)</h4>
                                <p><strong>Phone:</strong> +234 803 191 5699</p>
                                <p><strong>Email:</strong> ur@kwasu.edu.ng</p>
                            </div>
                            <div className="department-card">
                                <h4>Graduate and Professional</h4>
                                <p><strong>Phone:</strong> +234 803 191 5699</p>
                                <p><strong>Email:</strong> ur@kwasu.edu.ng</p>
                            </div>
                            <div className="department-card">
                                <h4>Community Safety</h4>
                                <p><strong>Phone:</strong> +234 803 191 5699</p>
                                <p><strong>Email:</strong> ur@kwasu.edu.ng</p>
                            </div>
                            <div className="department-card">
                                <h4>Employment</h4>
                                <p><strong>Phone:</strong> +234 803 191 5699</p>
                                <p><strong>Email:</strong> ur@kwasu.edu.ng</p>
                            </div>
                            <div className="department-card">
                                <h4>Media Inquiries</h4>
                                <p><strong>Phone:</strong> +234 803 191 5699</p>
                                <p><strong>Email:</strong> ur@kwasu.edu.ng</p>
                            </div>
                            <div className="department-card">
                                <h4>Visitor Information</h4>
                                <p><strong>Phone:</strong> +234 803 191 5699</p>
                                <p><strong>Email:</strong> ur@kwasu.edu.ng</p>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="contact-actions">
                        <Link href="/" className="btn btn-outline">← Back to Home</Link>
                        <Link href="/login" className="btn btn-primary">Login to Portal</Link>
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
                .contact-page {
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

                .contact-main {
                    flex: 1;
                    padding: 3rem 0;
                    background: #f8f9fa;
                }

                .contact-hero {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .contact-hero h1 {
                    font-size: 2.5rem;
                    color: #1E8449;
                    margin-bottom: 0.5rem;
                }

                .contact-hero p {
                    color: #7f8c8d;
                    font-size: 1.125rem;
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .contact-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .contact-icon {
                    width: 56px;
                    height: 56px;
                    background: #1E8449;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    color: white;
                }

                .contact-card h3 {
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                }

                .contact-card p {
                    color: #7f8c8d;
                    margin: 0.25rem 0;
                }

                .contact-card a {
                    color: #1E8449;
                }

                .department-section {
                    margin-bottom: 3rem;
                }

                .department-section h2 {
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: #2c3e50;
                }

                .department-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1rem;
                }

                .department-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border-left: 4px solid #1E8449;
                }

                .department-card h4 {
                    color: #1E8449;
                    margin-bottom: 0.75rem;
                }

                .department-card p {
                    margin: 0.25rem 0;
                    color: #7f8c8d;
                    font-size: 0.875rem;
                }

                .contact-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }

                .page-footer {
                    background: #1a1a2e;
                    color: rgba(255,255,255,0.7);
                    padding: 1.5rem 0;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
