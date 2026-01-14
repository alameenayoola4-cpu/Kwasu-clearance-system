// POST /api/auth/register - Student registration
import { userQueries } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { studentRegistrationSchema, validateBody } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate input
        const validation = validateBody(body, studentRegistrationSchema);
        if (!validation.success) {
            return errorResponse(validation.error);
        }

        const { name, email, password, matric_no, department, faculty, level } = validation.data;

        // Check if email already exists (async)
        const existingEmail = await userQueries.findByEmail(email);
        if (existingEmail) {
            return errorResponse('An account with this email already exists');
        }

        // Check if matric number already exists (async)
        const existingMatric = await userQueries.findByMatric(matric_no);
        if (existingMatric) {
            return errorResponse('An account with this matric number already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user (async)
        const result = await userQueries.create({
            email,
            password: hashedPassword,
            name,
            role: 'student',
            matric_no,
            department,
            faculty,
            level: level || null,
            clearance_type: null,
        });

        // Get created user (async)
        const user = await userQueries.findById(result.lastInsertRowid);

        // Generate JWT token
        const token = generateToken(user);

        // Set auth cookie
        await setAuthCookie(token);

        // Return user data (without password)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            matric_no: user.matric_no,
            department: user.department,
            faculty: user.faculty,
            level: user.level,
        };

        return successResponse('Registration successful', { user: userData });

    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse('An error occurred during registration', 500);
    }
}
