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

        const { name, email, password, matric_no, department, faculty } = validation.data;

        // Check if email already exists
        const existingEmail = userQueries.findByEmail.get(email);
        if (existingEmail) {
            return errorResponse('An account with this email already exists');
        }

        // Check if matric number already exists
        const existingMatric = userQueries.findByMatric.get(matric_no);
        if (existingMatric) {
            return errorResponse('An account with this matric number already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const result = userQueries.create.run({
            email,
            password: hashedPassword,
            name,
            role: 'student',
            matric_no,
            department,
            faculty,
            clearance_type: null,
        });

        // Get created user
        const user = userQueries.findById.get(result.lastInsertRowid);

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
        };

        return successResponse('Registration successful', { user: userData });

    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse('An error occurred during registration', 500);
    }
}
