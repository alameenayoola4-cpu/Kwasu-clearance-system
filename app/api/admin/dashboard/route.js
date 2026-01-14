// GET /api/admin/dashboard - Get admin dashboard data
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, userQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Get current user
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        // Get statistics (async)
        const totalStudentsResult = await userQueries.count('student');
        const totalOfficersResult = await userQueries.count('officer');
        const pendingResult = await requestQueries.countByStatus('pending');

        const totalStudents = totalStudentsResult?.count || 0;
        const totalOfficers = totalOfficersResult?.count || 0;
        const pendingClearances = pendingResult?.count || 0;

        // Get all officers (async)
        const officers = await userQueries.findOfficers('officer');

        const formattedOfficers = officers.map(officer => ({
            id: officer.id,
            name: officer.name,
            email: officer.email,
            department: officer.department,
            clearance_type: officer.clearance_type,
            status: officer.status,
            created_at: officer.created_at,
        }));

        return successResponse('Dashboard data retrieved', {
            stats: {
                totalStudents,
                totalOfficers,
                pendingClearances,
            },
            officers: formattedOfficers,
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        return errorResponse('Failed to load dashboard', 500);
    }
}
