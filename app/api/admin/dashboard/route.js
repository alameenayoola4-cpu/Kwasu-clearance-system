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

        // Get statistics
        const totalStudents = userQueries.count.get('student')?.count || 0;
        const totalOfficers = userQueries.count.get('officer')?.count || 0;
        const pendingClearances = requestQueries.countByStatus.get('pending')?.count || 0;

        // Get all officers
        const officers = userQueries.findOfficers.all('officer');

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
