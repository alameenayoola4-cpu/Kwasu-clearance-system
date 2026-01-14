// POST /api/auth/logout - User logout
import { removeAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST() {
    try {
        // Remove auth cookie
        await removeAuthCookie();

        return successResponse('Logout successful');

    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse('An error occurred during logout', 500);
    }
}
