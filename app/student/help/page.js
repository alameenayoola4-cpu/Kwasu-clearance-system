'use client';

// Help & Support Page
import { useState } from 'react';
import Link from 'next/link';
import StudentSidebar from '../../components/StudentSidebar';
import '../student.css';

export default function HelpSupport() {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            question: 'How do I apply for clearance?',
            answer: 'Navigate to "Apply for Clearance" from the sidebar, select the clearance type available for your level, and complete the required documentation.'
        },
        {
            question: 'What documents do I need to upload?',
            answer: 'Required documents vary by clearance type. Each clearance application will show the specific documents you need to submit.'
        },
        {
            question: 'How long does clearance approval take?',
            answer: 'Approval time depends on the clearance type and the reviewing officers. Most applications are processed within 2-5 working days.'
        },
        {
            question: 'What do I do if my clearance is rejected?',
            answer: 'Check the rejection reason provided, correct the issue, and resubmit your application. Contact the relevant office if you need clarification.'
        },
        {
            question: 'Can I track my clearance status?',
            answer: 'Yes! Go to "Clearance History" to see all your applications and their current status.'
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName="Student" />

            <main className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Help & Support</span>
                        </nav>
                        <h1>Help & Support</h1>
                    </div>
                </header>

                <div className="dashboard-content">
                    <p className="apply-intro">Find answers to common questions or get in touch with support</p>

                    {/* Search */}
                    <div className="help-search">
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* FAQs */}
                    <div className="help-section">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-list">
                            {filteredFaqs.map((faq, index) => (
                                <details key={index} className="faq-item">
                                    <summary className="faq-question">
                                        <span>{faq.question}</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </summary>
                                    <p className="faq-answer">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="help-section">
                        <h2>Contact Support</h2>
                        <div className="contact-cards">
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <h3>Email Support</h3>
                                <p>clearance@kwasu.edu.ng</p>
                            </div>
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <h3>Phone</h3>
                                <p>+234 803 123 4567</p>
                            </div>
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <h3>Visit</h3>
                                <p>Admin Block, Room 105</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .help-search {
                    margin-bottom: 24px;
                }
                .search-input {
                    width: 100%;
                    max-width: 400px;
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                .search-input:focus {
                    outline: none;
                    border-color: #16a34a;
                }
                .help-section {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .help-section h2 {
                    font-size: 1.1rem;
                    margin-bottom: 16px;
                }
                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .faq-item {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .faq-question {
                    padding: 16px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 500;
                    background: #f9fafb;
                }
                .faq-question:hover {
                    background: #f0fdf4;
                }
                .faq-answer {
                    padding: 16px;
                    color: #6b7280;
                    border-top: 1px solid #e5e7eb;
                    margin: 0;
                }
                .contact-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }
                .contact-card {
                    text-align: center;
                    padding: 24px;
                    background: #f9fafb;
                    border-radius: 8px;
                }
                .contact-icon {
                    width: 48px;
                    height: 48px;
                    background: #dcfce7;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #16a34a;
                    margin: 0 auto 12px;
                }
                .contact-card h3 {
                    font-size: 0.95rem;
                    margin-bottom: 4px;
                }
                .contact-card p {
                    color: #6b7280;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}
