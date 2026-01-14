'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animated section that triggers animation when scrolled into view
 */
export function AnimatedSection({ children, className = '', delay = 0 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible ? 'scroll-animate-visible' : 'scroll-animate-hidden'}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
}

/**
 * Animated stat item
 */
export function AnimatedStat({ number, desc, delay = 0 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`stat-item ${isVisible ? 'scroll-animate-visible' : 'scroll-animate-hidden'}`}
            style={{ animationDelay: `${delay}s` }}
        >
            <span className="stat-number">{number}</span>
            <span className="stat-desc">{desc}</span>
        </div>
    );
}

/**
 * Animated step card
 */
export function AnimatedStepCard({ icon, title, description, delay = 0 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`step-card ${isVisible ? 'scroll-animate-visible' : 'scroll-animate-hidden'}`}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="step-icon-wrapper">
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}
