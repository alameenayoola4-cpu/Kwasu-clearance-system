'use client';

/**
 * useInactivityTimeout Hook
 * Logs out admin/officer users after a period of inactivity
 * Similar to PayPal's security feature
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Inactivity timeout in minutes by role
const INACTIVITY_TIMEOUT = {
    admin: 15,    // 15 minutes
    officer: 30,  // 30 minutes
    student: null // No timeout for students
};

export function useInactivityTimeout(role) {
    const router = useRouter();
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    // Get timeout for this role (in milliseconds)
    const timeoutMinutes = INACTIVITY_TIMEOUT[role];
    const timeoutMs = timeoutMinutes ? timeoutMinutes * 60 * 1000 : null;
    const warningMs = timeoutMinutes ? (timeoutMinutes - 2) * 60 * 1000 : null; // Warn 2 min before

    // Reset the inactivity timer
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);

        // Don't set timer if no timeout for this role
        if (!timeoutMs) return;

        // Set warning timer (2 minutes before logout)
        if (warningMs > 0) {
            warningRef.current = setTimeout(() => {
                // Show warning notification
                if (typeof window !== 'undefined') {
                    const remaining = 2;
                    const event = new CustomEvent('inactivity-warning', {
                        detail: { minutes: remaining }
                    });
                    window.dispatchEvent(event);
                }
            }, warningMs);
        }

        // Set logout timer
        timeoutRef.current = setTimeout(async () => {
            // Log out the user
            try {
                await fetch('/api/auth/logout', { method: 'POST' });

                // Clear local storage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('kwasu_auth_sync');
                }

                // Redirect to login with message
                router.push('/login?reason=inactivity');
            } catch (error) {
                console.error('Logout error:', error);
                router.push('/login');
            }
        }, timeoutMs);
    }, [timeoutMs, warningMs, router]);

    // Activity event handler
    const handleActivity = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        // Don't set up listeners if no timeout for this role
        if (!timeoutMs) return;

        // Events that indicate user activity
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'focus'
        ];

        // Add event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Initial timer
        resetTimer();

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [timeoutMs, handleActivity, resetTimer]);

    return {
        resetTimer,
        timeoutMinutes,
        isEnabled: !!timeoutMs
    };
}

export default useInactivityTimeout;
