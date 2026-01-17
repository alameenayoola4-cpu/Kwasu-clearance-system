//  Officer Bulk Action API - Approve/Reject multiple requests at once
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';
import { sql, auditLogQueries } from '../../../../lib/db';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'officer') {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, requestIds, ids, reason } = body;

        // Support both 'requestIds' and 'ids' for backwards compatibility
        const idsToProcess = requestIds || ids;

        if (!idsToProcess || !Array.isArray(idsToProcess) || idsToProcess.length === 0) {
            return Response.json({ success: false, message: 'No request IDs provided' }, { status: 400 });
        }

        if (!['approve', 'reject'].includes(action)) {
            return Response.json({ success: false, message: 'Invalid action' }, { status: 400 });
        }

        // For rejections, reason is optional in bulk (can be set later)
        const rejectionReason = reason || 'Bulk rejected by officer';

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        let updatedCount = 0;

        // Update each request individually
        for (const id of idsToProcess) {
            try {
                if (action === 'approve') {
                    await sql`
                        UPDATE clearance_requests 
                        SET status = ${newStatus}, 
                            reviewed_by = ${decoded.userId}, 
                            reviewed_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        AND status = 'pending'
                    `;
                } else {
                    await sql`
                        UPDATE clearance_requests 
                        SET status = ${newStatus}, 
                            reviewed_by = ${decoded.userId}, 
                            reviewed_at = CURRENT_TIMESTAMP,
                            rejection_reason = ${rejectionReason}
                        WHERE id = ${id}
                        AND status = 'pending'
                    `;
                }
                updatedCount++;
            } catch (err) {
                console.error(`Error processing request ${id}:`, err);
            }
        }

        // Log the bulk action
        try {
            // Get officer info for audit log
            const officers = await sql`SELECT name, email FROM officers WHERE id = ${decoded.userId}`;
            const officer = officers[0];

            await auditLogQueries.create({
                user_id: decoded.userId,
                user_email: officer?.email || decoded.email,
                action: action === 'approve' ? 'bulk_approve' : 'bulk_reject',
                entity_type: 'clearance',
                entity_id: idsToProcess.join(','),
                details: {
                    count: updatedCount,
                    requestIds: idsToProcess,
                },
            });
        } catch (err) {
            console.error('Failed to log audit:', err);
        }

        return Response.json({
            success: true,
            message: `Successfully ${action}d ${updatedCount} request(s)`,
            data: { count: updatedCount },
        });

    } catch (error) {
        console.error('Bulk action error:', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
