'use client';

// Admin Settings Page
import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import '../../student/student.css';
import '../admin.css';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'KWASU Digital Clearance System',
        supportEmail: 'support@kwasu.edu.ng',
        allowRegistration: true,
        requireEmailVerification: false,
        sessionTimeout: 30,
        maintenanceMode: false,
        currentSession: '2025/2026',
        currentSemester: '1',
    });
    const [saved, setSaved] = useState(false);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.data?.settings) {
                    setSettings(prev => ({ ...prev, ...data.data.settings }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        {
            id: 'general',
            label: 'General',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.486.486 0 0 0-.59.22L3.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
        },
        {
            id: 'security',
            label: 'Security',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
        },
        {
            id: 'maintenance',
            label: 'Maintenance',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" /></svg>
        },
    ];

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
                            <span className="current">Settings</span>
                        </nav>
                        <h1>System Settings</h1>
                    </div>
                    <div className="topbar-right">
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    <div className="settings-layout">
                        {/* Settings Tabs */}
                        <div className="settings-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span className="tab-icon">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Settings Content */}
                        <div className="settings-content">
                            {activeTab === 'general' && (
                                <div className="officers-section">
                                    <div className="section-header">
                                        <div>
                                            <h2>General Settings</h2>
                                            <p className="section-subtitle">Configure basic system settings</p>
                                        </div>
                                    </div>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>Site Name</label>
                                            <input
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Support Email</label>
                                            <input
                                                type="email"
                                                value={settings.supportEmail}
                                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowRegistration}
                                                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                                />
                                                <span>Allow New Student Registration</span>
                                            </label>
                                        </div>

                                        {/* Academic Session Settings */}
                                        <div className="settings-divider"></div>
                                        <h3 className="settings-section-title">Academic Session</h3>

                                        <div className="form-group">
                                            <label>Current Session</label>
                                            <select
                                                value={settings.currentSession}
                                                onChange={(e) => setSettings({ ...settings, currentSession: e.target.value })}
                                                className="form-select"
                                            >
                                                {/* Generate 20 years of options */}
                                                {Array.from({ length: 20 }, (_, i) => {
                                                    const startYear = 2020 + i;
                                                    const session = `${startYear}/${startYear + 1}`;
                                                    return <option key={session} value={session}>{session}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Current Semester</label>
                                            <select
                                                value={settings.currentSemester}
                                                onChange={(e) => setSettings({ ...settings, currentSemester: e.target.value })}
                                                className="form-select"
                                            >
                                                <option value="1">First Semester</option>
                                                <option value="2">Second Semester</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="officers-section">
                                    <div className="section-header">
                                        <div>
                                            <h2>Security Settings</h2>
                                            <p className="section-subtitle">Configure security options</p>
                                        </div>
                                    </div>
                                    <div className="settings-form">
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.requireEmailVerification}
                                                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                                />
                                                <span>Require Email Verification</span>
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>Session Timeout (minutes)</label>
                                            <input
                                                type="number"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="officers-section">
                                    <div className="section-header">
                                        <div>
                                            <h2>Notification Settings</h2>
                                            <p className="section-subtitle">Configure email notifications</p>
                                        </div>
                                    </div>
                                    <div className="settings-form">
                                        <p className="settings-info">
                                            Email notification settings will be available in a future update.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'maintenance' && (
                                <div className="officers-section">
                                    <div className="section-header">
                                        <div>
                                            <h2>Maintenance Mode</h2>
                                            <p className="section-subtitle">Enable maintenance mode to temporarily disable the system</p>
                                        </div>
                                    </div>
                                    <div className="settings-form">
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label danger">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.maintenanceMode}
                                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                                />
                                                <span>Enable Maintenance Mode</span>
                                            </label>
                                            <p className="field-hint">
                                                When enabled, only administrators can access the system.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .settings-layout {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    gap: var(--space-5);
                }

                .settings-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .settings-tab {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-3) var(--space-4);
                    border: none;
                    background: none;
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    color: var(--color-text);
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s ease;
                }

                .settings-tab:hover {
                    background-color: var(--color-background);
                }

                .settings-tab.active {
                    background-color: var(--color-primary);
                    color: var(--color-white);
                }

                .tab-icon {
                    font-size: 1.2rem;
                }

                .settings-content {
                    flex: 1;
                }

                .settings-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                    padding: var(--space-4) 0;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .form-group label {
                    font-weight: 500;
                    font-size: var(--font-size-sm);
                    color: var(--color-text);
                }

                .form-group input[type="text"],
                .form-group input[type="email"],
                .form-group input[type="number"] {
                    padding: var(--space-3);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    max-width: 400px;
                }

                .checkbox-group {
                    flex-direction: row;
                    align-items: flex-start;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    cursor: pointer;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .checkbox-label.danger span {
                    color: var(--color-error);
                }

                .field-hint {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                    margin-top: var(--space-1);
                }

                .form-select {
                    padding: var(--space-3);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    max-width: 400px;
                    background: white;
                    cursor: pointer;
                }

                .settings-divider {
                    height: 1px;
                    background: var(--color-border);
                    margin: var(--space-4) 0;
                }

                .settings-section-title {
                    font-size: var(--font-size-base);
                    font-weight: 600;
                    margin: 0 0 var(--space-2);
                    color: var(--color-text);
                }

                .settings-info {
                    color: var(--color-text-muted);
                    font-size: var(--font-size-sm);
                }

                @media (max-width: 768px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                    }

                    .settings-tabs {
                        flex-direction: row;
                        overflow-x: auto;
                        gap: var(--space-2);
                        padding-bottom: var(--space-2);
                    }

                    .settings-tab {
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
}
