// POST /api/auth/login - User login
import { userQueries } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { loginSchema, validateBody } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/utils';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request) {
    try {
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

        // Find user by email (async)
        const user = await userQueries.findByEmail(email);

        if (!user) {
            return errorResponse('Invalid email or password', 401);
        }

        // Check if user role matches
        if (user.role !== role) {
            return errorResponse(`This account is not registered as a ${role}`, 401);
        }

        // Check if user is active
        if (user.status !== 'active') {
            return errorResponse('Your account has been deactivated. Please contact admin.', 401);
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return errorResponse('Invalid email or password', 401);
        }

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

