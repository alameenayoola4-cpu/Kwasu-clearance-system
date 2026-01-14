'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @returns {[ref, boolean]} - Ref to attach to element and whether it's visible
 */
export function useScrollAnimation(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // Once visible, stay visible (don't re-animate on scroll up)
            if (entry.isIntersecting) {
                setIsVisible(true);
            }
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px',
            ...options
        });

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options.threshold, options.rootMargin]);

    return [ref, isVisible];
}

/**
 * Animated section wrapper component
 */
export function AnimatedSection({ children, className = '', delay = 0, animation = 'fadeInUp' }) {
    const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

    const animationClass = isVisible ? `animate-${animation}` : 'animate-hidden';
    const style = {
        animationDelay: isVisible ? `${delay}s` : '0s',
    };

    return (
        <div ref={ref} className={`${className} ${animationClass}`} style={style}>
            {children}
        </div>
    );
}
