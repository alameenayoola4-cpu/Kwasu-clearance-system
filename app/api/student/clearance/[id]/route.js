// GET /api/student/clearance/[id] - Get specific clearance request details
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, documentQueries, userQueries } from '@/lib/db';
import { errorResponse, successResponse, formatDate, formatDateTime } from '@/lib/utils';

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

        // Get documents
        const documents = documentQueries.findByRequest.all(requestId);

        // Get reviewer info if reviewed
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

        return successResponse('Request details retrieved', {
            request: {
                id: clearanceRequest.id,
                request_id: clearanceRequest.request_id,
                type: clearanceRequest.type,
                status: clearanceRequest.status,
                rejection_reason: clearanceRequest.rejection_reason,
                created_at: formatDateTime(clearanceRequest.created_at),
                reviewed_at: clearanceRequest.reviewed_at ? formatDateTime(clearanceRequest.reviewed_at) : null,
            },
            reviewer,
            documents: documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                original_name: doc.original_name,
                file_type: doc.file_type,
                file_size: doc.file_size,
                uploaded_at: formatDate(doc.uploaded_at),
            })),
        });

    } catch (error) {
        console.error('Get request error:', error);
        return errorResponse('Failed to get request details', 500);
    }
}
