'use client';

// Shared Officer Sidebar Component
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function OfficerSidebar({ userName, userDepartment }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            const { broadcastLogout } = await import('../hooks/useAuthSync');
            broadcastLogout();
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const isActive = (path) => {
        if (path === '/officer') {
            return pathname === '/officer';
        }
        return pathname?.startsWith(path);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link href="/officer" className="sidebar-logo">
                    <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                    <div className="sidebar-logo-text">
                        <span className="logo-title">KWASU Clearance</span>
                        <span className="logo-subtitle">KWASU ED SYSTEM</span>
                    </div>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <Link href="/officer" className={`nav-item ${isActive('/officer') && pathname === '/officer' ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="12" width="7" height="9" rx="1" />
                        <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                    Dashboard
                </Link>
                <Link href="/officer/requests" className={`nav-item ${isActive('/officer/requests') ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V8z" />
                    </svg>
                    Requests
                </Link>
                <Link href="/officer/reports" className={`nav-item ${isActive('/officer/reports') ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                    Reports
                </Link>
                <Link href="/officer/settings" className={`nav-item ${isActive('/officer/settings') ? 'active' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                    </svg>
                    Settings
                </Link>
            </nav>

            {/* User Profile at Bottom */}
            <div className="sidebar-footer">
                <div className="sidebar-user-profile">
                    <div className="user-avatar-lg">
                        {userName?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{userName || 'Officer'}</span>
                        <span className="user-dept">{userDepartment || ''}</span>
                    </div>
                </div>
                <button className="sidebar-logout-btn" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}
