'use client';

// Clearance Certificate Page - View and download clearance certificate
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import '../../student.css';
import '../certificate.css';

export default function CertificatePage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCertificate();
    }, [id]);

    const fetchCertificate = async () => {
        try {
            const response = await fetch(`/api/student/certificate/${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load certificate');
            }

            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading certificate...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={() => router.push('/student')} className="btn btn-primary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="certificate-page">
            {/* Header - Hidden on print */}
            <header className="certificate-header no-print">
                <Link href="/student" className="header-logo">
                    <Image src="/logo.png" alt="KWASU" width={32} height={32} />
                    <span>UniClearance</span>
                </Link>
                <div className="header-actions">
                    <button onClick={handlePrint} className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        Print Certificate
                    </button>
                    <Link href="/student" className="btn btn-ghost">
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            {/* Certificate */}
            <main className="certificate-main">
                <div className="certificate">
                    {/* Certificate Header */}
                    <div className="certificate-top">
                        <div className="certificate-logo">
                            <Image src="/logo.png" alt="KWASU Logo" width={80} height={80} />
                        </div>
                        <div className="certificate-institution">
                            <h1>KWARA STATE UNIVERSITY</h1>
                            <p>MALETE, KWARA STATE, NIGERIA</p>
                        </div>
                    </div>

                    {/* Certificate Title */}
                    <div className="certificate-title">
                        <h2>CLEARANCE CERTIFICATE</h2>
                        <p className="certificate-type">
                            {data?.certificate?.type === 'final'
                                ? 'Final Year Graduation Clearance'
                                : 'SIWES Industrial Training Clearance'
                            }
                        </p>
                    </div>

                    {/* Certificate Body */}
                    <div className="certificate-body">
                        <p className="certificate-intro">This is to certify that</p>

                        <div className="student-name-display">
                            <h3>{data?.student?.name}</h3>
                        </div>

                        <p className="certificate-text">
                            with Matriculation Number <strong>{data?.student?.matric_no}</strong>
                        </p>

                        <p className="certificate-text">
                            of the Department of <strong>{data?.student?.department}</strong>,
                            Faculty of <strong>{data?.student?.faculty}</strong>
                        </p>

                        <p className="certificate-completion">
                            has satisfactorily completed all requirements for
                            <strong> {data?.certificate?.type === 'final'
                                ? 'Final Year Graduation'
                                : 'SIWES Industrial Training'
                            } Clearance</strong> and is hereby cleared by the University.
                        </p>
                    </div>

                    {/* Certificate Footer */}
                    <div className="certificate-footer">
                        <div className="certificate-details">
                            <div className="detail">
                                <span className="label">Certificate No:</span>
                                <span className="value">{data?.certificate?.number}</span>
                            </div>
                            <div className="detail">
                                <span className="label">Date Issued:</span>
                                <span className="value">{data?.certificate?.issued_date}</span>
                            </div>
                        </div>

                        <div className="signatures">
                            <div className="signature-block">
                                <div className="signature-line"></div>
                                <p className="signature-name">{data?.reviewer?.name || 'Clearance Officer'}</p>
                                <p className="signature-title">{data?.reviewer?.department || 'Clearance Unit'}</p>
                            </div>
                            <div className="signature-block">
                                <div className="signature-line"></div>
                                <p className="signature-name">University Registrar</p>
                                <p className="signature-title">Academic Affairs</p>
                            </div>
                        </div>

                        <div className="certificate-seal">
                            <div className="seal">
                                <span>OFFICIAL</span>
                                <span>SEAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Verification Notice */}
                    <div className="verification-notice">
                        <p>
                            This certificate can be verified at: <strong>clearance.kwasu.edu.ng/verify/{data?.certificate?.number}</strong>
                        </p>
                    </div>
                </div>
            </main>

            {/* Instructions - Hidden on print */}
            <div className="certificate-instructions no-print">
                <h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    Important Information
                </h3>
                <ul>
                    <li>This certificate is an official document from Kwara State University.</li>
                    <li>Keep this document safe for your records.</li>
                    <li>Present this certificate when required for academic or administrative purposes.</li>
                    <li>Any alteration to this document renders it invalid.</li>
                </ul>
            </div>
        </div>
    );
}
