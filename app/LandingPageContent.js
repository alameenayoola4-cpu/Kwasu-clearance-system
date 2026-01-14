'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './landing.css';
import { AnimatedStat, AnimatedStepCard } from './components/AnimatedComponents';

export default function LandingPageContent() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="landing">
            {/* Header */}
            <header className="landing-header">
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
                        <nav className={`nav-center ${mobileMenuOpen ? 'active' : ''}`}>
                            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
                            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Process</Link>
                            <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                            <Link href="/login" className="mobile-login-btn" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        </nav>
                        <div className="nav-right">
                            <Link href="/login" className="btn btn-primary">Login</Link>
                        </div>
                        <button
                            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section - Split Layout */}
            <section className="hero">
                <div className="container">
                    <div className="hero-split">
                        <div className="hero-text">
                            <span className="hero-badge">KWASU DIGITAL INFRASTRUCTURE</span>
                            <h1>Digital Clearance <span className="text-gold">Made Simple</span></h1>
                            <p>
                                Transforming Kwara State University from tedious manual workflows
                                to a seamless, automated digital experience. Fast, secure, and transparent.
                            </p>
                            <div className="hero-buttons">
                                <Link href="/register" className="btn btn-primary btn-lg">
                                    Get Started →
                                </Link>
                                <Link href="#how-it-works" className="btn btn-outline btn-lg">
                                    View Demo
                                </Link>
                            </div>
                            <div className="hero-users">
                                <div className="user-avatars">
                                    <span className="avatar" style={{ backgroundColor: '#4CAF50' }}>A</span>
                                    <span className="avatar" style={{ backgroundColor: '#2196F3' }}>B</span>
                                    <span className="avatar" style={{ backgroundColor: '#9C27B0' }}>C</span>
                                </div>
                                <span className="users-text">Join <strong>10,000+</strong> students already cleared</span>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="hero-image-card">
                                <Image
                                    src="/hero-kwasu.jpg"
                                    alt="KWASU Campus"
                                    width={400}
                                    height={280}
                                    className="hero-img"
                                />
                                <div className="approval-badge">
                                    <div className="approval-info">
                                        <span className="approval-label">RECENT APPROVAL</span>
                                        <span className="approval-uni">Ayoola - SIWES Clearance</span>
                                    </div>
                                    <span className="approval-status">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Scroll Animated */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid-landing">
                        <AnimatedStat number="45+" desc="Active Departments" delay={0} />
                        <AnimatedStat number="12k+" desc="Processed Clearances" delay={0.1} />
                        <AnimatedStat number="99.9%" desc="Success Rate" delay={0.2} />
                        <AnimatedStat number="2min" desc="Avg. Initiation Time" delay={0.3} />
                    </div>
                </div>
            </section>

            {/* How It Works - Scroll Animated */}
            <section id="how-it-works" className="how-it-works">
                <div className="container">
                    <h2>How It Works</h2>
                    <p className="section-subtitle">
                        Complete your graduation or SIWES clearance in three easy steps. No queues, no paperwork, no stress.
                    </p>
                    <div className="steps-grid">
                        <AnimatedStepCard
                            delay={0}
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            }
                            title="1. Initiate"
                            description="Submit your clearance request online in minutes through our secure portal. All required documents are uploaded digitally."
                        />
                        <AnimatedStepCard
                            delay={0.15}
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            }
                            title="2. Track"
                            description="Real-time monitoring of approvals across all departments and units. No more manual follow-ups at the admin block."
                        />
                        <AnimatedStepCard
                            delay={0.3}
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            }
                            title="3. Complete"
                            description="Download your digitally signed clearance certificate once all approvals are met. Instant, verifiable, and secure."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to experience seamless clearance?</h2>
                        <p>Join thousands of students and staff moving at the speed of digital.</p>
                        <div className="cta-buttons">
                            <Link href="/login" className="btn btn-outline-light btn-lg">
                                Sign In Now
                            </Link>
                            <a href="https://portal.kwasu.edu.ng/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
                                Institution Login
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <Image
                                    src="/logo.png"
                                    alt="KWASU Logo"
                                    width={32}
                                    height={38}
                                />
                                <span>KWASU Clearance</span>
                            </div>
                            <p>
                                Modernizing the KWASU academic ecosystem through digital-first clearance automation.
                            </p>
                        </div>
                        <div className="footer-links">
                            <h4>Product</h4>
                            <Link href="#how-it-works">How It Works</Link>
                            <Link href="#">Features</Link>
                            <Link href="#">Security</Link>
                            <Link href="#">Pricing</Link>
                        </div>
                        <div className="footer-links">
                            <h4>Company</h4>
                            <Link href="#">About Us</Link>
                            <Link href="#">Partners</Link>
                            <Link href="/contact">Contact</Link>
                            <Link href="#">Terms of Service</Link>
                        </div>
                        <div className="footer-links">
                            <h4>Support</h4>
                            <Link href="#">Help Center</Link>
                            <Link href="#">FAQ</Link>
                            <Link href="#">Student Guide</Link>
                            <Link href="#">Admin Guide</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 KWASU Digital Clearance System. All rights reserved.</p>
                        <div className="social-icons">
                            <a href="https://x.com/KwasuOfficial" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="https://web.facebook.com/KwasuUpdate" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/kwarastateuniversity" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
