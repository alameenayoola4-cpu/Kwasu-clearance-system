// GET /api/student/certificate/[id] - Get clearance certificate data
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, userQueries } from '@/lib/db';
import { errorResponse, successResponse, formatDate } from '@/lib/utils';

export async function GET(request, { params }) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'student') {
            return errorResponse('Access denied', 403);
        }

        const { id } = await params;
        const requestId = parseInt(id);

        // Get the clearance request
        const clearanceRequest = requestQueries.findById.get(requestId);

        if (!clearanceRequest) {
            return errorResponse('Request not found', 404);
        }

        // Verify ownership
        if (clearanceRequest.student_id !== tokenUser.id) {
            return errorResponse('Access denied', 403);
        }

        // Check if approved
        if (clearanceRequest.status !== 'approved') {
            return errorResponse('Certificate only available for approved clearances', 400);
        }

        // Get student info
        const student = userQueries.findById.get(tokenUser.id);

        // Get reviewer info
        let reviewer = null;
        if (clearanceRequest.reviewed_by) {
            const reviewerData = userQueries.findById.get(clearanceRequest.reviewed_by);
            if (reviewerData) {
                reviewer = {
                    name: reviewerData.name,
                    department: reviewerData.department,
                };
            }
        }

        // Generate certificate number
        const certificateNumber = `KWASU/${clearanceRequest.type.toUpperCase()}/${new Date().getFullYear()}/${String(clearanceRequest.id).padStart(5, '0')}`;

        return successResponse('Certificate data retrieved', {
            certificate: {
                number: certificateNumber,
                type: clearanceRequest.type,
                issued_date: formatDate(clearanceRequest.reviewed_at || new Date().toISOString()),
                request_id: clearanceRequest.request_id,
            },
            student: {
                name: student.name,
                matric_no: student.matric_no,
                department: student.department,
                faculty: student.faculty,
            },
            reviewer,
        });

    } catch (error) {
        console.error('Get certificate error:', error);
        return errorResponse('Failed to get certificate', 500);
    }
}
