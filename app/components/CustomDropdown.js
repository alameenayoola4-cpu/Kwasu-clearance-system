'use client';

// Custom Styled Dropdown Component with Search
import { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({
    value,
    onChange,
    options,
    icon,
    placeholder = 'Select...',
    searchable = false // Enable search for long lists
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Auto-enable search for lists with more than 10 options
    const showSearch = searchable || options.length > 10;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, showSearch]);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

    // Filter options based on search
    const filteredOptions = searchQuery
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : options;

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
                <div className="dropdown-menu dropdown-menu-scrollable">
                    {showSearch && (
                        <div className="dropdown-search">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="dropdown-options">
                        {filteredOptions.length === 0 ? (
                            <div className="dropdown-no-results">No results found</div>
                        ) : (
                            filteredOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`dropdown-item ${value === option.value ? 'active' : ''}`}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
