// Authentication utilities - JWT and password hashing
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cookies } = require('next/headers');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'kwasu-clearance-secret-key-2024-secure';
const SALT_ROUNDS = 12;

// Role-based session expiry times
// For admin/officer: session cookies (no maxAge) = expire on browser close
// For students: persistent cookies with maxAge
const SESSION_EXPIRY = {
    admin: { jwt: '4h', cookie: null, inactivityTimeout: 15 },      // 15 min inactivity, session cookie
    officer: { jwt: '8h', cookie: null, inactivityTimeout: 30 },    // 30 min inactivity, session cookie
    student: { jwt: '48h', cookie: 60 * 60 * 48, inactivityTimeout: null },  // 48 hours persistent
};

// Cookie configuration
const COOKIE_NAME = 'kwasu_auth_token';
const getBaseCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
});

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user with role-based expiry
 * @param {object} user - User object from database
 * @returns {string} - JWT token
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        matric_no: user.matric_no,
        department: user.department,
        faculty: user.faculty,
    };

    // Get role-based expiry (default to 24h if role not found)
    const expiresIn = SESSION_EXPIRY[user.role]?.jwt || '24h';
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Set authentication cookie with role-based expiry
 * For admin/officer: session cookie (expires when browser closes)
 * For students: persistent cookie with maxAge
 * @param {string} token - JWT token
 * @param {string} role - User role for determining cookie type
 */
async function setAuthCookie(token, role = 'student') {
    const cookieStore = await cookies();
    const cookieOptions = { ...getBaseCookieOptions() };

    // Get cookie maxAge based on role
    // null = session cookie (expires on browser close) for admin/officer
    // number = persistent cookie for students
    const maxAge = SESSION_EXPIRY[role]?.cookie;

    if (maxAge !== null && maxAge !== undefined) {
        // Persistent cookie for students
        cookieOptions.maxAge = maxAge;
    }
    // For admin/officer, no maxAge = session cookie (expires when browser closes)

    cookieStore.set(COOKIE_NAME, token, cookieOptions);
}

/**
 * Get authentication cookie
 * @returns {Promise<string|null>} - Token or null
 */
async function getAuthCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    return cookie?.value || null;
}

/**
 * Remove authentication cookie (logout)
 */
async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current authenticated user from cookies
 * @returns {Promise<object|null>} - User payload or null
 */
async function getCurrentUser() {
    const token = await getAuthCookie();
    if (!token) return null;
    return verifyToken(token);
}

/**
 * Check if user has required role
 * @param {object} user - User object
 * @param {string|string[]} allowedRoles - Role(s) that are allowed
 * @returns {boolean}
 */
function hasRole(user, allowedRoles) {
    if (!user) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true, message: 'Password is strong' };
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    setAuthCookie,
    getAuthCookie,
    removeAuthCookie,
    getCurrentUser,
    hasRole,
    validatePassword,
    JWT_SECRET,
    COOKIE_NAME,
};
