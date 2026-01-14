// GET /api/auth/me - Get current authenticated user
import { getCurrentUser } from '@/lib/auth';
import { userQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Get user from token
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        // Get fresh user data from database (async)
        const user = await userQueries.findById(tokenUser.id);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        if (user.status !== 'active') {
            return errorResponse('Your account has been deactivated', 401);
        }

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
            clearance_type: user.clearance_type,
        };

        return successResponse('User retrieved', { user: userData });

    } catch (error) {
        console.error('Get user error:', error);
        return errorResponse('An error occurred', 500);
    }
}
