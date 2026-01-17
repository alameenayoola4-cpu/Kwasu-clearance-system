// POST /api/auth/login - User login with rate limiting and account lockout
import { userQueries } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { loginSchema, validateBody } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/utils';
import { verifyRecaptcha } from '@/lib/recaptcha';
import {
    checkRateLimit,
    checkLoginAttempts,
    recordFailedLogin,
    clearLoginAttempts,
    getClientIP
} from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // Get client IP for rate limiting
        const clientIP = getClientIP(request);

        // Check rate limit (5 requests per minute per IP)
        const rateLimit = checkRateLimit(clientIP, 5, 60000);
        if (!rateLimit.allowed) {
            const retryAfter = Math.ceil(rateLimit.resetIn / 1000);
            return errorResponse(
                `Too many requests. Please try again in ${retryAfter} seconds.`,
                429
            );
        }

        // Parse request body
        const body = await request.json();

        // Verify reCAPTCHA token first (bot protection)
        const { recaptchaToken, ...loginData } = body;
        const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login');

        if (!recaptchaResult.success && !recaptchaResult.skipped) {
            return errorResponse('Security verification failed. Please try again.', 403);
        }

        // Validate input
        const validation = validateBody(loginData, loginSchema);
        if (!validation.success) {
            return errorResponse(validation.error);
        }

        const { email, password, role } = validation.data;

        // Check if account is locked
        const lockStatus = checkLoginAttempts(email);
        if (lockStatus.locked) {
            const remainingMinutes = Math.ceil(lockStatus.remainingMs / 60000);
            return errorResponse(
                `Account temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
                423
            );
        }

        // Find user by email (async)
        const user = await userQueries.findByEmail(email);

        if (!user) {
            // Record failed attempt but don't reveal if user exists
            recordFailedLogin(email);
            return errorResponse('Invalid email or password', 401);
        }

        // Check if user role matches
        if (user.role !== role) {
            recordFailedLogin(email);
            return errorResponse(`This account is not registered as a ${role}`, 401);
        }

        // Check if user is active
        if (user.status !== 'active') {
            return errorResponse('Your account has been deactivated. Please contact admin.', 401);
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            const failResult = recordFailedLogin(email);
            if (failResult.locked) {
                return errorResponse(
                    'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
                    423
                );
            }
            return errorResponse(
                `Invalid email or password. ${failResult.attemptsRemaining} attempts remaining.`,
                401
            );
        }

        // Clear failed attempts on successful login
        clearLoginAttempts(email);

        // Generate JWT token
        const token = generateToken(user);

        // Set auth cookie with role-based expiry
        await setAuthCookie(token, user.role);

        // Return user data (without password)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            matric_no: user.matric_no,
            department: user.department,
            faculty: user.faculty,
        };

        return successResponse('Login successful', { user: userData });

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse('An error occurred during login', 500);
    }
}
