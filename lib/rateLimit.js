// Rate limiting utility for API endpoints
// Simple in-memory rate limiter (use Redis for production at scale)

const rateLimitStore = new Map();
const loginAttemptsStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();

    // Clean rate limit store
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.firstRequest > 60000) { // 1 minute window
            rateLimitStore.delete(key);
        }
    }

    // Clean login attempts store
    for (const [key, data] of loginAttemptsStore.entries()) {
        if (now - data.lastAttempt > 900000) { // 15 minutes
            loginAttemptsStore.delete(key);
        }
    }
}, 300000); // Run every 5 minutes

/**
 * Rate limit by IP address
 * @param {string} ip - Client IP address
 * @param {number} maxRequests - Max requests per window (default 5)
 * @param {number} windowMs - Window in ms (default 60000 = 1 minute)
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(ip, maxRequests = 5, windowMs = 60000) {
    const now = Date.now();
    const key = `ip:${ip}`;

    let data = rateLimitStore.get(key);

    if (!data || now - data.firstRequest > windowMs) {
        // New window
        data = { count: 1, firstRequest: now };
        rateLimitStore.set(key, data);
        return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    data.count++;
    rateLimitStore.set(key, data);

    const resetIn = windowMs - (now - data.firstRequest);

    if (data.count > maxRequests) {
        return { allowed: false, remaining: 0, resetIn };
    }

    return { allowed: true, remaining: maxRequests - data.count, resetIn };
}

/**
 * Track failed login attempts for account lockout
 * @param {string} email - User email
 * @returns {{ locked: boolean, attempts: number, lockedUntil: number | null }}
 */
export function checkLoginAttempts(email) {
    const key = `login:${email.toLowerCase()}`;
    const data = loginAttemptsStore.get(key);

    if (!data) {
        return { locked: false, attempts: 0, lockedUntil: null };
    }

    const now = Date.now();

    // Check if lockout period has passed (15 minutes)
    if (data.lockedUntil && now > data.lockedUntil) {
        loginAttemptsStore.delete(key);
        return { locked: false, attempts: 0, lockedUntil: null };
    }

    if (data.lockedUntil) {
        return {
            locked: true,
            attempts: data.attempts,
            lockedUntil: data.lockedUntil,
            remainingMs: data.lockedUntil - now
        };
    }

    return { locked: false, attempts: data.attempts, lockedUntil: null };
}

/**
 * Record a failed login attempt
 * @param {string} email - User email
 * @param {number} maxAttempts - Max attempts before lockout (default 5)
 * @param {number} lockoutMs - Lockout duration in ms (default 15 minutes)
 * @returns {{ locked: boolean, attempts: number }}
 */
export function recordFailedLogin(email, maxAttempts = 5, lockoutMs = 900000) {
    const key = `login:${email.toLowerCase()}`;
    const now = Date.now();

    let data = loginAttemptsStore.get(key) || { attempts: 0, lastAttempt: now };

    data.attempts++;
    data.lastAttempt = now;

    // Lock account after max attempts
    if (data.attempts >= maxAttempts) {
        data.lockedUntil = now + lockoutMs;
    }

    loginAttemptsStore.set(key, data);

    return {
        locked: data.attempts >= maxAttempts,
        attempts: data.attempts,
        attemptsRemaining: Math.max(0, maxAttempts - data.attempts)
    };
}

/**
 * Clear login attempts after successful login
 * @param {string} email - User email
 */
export function clearLoginAttempts(email) {
    const key = `login:${email.toLowerCase()}`;
    loginAttemptsStore.delete(key);
}

/**
 * Get client IP from request headers
 * @param {Request} request
 * @returns {string}
 */
export function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return '127.0.0.1'; // Fallback for local development
}
