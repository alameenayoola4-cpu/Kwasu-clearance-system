// GET /api/admin/audit-logs - Get audit log entries
// POST /api/admin/audit-logs - Create audit log entry
import { getCurrentUser } from '@/lib/auth';
import { auditLogQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        if (user.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 100;
        const offset = parseInt(searchParams.get('offset')) || 0;
        const action = searchParams.get('action');

        let logs;
        if (action) {
            logs = await auditLogQueries.findByAction(action, limit);
        } else {
            logs = await auditLogQueries.findAll(limit, offset);
        }

        const totalCount = await auditLogQueries.count();

        return successResponse('Audit logs retrieved', {
            logs,
            pagination: {
                total: totalCount,
                limit,
                offset,
            },
        });

    } catch (error) {
        console.error('Audit logs error:', error);
        return errorResponse('Failed to load audit logs', 500);
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        // Allow admins and officers to create audit logs
        if (!['admin', 'officer'].includes(user.role)) {
            return errorResponse('Access denied', 403);
        }

        const body = await request.json();
        const { action, entity_type, entity_id, details } = body;

        if (!action) {
            return errorResponse('Action is required');
        }

        // Get IP address from headers
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

        const log = await auditLogQueries.create({
            user_id: user.id,
            user_email: user.email,
            action,
            entity_type,
            entity_id,
            details,
            ip_address: ip,
        });

        return successResponse('Audit log created', { log });

    } catch (error) {
        console.error('Create audit log error:', error);
        return errorResponse('Failed to create audit log', 500);
    }
}
