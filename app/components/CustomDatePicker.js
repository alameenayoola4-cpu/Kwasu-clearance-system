'use client';

// Custom Date Picker Component - Premium styled calendar
import { useState, useRef, useEffect } from 'react';

export default function CustomDatePicker({
    value,
    onChange,
    label,
    minDate,
    maxDate,
    placeholder = 'Select date'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);

    // Parse the value to a Date object
    const selectedDate = value ? new Date(value) : null;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday)
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    // Format date display
    const formatDisplayDate = (date) => {
        if (!date) return placeholder;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    // Format date for value (YYYY-MM-DD)
    const formatValue = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Handle date selection
    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(formatValue(newDate));
        setIsOpen(false);
    };

    // Navigate months
    const goToPreviousMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // Check if date is disabled
    const isDateDisabled = (day) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (minDate && date < new Date(minDate)) return true;
        if (maxDate && date > new Date(maxDate)) return true;
        return false;
    };

    // Check if date is selected
    const isDateSelected = (day) => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === viewDate.getMonth() &&
            selectedDate.getFullYear() === viewDate.getFullYear()
        );
    };

    // Check if date is today
    const isToday = (day) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear()
        );
    };

    // Generate calendar grid
    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const days = [];

        // Empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const disabled = isDateDisabled(day);
            const selected = isDateSelected(day);
            const today = isToday(day);

            days.push(
                <button
                    key={day}
                    type="button"
                    className={`calendar-day ${selected ? 'selected' : ''} ${today ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                >
                    {day}
                </button>
            );
        }

        return (
            <div className="calendar-dropdown">
                <div className="calendar-header">
                    <button type="button" className="calendar-nav" onClick={goToPreviousMonth}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    <span className="calendar-title">{monthNames[month]} {year}</span>
                    <button type="button" className="calendar-nav" onClick={goToNextMonth}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                        </svg>
                    </button>
                </div>
                <div className="calendar-weekdays">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                </div>
                <div className="calendar-days">
                    {days}
                </div>
                <div className="calendar-footer">
                    <button
                        type="button"
                        className="calendar-today-btn"
                        onClick={() => {
                            const today = new Date();
                            setViewDate(today);
                            onChange(formatValue(today));
                            setIsOpen(false);
                        }}
                    >
                        Today
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="custom-date-picker" ref={containerRef}>
            {label && <label className="date-picker-label">{label}</label>}
            <button
                type="button"
                className="date-picker-input"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
                <span className={selectedDate ? '' : 'placeholder'}>
                    {formatDisplayDate(selectedDate)}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="dropdown-arrow">
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>
            {isOpen && renderCalendar()}
        </div>
    );
}
