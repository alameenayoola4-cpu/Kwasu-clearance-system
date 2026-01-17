'use client';

// Shared Student Sidebar Component - Premium Version with Mobile Support
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Student navigation icons
const icons = {
    dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
        </svg>
    ),
    apply: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
    ),
    history: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
        </svg>
    ),
    documents: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
    ),
    help: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
    ),
    profile: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    ),
};

// Student navigation items
const navItems = [
    { href: '/student', label: 'Dashboard', icon: icons.dashboard },
    { href: '/student/apply', label: 'Apply for Clearance', icon: icons.apply },
    { href: '/student/history', label: 'Clearance History', icon: icons.history },
    { href: '/student/documents', label: 'Document Uploads', icon: icons.documents },
    { href: '/student/profile', label: 'My Profile', icon: icons.profile },
    { href: '/student/help', label: 'Help & Support', icon: icons.help },
];

export default function StudentSidebar({ userName = 'Student', matricNo = '' }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = async () => {
        const { broadcastLogout } = await import('../hooks/useAuthSync');
        broadcastLogout();
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const isActive = (href) => {
        if (href === '/student') {
            return pathname === '/student';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Header with Hamburger */}
            <div className="mobile-header">
                <button
                    className="hamburger-btn"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <Link href="/student" className="mobile-logo">
                    <Image src="/logo.png" alt="KWASU" width={32} height={32} />
                    <span>Digital Clearance</span>
                </Link>
                <div className="mobile-avatar">
                    {userName.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar premium-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Close button for mobile */}
                <button
                    className="sidebar-close-btn"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="sidebar-header">
                    <Link href="/student" className="sidebar-logo">
                        <Image src="/logo.png" alt="KWASU" width={40} height={40} />
                        <div className="sidebar-logo-text">
                            <span className="logo-title">Digital Clearance</span>
                            <span className="logo-subtitle">KWASU SYSTEM</span>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav premium-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer premium-footer">
                    <div className="admin-profile">
                        <div className="admin-avatar">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="admin-info-footer">
                            <span className="admin-name">{userName}</span>
                            <span className="sign-out-text">Sign Out</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                            title="Sign Out"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#64748b', minWidth: '18px', minHeight: '18px', flexShrink: 0 }}>
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
