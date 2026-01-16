'use client';

// Student Registration Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import '../login/auth.css';

export default function RegisterPage() {
    const router = useRouter();
    const [faculties, setFaculties] = useState([]);
    const [loadingFaculties, setLoadingFaculties] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        matric_no: '',
        faculty: '',
        department: '',
        level: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Fetch faculties and departments on mount
    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const response = await fetch('/api/departments');
            const data = await response.json();
            if (data.success) {
                setFaculties(data.data.faculties);
            }
        } catch (err) {
            console.error('Failed to fetch faculties:', err);
        } finally {
            setLoadingFaculties(false);
        }
    };

    // Get departments for selected faculty
    const getDepartments = () => {
        const selectedFaculty = faculties.find(f => f.name === formData.faculty);
        return selectedFaculty?.departments || [];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');

        // Reset department when faculty changes
        if (name === 'faculty') {
            setFormData(prev => ({ ...prev, faculty: value, department: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Client-side validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    matric_no: formData.matric_no,
                    faculty: formData.faculty,
                    department: formData.department,
                    level: parseInt(formData.level) || 100,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Redirect to student dashboard
            router.push('/student');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split">
            {/* Left Side - Branding */}
            <div className="auth-split-left">
                <Link href="/" className="logo" style={{ marginBottom: '2rem' }}>
                    <Image
                        src="/logo.png"
                        alt="KWASU Logo"
                        width={50}
                        height={50}
                    />
                </Link>

                <h1>
                    Elevating the <span>KWASU Academic</span> Experience.
                </h1>
                <p>
                    A streamlined digital clearance and approval system designed for the next
                    generation of KWASU scholars. Fast, secure, and paperless.
                </p>

                <div className="auth-features">
                    <div className="auth-feature">
                        <div className="auth-feature-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="auth-feature-text">
                            <strong>SECURE</strong>
                            Encrypted Data
                        </div>
                    </div>
                    <div className="auth-feature">
                        <div className="auth-feature-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                        <div className="auth-feature-text">
                            <strong>INSTANT</strong>
                            Real-time Approval
                        </div>
                    </div>
                </div>

                <p style={{ marginTop: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>
                    © 2026 KWASU Digital Systems.
                </p>
            </div>

            {/* Right Side - Form */}
            <div className="auth-split-right">
                <div className="auth-split-card">
                    {/* Badge */}
                    <div className="auth-split-badge">
                        FRESH REGISTRATION
                    </div>

                    <h2 style={{ marginBottom: 'var(--space-2)' }}>New Student Onboarding</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                        Create your digital profile to start the clearance process.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="e.g. Oluwaseun Adeyemi"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Matric Number / JAMB ID</label>
                            <div className="input-with-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <input
                                    type="text"
                                    name="matric_no"
                                    className="form-input"
                                    placeholder="e.g. U2025/ENG/001"
                                    value={formData.matric_no}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="your.email@kwasu.edu.ng"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Faculty</label>
                                <select
                                    name="faculty"
                                    className="form-select"
                                    value={formData.faculty}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingFaculties}
                                >
                                    <option value="">{loadingFaculties ? 'Loading...' : 'Select Faculty'}</option>
                                    {faculties.map(faculty => (
                                        <option key={faculty.name} value={faculty.name}>{faculty.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <select
                                    name="department"
                                    className="form-select"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.faculty}
                                >
                                    <option value="">Select Department</option>
                                    {getDepartments().map(dept => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Current Level</label>
                            <select
                                name="level"
                                className="form-select"
                                value={formData.level}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="100">100 Level</option>
                                <option value="200">200 Level</option>
                                <option value="300">300 Level</option>
                                <option value="400">400 Level</option>
                                <option value="500">500 Level</option>
                                <option value="600">600 Level</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-with-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="form-hint">Must include uppercase, lowercase, and number</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg btn-block"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Access My Portal →
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already registered? <Link href="/login">Login here</Link>
                    </p>

                    <div className="auth-footer-links">
                        <a href="#">ENCRYPTED SESSION</a>
                        <a href="#">HELP</a>
                        <a href="#">PRIVACY</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
