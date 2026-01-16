/**
 * reCAPTCHA v3 Server-side Verification
 * Verifies the reCAPTCHA token sent from the frontend
 */

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// Minimum score threshold (0.0 = bot, 1.0 = human)
// 0.5 is recommended by Google for most use cases
const MIN_SCORE_THRESHOLD = 0.5;

/**
 * Verify reCAPTCHA token
 * @param {string} token - The reCAPTCHA token from frontend
 * @param {string} expectedAction - The expected action (e.g., 'login', 'register')
 * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string}>}
 */
async function verifyRecaptcha(token, expectedAction = null) {
    // If no secret key configured, skip verification (allow request)
    if (!RECAPTCHA_SECRET_KEY || RECAPTCHA_SECRET_KEY === 'your_secret_key_here') {
        console.warn('reCAPTCHA: No secret key configured, skipping verification');
        return { success: true, skipped: true };
    }

    // If no token provided, fail verification
    if (!token) {
        return { success: false, error: 'No reCAPTCHA token provided' };
    }

    try {
        const response = await fetch(RECAPTCHA_VERIFY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: RECAPTCHA_SECRET_KEY,
                response: token,
            }),
        });

        const data = await response.json();

        // Check if verification was successful
        if (!data.success) {
            return {
                success: false,
                error: 'reCAPTCHA verification failed',
                errorCodes: data['error-codes'],
            };
        }

        // Check score threshold
        if (data.score < MIN_SCORE_THRESHOLD) {
            return {
                success: false,
                score: data.score,
                error: `Score too low: ${data.score}. Suspected bot activity.`,
            };
        }

        // Optionally verify the action matches
        if (expectedAction && data.action !== expectedAction) {
            return {
                success: false,
                error: `Action mismatch. Expected: ${expectedAction}, Got: ${data.action}`,
            };
        }

        return {
            success: true,
            score: data.score,
            action: data.action,
            hostname: data.hostname,
        };
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return {
            success: false,
            error: 'Failed to verify reCAPTCHA: ' + error.message,
        };
    }
}

/**
 * Middleware helper to verify reCAPTCHA in API routes
 * @param {Request} request - The incoming request
 * @param {string} action - Expected action name
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateRecaptchaFromRequest(request, action) {
    try {
        const body = await request.clone().json();
        const token = body.recaptchaToken;

        const result = await verifyRecaptcha(token, action);

        if (!result.success && !result.skipped) {
            return { valid: false, error: result.error };
        }

        return { valid: true, score: result.score };
    } catch (error) {
        // If parsing fails or any error, allow the request (graceful degradation)
        console.warn('reCAPTCHA validation error:', error.message);
        return { valid: true, skipped: true };
    }
}

module.exports = {
    verifyRecaptcha,
    validateRecaptchaFromRequest,
    MIN_SCORE_THRESHOLD,
};
