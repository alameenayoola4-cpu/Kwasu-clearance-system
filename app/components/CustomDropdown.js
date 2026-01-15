'use client';

// Custom Styled Dropdown Component
import { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({
    value,
    onChange,
    options,
    icon,
    placeholder = 'Select...'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                {icon && <span className="dropdown-icon">{icon}</span>}
                <span className="dropdown-value">{displayText}</span>
                <svg
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {options.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            className={`dropdown-item ${value === option.value ? 'active' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
