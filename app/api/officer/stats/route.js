// Officer Stats API - Get officer's personal performance stats
import { cookies } from 'next/headers';
import { verifyAuth } from '../../../../lib/auth';
import { sql } from '../../../../lib/db';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        const user = await verifyAuth(token);
        if (!user || user.role !== 'officer') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get total requests handled by this officer
        const totalHandled = await sql`
            SELECT COUNT(*) as count 
            FROM clearance_requests 
            WHERE reviewed_by = ${user.id}
        `;

        // Get approved count
        const approvedCount = await sql`
            SELECT COUNT(*) as count 
            FROM clearance_requests 
            WHERE reviewed_by = ${user.id} AND status = 'approved'
        `;

        // Get rejected count
        const rejectedCount = await sql`
            SELECT COUNT(*) as count 
            FROM clearance_requests 
            WHERE reviewed_by = ${user.id} AND status = 'rejected'
        `;

        // Get today's count
        const todayCount = await sql`
            SELECT COUNT(*) as count 
            FROM clearance_requests 
            WHERE reviewed_by = ${user.id} 
            AND reviewed_at::date = CURRENT_DATE
        `;

        // Get this week's count
        const weekCount = await sql`
            SELECT COUNT(*) as count 
            FROM clearance_requests 
            WHERE reviewed_by = ${user.id} 
            AND reviewed_at >= CURRENT_DATE - INTERVAL '7 days'
        `;

        // Get average response time (in days)
        const avgResponseTime = await sql`
            SELECT COALESCE(
                AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 86400),
                0
            ) as avg_days
            FROM clearance_requests
            WHERE reviewed_by = ${user.id}
            AND reviewed_at IS NOT NULL
        `;

        // Get weekly breakdown for chart (last 4 weeks)
        const weeklyData = await sql`
            SELECT 
                DATE_TRUNC('week', reviewed_at) as week,
                COUNT(*) as count
            FROM clearance_requests
            WHERE reviewed_by = ${user.id}
            AND reviewed_at >= CURRENT_DATE - INTERVAL '28 days'
            GROUP BY DATE_TRUNC('week', reviewed_at)
            ORDER BY week
        `;

        return Response.json({
            success: true,
            data: {
                totalHandled: parseInt(totalHandled[0]?.count) || 0,
                approved: parseInt(approvedCount[0]?.count) || 0,
                rejected: parseInt(rejectedCount[0]?.count) || 0,
                today: parseInt(todayCount[0]?.count) || 0,
                thisWeek: parseInt(weekCount[0]?.count) || 0,
                avgResponseTime: parseFloat(avgResponseTime[0]?.avg_days).toFixed(1) || '0',
                weeklyTrend: weeklyData.map(w => ({
                    week: w.week,
                    count: parseInt(w.count)
                })),
                approvalRate: totalHandled[0]?.count > 0
                    ? ((approvedCount[0]?.count / totalHandled[0]?.count) * 100).toFixed(0)
                    : 0
            }
        });

    } catch (error) {
        console.error('Officer stats error:', error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}
