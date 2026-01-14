'use client';

// Hook to sync authentication state across browser tabs
import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Key used in localStorage to track auth changes
const AUTH_SYNC_KEY = 'kwasu_auth_sync';

export function useAuthSync(expectedRole = null) {
    const router = useRouter();
    const pathname = usePathname();

    // Broadcast auth change to other tabs
    const broadcastAuthChange = useCallback((userId, role) => {
        const authData = {
            userId,
            role,
            timestamp: Date.now(),
        };
        localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify(authData));
    }, []);

    // Handle auth change from another tab
    const handleStorageChange = useCallback((event) => {
        if (event.key !== AUTH_SYNC_KEY) return;

        const newValue = event.newValue;

        // If logged out (value removed or null)
        if (!newValue) {
            // Redirect to login if on protected page
            if (pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname.startsWith('/officer')) {
                router.push('/login');
            }
            return;
        }

        try {
            const authData = JSON.parse(newValue);

            // If we're expecting a specific role and it changed
            if (expectedRole && authData.role !== expectedRole) {
                // Role changed - redirect to appropriate dashboard
                switch (authData.role) {
                    case 'admin':
                        if (!pathname.startsWith('/admin')) {
                            router.push('/admin');
                        }
                        break;
                    case 'student':
                        if (!pathname.startsWith('/student')) {
                            router.push('/student');
                        }
                        break;
                    case 'officer':
                        if (!pathname.startsWith('/officer')) {
                            router.push('/officer');
                        }
                        break;
                    default:
                        router.push('/login');
                }
            }

            // If user logged out (no role)
            if (!authData.role) {
                if (pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname.startsWith('/officer')) {
                    router.push('/login');
                }
            }
        } catch (e) {
            console.error('Auth sync parse error:', e);
        }
    }, [router, pathname, expectedRole]);

    useEffect(() => {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [handleStorageChange]);

    return { broadcastAuthChange };
}

// Helper to broadcast login
export function broadcastLogin(userId, role) {
    const authData = {
        userId,
        role,
        timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify(authData));
}

// Helper to broadcast logout
export function broadcastLogout() {
    localStorage.removeItem(AUTH_SYNC_KEY);
}
