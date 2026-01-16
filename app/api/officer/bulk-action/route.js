//  Officer Bulk Action API - Approve/Reject multiple requests at once
import { cookies } from 'next/headers';
import { verifyAuth } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

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

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        let updatedCount = 0;

        // Update each request individually (neon doesn't support complex array queries the same way)
        for (const id of ids) {
            if (action === 'approve') {
                const result = await sql`
                    UPDATE clearance_requests 
                    SET status = ${newStatus}, 
                        reviewed_by = ${user.id}, 
                        reviewed_at = CURRENT_TIMESTAMP
                    WHERE id = ${id}
                    AND status = 'pending'
                `;
                updatedCount++;
            } else {
                const result = await sql`
                    UPDATE clearance_requests 
                    SET status = ${newStatus}, 
                        reviewed_by = ${user.id}, 
                        reviewed_at = CURRENT_TIMESTAMP,
                        rejection_reason = ${reason}
                    WHERE id = ${id}
                    AND status = 'pending'
                `;
                updatedCount++;
            }
        }

        return Response.json({
            message: `Successfully ${action}d ${updatedCount} request(s)`,
            count: updatedCount,
        });

    } catch (error) {
        console.error('Bulk action error:', error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}

