// Utility functions
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique clearance request ID
 * Format: CLR-YYYY-XXXX (e.g., CLR-2024-0001)
 * @returns {string}
 */
function generateRequestId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CLR-${year}-${random}`;
}

/**
 * Generate a unique file name using UUID
 * @param {string} originalName - Original filename
 * @returns {string}
 */
function generateFileName(originalName) {
    const ext = originalName.split('.').pop();
    return `${uuidv4()}.${ext}`;
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date with time for display
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get time ago string
 * @param {string|Date} date - Date
 * @returns {string}
 */
function timeAgo(date) {
    if (!date) return '';

    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (!bytes) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get status badge class
 * @param {string} status - Status string
 * @returns {string}
 */
function getStatusClass(status) {
    const classes = {
        pending: 'badge-pending',
        approved: 'badge-approved',
        rejected: 'badge-rejected',
        active: 'badge-active',
        inactive: 'badge-inactive',
    };
    return classes[status] || 'badge-default';
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string}
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Create API response object
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object} data - Response data
 * @returns {object}
 */
function apiResponse(success, message, data = null) {
    const response = { success, message };
    if (data !== null) {
        response.data = data;
    }
    return response;
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
function errorResponse(message, status = 400) {
    return Response.json(
        apiResponse(false, message),
        { status }
    );
}

/**
 * Create success response
 * @param {string} message - Success message
 * @param {object} data - Response data
 * @returns {Response}
 */
function successResponse(message, data = null) {
    return Response.json(
        apiResponse(true, message, data),
        { status: 200 }
    );
}

module.exports = {
    generateRequestId,
    generateFileName,
    formatDate,
    formatDateTime,
    timeAgo,
    formatFileSize,
    getStatusClass,
    capitalize,
    apiResponse,
    errorResponse,
    successResponse,
};
