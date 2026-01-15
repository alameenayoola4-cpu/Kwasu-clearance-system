// GET /api/officer/dashboard - Get officer dashboard data (OPTIMIZED)
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, userQueries, clearanceTypeQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Get current user from token
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'officer') {
            return errorResponse('Access denied', 403);
        }

        // Get fresh user data
        const user = await userQueries.findById(tokenUser.id);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Get clearance type info and all requests IN PARALLEL
        const [clearanceType, allRequests] = await Promise.all([
            user.assigned_clearance_type
                ? clearanceTypeQueries.findById(user.assigned_clearance_type)
                : null,
            requestQueries.findAll() // Get all requests in ONE query
        ]);

        const assignedTypeName = clearanceType?.display_name || null;
        const assignedTypeFilter = clearanceType?.name || null;

        // Filter requests based on officer's assigned type (client-side filtering is faster than multiple DB queries)
        let filteredRequests = allRequests;

        if (assignedTypeFilter) {
            filteredRequests = allRequests.filter(r => r.type === assignedTypeFilter);

            // For faculty-based officers, also filter by assigned faculty
            if (assignedTypeFilter === 'faculty' && user.assigned_faculty) {
                filteredRequests = filteredRequests.filter(r => r.faculty === user.assigned_faculty);
            }
        }

        // Calculate statistics from filtered data
        const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
        const pendingCount = pendingRequests.length;

        const today = new Date().toDateString();
        const approvedToday = filteredRequests.filter(r => {
            if (r.status !== 'approved' || !r.reviewed_at) return false;
            return new Date(r.reviewed_at).toDateString() === today;
        }).length;

        const totalStudents = filteredRequests.length;

        // Format requests for frontend
        const formattedRequests = filteredRequests.map(req => ({
            id: req.id,
            request_id: req.request_id,
            student_name: req.student_name,
            matric_no: req.matric_no,
            department: req.department,
            faculty: req.faculty,
            type: req.type,
            status: req.status,
            created_at: req.created_at,
        }));

        return successResponse('Dashboard data retrieved', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                assigned_clearance_type: user.assigned_clearance_type,
                assigned_type_name: assignedTypeName,
                assigned_faculty: user.assigned_faculty,
            },
            stats: {
                pending: pendingCount,
                completedToday: approvedToday,
                totalStudents,
                avgResponseTime: '2.4',
            },
            requests: formattedRequests,
        });

    } catch (error) {
        console.error('Officer dashboard error:', error);
        return errorResponse('Failed to load dashboard', 500);
    }
}
