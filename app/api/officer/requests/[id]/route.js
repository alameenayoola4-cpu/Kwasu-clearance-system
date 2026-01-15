// GET /api/officer/requests/[id] - Get specific request details
// POST /api/officer/requests/[id]/approve - Approve request
// POST /api/officer/requests/[id]/reject - Reject request
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, documentQueries, userQueries } from '@/lib/db';
import { rejectionSchema, validateBody } from '@/lib/validations';
import { errorResponse, successResponse, formatDate, formatDateTime } from '@/lib/utils';

export async function GET(request, { params }) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'officer') {
            return errorResponse('Access denied', 403);
        }

        const { id } = await params;
        const requestId = parseInt(id);

        // Get request with student info (async)
        const clearanceRequest = await requestQueries.findById(requestId);

        if (!clearanceRequest) {
            return errorResponse('Request not found', 404);
        }

        // Get student info (async)
        const student = await userQueries.findById(clearanceRequest.student_id);

        // Get documents (async)
        const documents = await documentQueries.findByRequest(requestId);

        // Get reviewer info if reviewed (async)
        let reviewer = null;
        if (clearanceRequest.reviewed_by) {
            reviewer = await userQueries.findById(clearanceRequest.reviewed_by);
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
            student: student ? {
                id: student.id,
                name: student.name,
                email: student.email,
                matric_no: student.matric_no,
                department: student.department,
                faculty: student.faculty,
            } : null,
            reviewer: reviewer ? {
                name: reviewer.name,
                department: reviewer.department,
            } : null,
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

export async function POST(request, { params }) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'officer') {
            return errorResponse('Access denied', 403);
        }

        const { id } = await params;
        const requestId = parseInt(id);
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        // Get the request (async)
        const clearanceRequest = await requestQueries.findById(requestId);

        if (!clearanceRequest) {
            return errorResponse('Request not found', 404);
        }

        if (clearanceRequest.status !== 'pending') {
            return errorResponse('This request has already been reviewed', 400);
        }

        if (action === 'approve') {
            // Approve the request (async)
            await requestQueries.approve(tokenUser.id, requestId);

            return successResponse('Request approved successfully');

        } else if (action === 'reject') {
            // Validate rejection reason
            const body = await request.json();
            const validation = validateBody(body, rejectionSchema);

            if (!validation.success) {
                return errorResponse(validation.error);
            }

            const { reason } = validation.data;

            // Reject the request (async)
            await requestQueries.reject(reason, tokenUser.id, requestId);

            return successResponse('Request rejected');

        } else {
            return errorResponse('Invalid action. Use ?action=approve or ?action=reject');
        }

    } catch (error) {
        console.error('Review request error:', error);
        return errorResponse('Failed to process request', 500);
    }
}
