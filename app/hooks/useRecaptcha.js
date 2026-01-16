'use client';

/**
 * useRecaptcha Hook
 * Handles reCAPTCHA v3 token generation for form submissions
 */

import { useCallback, useEffect, useState } from 'react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function useRecaptcha() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load reCAPTCHA script
    useEffect(() => {
        // Skip if no site key configured
        if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your_site_key_here') {
            console.warn('reCAPTCHA: No site key configured, skipping...');
            setIsLoading(false);
            return;
        }

        // Check if already loaded
        if (window.grecaptcha) {
            setIsLoaded(true);
            setIsLoading(false);
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // Wait for grecaptcha to be ready
            window.grecaptcha.ready(() => {
                setIsLoaded(true);
                setIsLoading(false);
            });
        };

        script.onerror = () => {
            console.error('reCAPTCHA: Failed to load script');
            setIsLoading(false);
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup script on unmount (optional)
        };
    }, []);

    // Execute reCAPTCHA and get token
    const executeRecaptcha = useCallback(async (action = 'submit') => {
        // If no site key, return null (allow form submission without captcha)
        if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your_site_key_here') {
            return null;
        }

        if (!isLoaded || !window.grecaptcha) {
            console.warn('reCAPTCHA: Not loaded yet');
            return null;
        }

        try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
            return token;
        } catch (error) {
            console.error('reCAPTCHA: Error executing', error);
            return null;
        }
    }, [isLoaded]);

    return {
        executeRecaptcha,
        isLoaded,
        isLoading,
        isConfigured: RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== 'your_site_key_here'
    };
}

export default useRecaptcha;
