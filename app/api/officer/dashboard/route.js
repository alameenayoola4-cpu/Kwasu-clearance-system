// GET /api/officer/dashboard - Get officer dashboard data
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

        if (tokenUser.role !== 'officer') {
            return errorResponse('Access denied', 403);
        }

        // Get fresh user data
        const user = userQueries.findById.get(tokenUser.id);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Determine which requests this officer can see based on clearance_type
        let pendingRequests = [];
        let allRequests = [];

        if (user.clearance_type === 'both') {
            // Can see all requests
            pendingRequests = requestQueries.findPending.all();
            allRequests = [...requestQueries.findByType.all('siwes'), ...requestQueries.findByType.all('final')];
        } else if (user.clearance_type === 'siwes') {
            pendingRequests = requestQueries.findPendingByType.all('siwes');
            allRequests = requestQueries.findByType.all('siwes');
        } else if (user.clearance_type === 'final') {
            pendingRequests = requestQueries.findPendingByType.all('final');
            allRequests = requestQueries.findByType.all('final');
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
                clearance_type: user.clearance_type,
            },
            stats: {
                pending: pendingCount,
                completedToday: approvedToday,
                totalStudents,
                avgResponseTime: '2.4', // Static for now
            },
            requests: formattedRequests,
        });

    } catch (error) {
        console.error('Officer dashboard error:', error);
        return errorResponse('Failed to load dashboard', 500);
    }
}
