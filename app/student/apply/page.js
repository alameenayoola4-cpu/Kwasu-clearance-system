'use client';

// Student Apply for Clearance Page
// Shows clearances available for student's level
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentSidebar from '../../components/StudentSidebar';
import '../student.css';
import './apply.css';

export default function ApplyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [clearanceTypes, setClearanceTypes] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/student/dashboard');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load data');
            }

            setStudentInfo(result.data?.user);
            setClearanceTypes(result.data?.eligibleClearanceTypes || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <StudentSidebar userName="Loading..." />
                <main className="dashboard-main">
                    <div className="dashboard-loading">
                        <div className="spinner spinner-lg"></div>
                        <p>Loading available clearances...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-layout">
                <StudentSidebar userName="Student" />
                <main className="dashboard-main">
                    <div className="dashboard-error">
                        <p>{error}</p>
                        <button onClick={fetchData} className="btn btn-primary">Retry</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <StudentSidebar userName={studentInfo?.name || 'Student'} />

            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <Link href="/student">Dashboard</Link>
                            <span>&gt;</span>
                            <span className="current">Apply for Clearance</span>
                        </nav>
                        <h1>Apply for Clearance</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="user-badge">
                            <span className="user-name">{studentInfo?.name}</span>
                            <span className="user-matric">{studentInfo?.matric_no}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="dashboard-content">
                    <div className="apply-intro">
                        <p>Select the clearance you want to apply for. Only clearances available for your level ({studentInfo?.level || 100}L) are shown.</p>
                    </div>

                    {clearanceTypes.length === 0 ? (
                        <div className="no-clearances-panel">
                            <div className="no-clearances-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                            </div>
                            <h3>No Clearances Available</h3>
                            <p>There are no clearances available for your current level ({studentInfo?.level || 100} Level).</p>
                            <p className="text-muted">Please check back later or contact the administration.</p>
                        </div>
                    ) : (
                        <div className="clearance-grid">
                            {clearanceTypes.map((type) => (
                                <Link
                                    key={type.id}
                                    href={`/student/apply/${type.name}`}
                                    className="clearance-apply-card"
                                >
                                    <div className="card-icon">
                                        {type.name.includes('siwes') ? (
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                            </svg>
                                        ) : type.name.includes('final') ? (
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                <polyline points="9 12 11 14 15 10" />
                                            </svg>
                                        ) : (
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h3>{type.display_name}</h3>
                                        <p>{type.description || 'Apply for this clearance'}</p>
                                        {type.target_level && (
                                            <span className="level-tag">
                                                {type.target_level === 'final' ? 'Final Year' : `${type.target_level} Level`}
                                            </span>
                                        )}
                                    </div>
                                    <svg className="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
