'use client';

// Admin Students Management Page
import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import '../../student/student.css';
import '../admin.css';

export default function StudentsPage() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/admin/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(data.data?.students || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.matric_no?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <AdminSidebar userName="Admin Central" />

            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <nav className="breadcrumb-nav">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span className="current">Students</span>
                        </nav>
                        <h1>Manage Students</h1>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Stats */}
                    <div className="stats-grid admin-stats">
                        <div className="stat-card">
                            <span className="stat-change positive">+5.2%</span>
                            <div className="stat-icon students">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73c1.17-.51 2.61-.9 4.24-.9zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.62c0-.83.23-1.61.63-2.28zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1c.4.67.63 1.45.63 2.28V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3z" />
                                </svg>
                            </div>
                            <span className="stat-label">TOTAL STUDENTS</span>
                            <span className="stat-value">{students.length}</span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-change positive">+2.1%</span>
                            <div className="stat-icon officers">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            </div>
                            <span className="stat-label">ACTIVE STUDENTS</span>
                            <span className="stat-value">{students.filter(s => s.status === 'active').length}</span>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon pending-highlight">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <span className="stat-label">CLEARED STUDENTS</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>

                    {/* Students Section */}
                    <div className="officers-section">
                        <div className="section-header">
                            <div>
                                <h2>Student Directory</h2>
                                <p className="section-subtitle">View and manage registered students</p>
                            </div>
                            <div className="section-actions">
                                <select
                                    className="filter-select"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>STUDENT NAME</th>
                                        <th>MATRIC NUMBER</th>
                                        <th>DEPARTMENT</th>
                                        <th>FACULTY</th>
                                        <th>STATUS</th>
                                        <th>CLEARANCE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id}>
                                                <td>
                                                    <div className="officer-cell">
                                                        <div className="officer-avatar">
                                                            {student.name?.charAt(0).toUpperCase() || 'S'}
                                                        </div>
                                                        <div className="officer-info">
                                                            <span className="officer-name">{student.name}</span>
                                                            <span className="officer-email">{student.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{student.matric_no || 'N/A'}</td>
                                                <td>{student.department || 'N/A'}</td>
                                                <td>{student.faculty || 'N/A'}</td>
                                                <td>
                                                    <span className={`status-dot ${student.status === 'active' ? 'active' : 'inactive'}`}>
                                                        {student.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="clearance-badge">
                                                        {student.clearance_type?.toUpperCase() || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span className="table-info">Showing {filteredStudents.length} of {students.length} students</span>
                            <div className="pagination">
                                <button className="pagination-btn" disabled>Previous</button>
                                <span className="pagination-page active">1</span>
                                <button className="pagination-btn" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
