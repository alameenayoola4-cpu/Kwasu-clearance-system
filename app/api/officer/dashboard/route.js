// GET /api/officer/dashboard - Get officer dashboard data
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, userQueries, clearanceTypeQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Get current user
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'officer') {
            return errorResponse('Access denied', 403);
        }

        // Get fresh user data (async)
        const user = await userQueries.findById(tokenUser.id);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Get the clearance type name if officer has one assigned
        let assignedTypeName = null;
        let assignedTypeFilter = null;

        if (user.assigned_clearance_type) {
            const clearanceType = await clearanceTypeQueries.findById(user.assigned_clearance_type);
            if (clearanceType) {
                assignedTypeName = clearanceType.display_name;
                assignedTypeFilter = clearanceType.name; // 'siwes', 'final', 'faculty'
            }
        }

        // Determine which requests this officer can see based on assigned_clearance_type
        let pendingRequests = [];
        let allRequests = [];

        if (!assignedTypeFilter) {
            // No specific type assigned - show all requests
            pendingRequests = await requestQueries.findPending();
            const siwesRequests = await requestQueries.findByType('siwes');
            const finalRequests = await requestQueries.findByType('final');
            const facultyRequests = await requestQueries.findByType('faculty');
            allRequests = [...siwesRequests, ...finalRequests, ...facultyRequests];
        } else {
            // Filter by assigned clearance type
            pendingRequests = await requestQueries.findPendingByType(assignedTypeFilter);
            allRequests = await requestQueries.findByType(assignedTypeFilter);

            // For faculty-based officers, also filter by assigned faculty
            if (assignedTypeFilter === 'faculty' && user.assigned_faculty) {
                allRequests = allRequests.filter(r => r.faculty === user.assigned_faculty);
                pendingRequests = pendingRequests.filter(r => r.faculty === user.assigned_faculty);
            }
        }

        // Calculate statistics
        const pendingCount = pendingRequests.length;
        const approvedToday = allRequests.filter(r => {
            if (r.status !== 'approved' || !r.reviewed_at) return false;
            const today = new Date().toDateString();
            const reviewDate = new Date(r.reviewed_at).toDateString();
            return today === reviewDate;
        }).length;

        const totalStudents = allRequests.length;

        // Format requests for frontend
        const formattedRequests = allRequests.map(req => ({
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
