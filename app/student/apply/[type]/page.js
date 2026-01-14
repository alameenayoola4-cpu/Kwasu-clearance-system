'use client';

// Clearance Application Page - Apply for SIWES or Final Clearance
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import '../../student.css';
import '../apply.css';

// Fallback document requirements (used if API doesn't return any)
const FALLBACK_REQUIREMENTS = {
    siwes: [
        { name: 'SIWES Acceptance Letter', description: 'Your formal acceptance letter signed by the company supervisor.', max_size_mb: 5 },
        { name: 'Logbook / Final Report', description: 'Completed SIWES logbook or final report.', max_size_mb: 10 },
        { name: 'ITF Form 8 (Optional)', description: 'If available, attach your ITF Form 8.', max_size_mb: 5 },
    ],
    'final-year': [
        { name: 'Proof of Tuition Payment', description: 'Receipt or bank confirmation of school fees payment.', max_size_mb: 5 },
        { name: 'Statement of Result', description: 'Your latest statement of result from the previous session.', max_size_mb: 5 },
        { name: 'University ID Card Copy', description: 'Clear scan or photo of your student ID card.', max_size_mb: 5 },
    ],
    faculty: [
        { name: 'Faculty Clearance Form', description: 'Signed faculty clearance form from your department.', max_size_mb: 5 },
        { name: 'Course Registration Form', description: 'Approved course registration for the current session.', max_size_mb: 5 },
        { name: 'Department Approval Letter', description: 'Letter of approval from your Head of Department.', max_size_mb: 5 },
    ],
};

const GUIDELINES = {
    siwes: [
        'Ensure the ITA Form 8 is attached to your logbook.',
        'Acceptance letters must be on official company letterhead.',
        'Processing takes 3-5 business days after submission.',
    ],
    'final-year': [
        'All outstanding fees must be cleared before applying.',
        'Statement of result must be for the previous academic session.',
        'Ensure all documents are legible and in color.',
    ],
    faculty: [
        'Clearance form must be signed by your faculty officer.',
        'Ensure course registration is approved for the current session.',
        'Processing takes 2-3 business days after submission.',
    ],
};

const FALLBACK_TYPE_LABELS = {
    siwes: 'SIWES Clearance',
    'final-year': 'Final Year Clearance',
    faculty: 'Faculty Clearance',
};

export default function ApplyPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const type = resolvedParams.type;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [files, setFiles] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [clearanceType, setClearanceType] = useState(null);

    // Get requirements - use API data if available, otherwise fallback
    const requirements = clearanceType?.requirements?.length > 0
        ? clearanceType.requirements
        : (FALLBACK_REQUIREMENTS[type] || []);

    const typeLabel = clearanceType?.display_name || FALLBACK_TYPE_LABELS[type] || type;

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        try {
            // Fetch user and clearance types in parallel
            const [userRes, typesRes] = await Promise.all([
                fetch('/api/auth/me'),
                fetch('/api/clearance-types'),
            ]);

            if (!userRes.ok) {
                router.push('/login');
                return;
            }

            const userData = await userRes.json();
            setUser(userData.data.user);

            if (typesRes.ok) {
                const typesData = await typesRes.json();
                const foundType = typesData.data?.clearanceTypes?.find(t => t.name === type);
                if (foundType) {
                    setClearanceType(foundType);
                } else {
                    // Type not found in database, might redirect or use fallback
                    console.log('Clearance type not found in database, using fallback');
                }
            }
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (docName, file) => {
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only PDF, JPG, and PNG files are allowed');
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            setFiles(prev => ({ ...prev, [docName]: file }));
            setUploadProgress(prev => ({ ...prev, [docName]: 100 }));
            setError('');
        }
    };

    const removeFile = (docName) => {
        setFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[docName];
            return newFiles;
        });
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[docName];
            return newProgress;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Submit clearance request
            const response = await fetch('/api/student/clearance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit request');
            }

            // Success - redirect to dashboard
            router.push('/student?success=true');

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const guidelines = GUIDELINES[type] || [];
    const completedDocs = Object.keys(files).length;
    const totalDocs = requirements.length;
    const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="apply-page">
            {/* Header */}
            <header className="apply-header">
                <div className="apply-header-left">
                    <Link href="/student" className="apply-logo">
                        <Image src="/logo.png" alt="KWASU" width={32} height={32} />
                        <span>UniClearance</span>
                    </Link>
                </div>
                <nav className="apply-nav">
                    <Link href="/student">Dashboard</Link>
                    <span className="nav-active">{TYPE_LABELS[type]}</span>
                    <Link href="/student">Results</Link>
                    <Link href="/student">Profile</Link>
                </nav>
                <div className="apply-header-right">
                    <button className="notification-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        </svg>
                    </button>
                    <div className="user-avatar-small">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link href="/student">Dashboard</Link>
                <span>/</span>
                <span>{TYPE_LABELS[type]}</span>
                <span>/</span>
                <span className="current">Apply for Clearance</span>
            </div>

            {/* Main Content */}
            <main className="apply-main">
                <div className="apply-content">
                    <h1>{type.toUpperCase()} Clearance Application</h1>
                    <p className="apply-subtitle">
                        Complete your {type === 'siwes' ? 'vocational training' : 'graduation'} clearance by
                        verifying your details and uploading the required certified documents.
                    </p>

                    {/* Student Identity Card */}
                    <div className="identity-card">
                        <div className="identity-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Verified Student Identity</span>
                        </div>
                        <div className="identity-body">
                            <div className="identity-row">
                                <div>
                                    <label>FULL NAME</label>
                                    <p>{user?.name}</p>
                                </div>
                                <div>
                                    <label>MATRICULATION NUMBER</label>
                                    <p>{user?.matric_no}</p>
                                </div>
                            </div>
                            <div className="identity-row">
                                <div>
                                    <label>DEPARTMENT / FACULTY</label>
                                    <p>{user?.department} | {user?.faculty}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Document Upload Section */}
                    <div className="documents-section">
                        <h2>Required Documentation</h2>
                        <p>Please upload high-quality scans of your original documents. Only PDF, JPG, or PNG formats are accepted.</p>

                        <form onSubmit={handleSubmit}>
                            {requirements.map((doc, index) => (
                                <div key={doc.name} className="document-upload-item">
                                    <div className="document-header">
                                        <span className="document-number">{index + 1}. {doc.name}</span>
                                        <span className="document-size">Max size: {doc.maxSize}MB</span>
                                    </div>

                                    {files[doc.name] ? (
                                        <div className="file-uploaded">
                                            <div className="file-icon">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            </div>
                                            <div className="file-info">
                                                <span className="file-name">{files[doc.name].name}</span>
                                                <span className="file-status text-success">
                                                    File uploaded successfully • {(files[doc.name].size / (1024 * 1024)).toFixed(2)} MB
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => removeFile(doc.name)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="file-upload">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(doc.name, e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="file-upload-icon">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                            </div>
                                            <span className="file-upload-text">Click to upload or drag and drop</span>
                                            <span className="file-upload-hint">{doc.description}</span>
                                        </label>
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        Submit Application for Review
                                    </>
                                )}
                            </button>

                            <p className="submit-disclaimer">
                                By submitting, you confirm that all provided documents are authentic and unaltered.
                            </p>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="apply-sidebar">
                    {/* Progress Card */}
                    <div className="sidebar-card">
                        <h3>Application Progress</h3>
                        <div className="progress-tabs">
                            <span className={progressPercent > 0 ? 'active' : ''}>{progressPercent}% COMPLETE</span>
                            <span>{completedDocs}/{totalDocs} Documents</span>
                        </div>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="sidebar-card">
                        <h3>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Guidelines
                        </h3>
                        <ul className="guidelines-list">
                            {guidelines.map((guideline, index) => (
                                <li key={index}>
                                    <span className="guideline-check">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                    <span dangerouslySetInnerHTML={{ __html: guideline.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Card */}
                    <div className="sidebar-card help-card">
                        <h3>Need Help?</h3>
                        <p>If you're having trouble with your document scans, visit the {type.toUpperCase()} unit office or email us.</p>
                        <Link href="#" className="btn btn-outline btn-sm">
                            CONTACT SUPPORT →
                        </Link>
                    </div>
                </aside>
            </main>

            {/* Footer */}
            <footer className="apply-footer">
                <p>© 2026 KWASU Student Services Portal. All rights reserved.</p>
                <div className="footer-links">
                    <Link href="#">PRIVACY POLICY</Link>
                    <Link href="#">USER AGREEMENT</Link>
                    <Link href="#">HELP CENTER</Link>
                </div>
            </footer>
        </div>
    );
}
