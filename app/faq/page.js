'use client';

// FAQ Page - KWASU Digital Clearance System
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const faqs = [
    {
        question: "What is the KWASU Digital Clearance System?",
        answer: "The KWASU Digital Clearance System is an online platform that streamlines the academic clearance process for students at Kwara State University. It allows students to complete SIWES and Final Year clearances digitally, without the need for physical paperwork."
    },
    {
        question: "Who can use this system?",
        answer: "All registered students of Kwara State University who need to complete SIWES clearance or Final Year graduation clearance can use this system. Staff and department officers also have access to process and approve clearance requests."
    },
    {
        question: "How do I start my clearance process?",
        answer: "First, register an account using your matric number and KWASU email. Once logged in, navigate to 'Apply for Clearance' and select the type of clearance you need (SIWES or Final Year). Fill in the required information and upload necessary documents."
    },
    {
        question: "How long does the clearance process take?",
        answer: "The clearance process typically takes 2-5 business days, depending on the number of departments involved and the completeness of your submitted documents. You can track your progress in real-time through your dashboard."
    },
    {
        question: "What documents do I need for clearance?",
        answer: "Required documents vary by clearance type. For SIWES, you'll need your IT letter, logbook, and supervisor's report. For Final Year clearance, you'll need proof of fee payment, library clearance, and department approval. Specific requirements are shown when you apply."
    },
    {
        question: "What if my clearance is rejected?",
        answer: "If your clearance is rejected, you'll receive a notification explaining the reason. You can address the issues mentioned and resubmit your application. Most rejections are due to incomplete documents or missing information."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take data security seriously. All personal information and documents are encrypted and stored securely. Only authorized personnel can access your clearance records."
    },
    {
        question: "Who do I contact for help?",
        answer: "For technical issues, contact the ICT department. For clearance-related queries, contact your department's clearance officer. You can also reach us at ur@kwasu.edu.ng or call (+234) 803 191 5699."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="faq-page">
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
            <main className="faq-main">
                <div className="container">
                    <div className="faq-hero">
                        <h1>Frequently Asked Questions</h1>
                        <p>Find answers to common questions about the Digital Clearance System</p>
                    </div>

                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openIndex === index ? 'open' : ''}`}
                            >
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span>{faq.question}</span>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="faq-icon"
                                    >
                                        <polyline points={openIndex === index ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                                    </svg>
                                </button>
                                {openIndex === index && (
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="faq-contact">
                        <h3>Still have questions?</h3>
                        <p>Contact our support team for personalized assistance.</p>
                        <Link href="/contact" className="btn btn-primary">Contact Us</Link>
                    </div>

                    <div className="faq-actions">
                        <Link href="/" className="btn btn-outline">← Back to Home</Link>
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
                .faq-page {
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

                .faq-main {
                    flex: 1;
                    padding: 3rem 0;
                    background: #f8f9fa;
                }

                .faq-hero {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .faq-hero h1 {
                    font-size: 2.5rem;
                    color: #1E8449;
                    margin-bottom: 0.5rem;
                }

                .faq-hero p {
                    color: #7f8c8d;
                    font-size: 1.125rem;
                }

                .faq-list {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .faq-item {
                    background: white;
                    border-radius: 8px;
                    margin-bottom: 0.75rem;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .faq-question {
                    width: 100%;
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #2c3e50;
                }

                .faq-question:hover {
                    background: #f8f9fa;
                }

                .faq-icon {
                    color: #1E8449;
                    transition: transform 0.2s;
                }

                .faq-item.open .faq-icon {
                    transform: rotate(180deg);
                }

                .faq-answer {
                    padding: 0 1.5rem 1.25rem;
                }

                .faq-answer p {
                    color: #7f8c8d;
                    line-height: 1.7;
                    margin: 0;
                }

                .faq-contact {
                    text-align: center;
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    margin: 3rem auto 2rem;
                    max-width: 500px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .faq-contact h3 {
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                }

                .faq-contact p {
                    color: #7f8c8d;
                    margin-bottom: 1rem;
                }

                .faq-actions {
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
