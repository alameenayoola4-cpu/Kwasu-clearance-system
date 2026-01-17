// Student Notifications API
import { sql } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'student') {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch notifications for student (status changes on their requests)
        const notifications = await sql`
            SELECT 
                cr.id,
                cr.request_id,
                cr.type,
                cr.status,
                cr.updated_at,
                cr.created_at,
                cr.rejection_reason,
                CASE 
                    WHEN cr.status = 'approved' THEN 'Your ' || UPPER(cr.type) || ' clearance has been approved!'
                    WHEN cr.status = 'rejected' THEN 'Your ' || UPPER(cr.type) || ' clearance was rejected'
                    WHEN cr.status = 'pending' THEN 'Your ' || UPPER(cr.type) || ' clearance is pending review'
                    ELSE 'Status update on your ' || UPPER(cr.type) || ' clearance'
                END as message,
                CASE 
                    WHEN cr.status = 'approved' THEN 'success'
                    WHEN cr.status = 'rejected' THEN 'error'
                    ELSE 'info'
                END as notification_type
            FROM clearance_requests cr
            WHERE cr.student_id = ${decoded.userId}
            ORDER BY cr.updated_at DESC
            LIMIT 10
        `;

        // Generate notification items
        const notificationItems = notifications.map(n => ({
            id: n.id,
            requestId: n.request_id,
            type: n.type,
            message: n.message,
            notificationType: n.notification_type,
            status: n.status,
            reason: n.rejection_reason,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
            read: false, // For now, assume unread (can add read tracking later)
        }));

        // Count unread (for now, recent updates in last 7 days are "unread")
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const unreadCount = notificationItems.filter(n =>
            new Date(n.updatedAt) > sevenDaysAgo
        ).length;

        return Response.json({
            success: true,
            data: {
                notifications: notificationItems,
                unreadCount,
            }
        });

    } catch (error) {
        console.error('Notifications API error:', error);
        return Response.json({
            success: false,
            message: 'Failed to fetch notifications'
        }, { status: 500 });
    }
}
