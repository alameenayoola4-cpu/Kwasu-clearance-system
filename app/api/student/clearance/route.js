// POST /api/student/clearance - Submit new clearance request
// GET /api/student/clearance - Get all student's clearance requests
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, userQueries } from '@/lib/db';
import { clearanceRequestSchema, validateBody } from '@/lib/validations';
import { errorResponse, successResponse, generateRequestId } from '@/lib/utils';

export async function POST(request) {
    try {
        // Get current user
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'student') {
            return errorResponse('Only students can submit clearance requests', 403);
        }

        // Parse and validate body
        const body = await request.json();
        const validation = validateBody(body, clearanceRequestSchema);

        if (!validation.success) {
            return errorResponse(validation.error);
        }

        const { type } = validation.data;

        // Check if student already has an active request of this type (async)
        const existingRequest = await requestQueries.existsForStudent(tokenUser.id, type, 'rejected');

        if (existingRequest) {
            return errorResponse(`You already have an active ${type.toUpperCase()} clearance request`);
        }

        // Generate unique request ID
        const requestId = generateRequestId();

        // Create clearance request (async)
        const result = await requestQueries.create({
            request_id: requestId,
            student_id: tokenUser.id,
            type,
        });

        // Get created request (async)
        const newRequest = await requestQueries.findById(result.lastInsertRowid);

        return successResponse('Clearance request submitted successfully', {
            request: {
                id: newRequest.id,
                request_id: newRequest.request_id,
                type: newRequest.type,
                status: newRequest.status,
                created_at: newRequest.created_at,
            },
        });

    } catch (error) {
        console.error('Create clearance error:', error);
        return errorResponse('Failed to submit clearance request', 500);
    }
}

export async function GET() {
    try {
        // Get current user
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'student') {
            return errorResponse('Access denied', 403);
        }

        // Get all student's requests (async)
        const requests = await requestQueries.findByStudent(tokenUser.id);

        return successResponse('Clearance requests retrieved', { requests });

    } catch (error) {
        console.error('Get clearance error:', error);
        return errorResponse('Failed to get clearance requests', 500);
    }
}
