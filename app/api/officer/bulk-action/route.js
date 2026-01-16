//  Officer Bulk Action API - Approve/Reject multiple requests at once
import { cookies } from 'next/headers';
import { verifyAuth } from '../../../../lib/auth';
import pool from '../../../../lib/db';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        const user = await verifyAuth(token);
        if (!user || user.role !== 'officer') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { ids, action, reason } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return Response.json({ message: 'No request IDs provided' }, { status: 400 });
        }

        if (!['approve', 'reject'].includes(action)) {
            return Response.json({ message: 'Invalid action' }, { status: 400 });
        }

        if (action === 'reject' && (!reason || reason.trim().length < 5)) {
            return Response.json({ message: 'Rejection reason is required (min 5 characters)' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const newStatus = action === 'approve' ? 'approved' : 'rejected';
            const reviewedAt = new Date().toISOString();

            // Update all requests
            const updateQuery = `
                UPDATE clearance_requests 
                SET status = $1, 
                    reviewed_by = $2, 
                    reviewed_at = $3
                    ${action === 'reject' ? ', rejection_reason = $4' : ''}
                WHERE id = ANY($${action === 'reject' ? '5' : '4'})
                AND status = 'pending'
                RETURNING id
            `;

            const params = action === 'reject'
                ? [newStatus, user.id, reviewedAt, reason, ids]
                : [newStatus, user.id, reviewedAt, ids];

            const result = await client.query(updateQuery, params);

            await client.query('COMMIT');

            return Response.json({
                message: `Successfully ${action}d ${result.rowCount} request(s)`,
                count: result.rowCount,
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Bulk action error:', error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}
