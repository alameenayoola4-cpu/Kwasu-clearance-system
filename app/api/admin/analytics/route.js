// GET /api/admin/analytics - Get analytics data for admin dashboard
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        if (user.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        // Get clearance counts by type
        const typeStats = await sql`
            SELECT type, COUNT(*) as count 
            FROM clearance_requests 
            GROUP BY type
        `;

        // Get clearance counts by status
        const statusStats = await sql`
            SELECT status, COUNT(*) as count 
            FROM clearance_requests 
            GROUP BY status
        `;

        // Get monthly trends (last 6 months)
        const monthlyTrends = await sql`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'approved') as approved,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE status = 'pending') as pending
            FROM clearance_requests 
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month ASC
        `;

        // Get total counts
        const totalRequests = await sql`SELECT COUNT(*) as count FROM clearance_requests`;
        const totalStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
        const totalOfficers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer'`;

        // Get approval rate
        const approvedCount = statusStats.find(s => s.status === 'approved')?.count || 0;
        const totalCount = parseInt(totalRequests[0]?.count) || 1;
        const approvalRate = ((parseInt(approvedCount) / totalCount) * 100).toFixed(1);

        // Get processing time stats (average days between created_at and reviewed_at)
        const processingStats = await sql`
            SELECT 
                AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 86400) as avg_days
            FROM clearance_requests 
            WHERE reviewed_at IS NOT NULL
        `;

        // Format type distribution for pie chart
        const typeDistribution = {
            siwes: parseInt(typeStats.find(t => t.type === 'siwes')?.count) || 0,
            final: parseInt(typeStats.find(t => t.type === 'final')?.count) || 0,
            faculty: parseInt(typeStats.find(t => t.type === 'faculty')?.count) || 0,
        };

        // Format status distribution
        const statusDistribution = {
            pending: parseInt(statusStats.find(s => s.status === 'pending')?.count) || 0,
            approved: parseInt(statusStats.find(s => s.status === 'approved')?.count) || 0,
            rejected: parseInt(statusStats.find(s => s.status === 'rejected')?.count) || 0,
        };

        // Format monthly data for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthly = monthlyTrends.map(m => {
            const [year, month] = m.month.split('-');
            return {
                month: monthNames[parseInt(month) - 1],
                year: year,
                total: parseInt(m.total),
                approved: parseInt(m.approved),
                rejected: parseInt(m.rejected),
                pending: parseInt(m.pending),
            };
        });

        return successResponse('Analytics data retrieved', {
            overview: {
                totalRequests: parseInt(totalRequests[0]?.count) || 0,
                totalStudents: parseInt(totalStudents[0]?.count) || 0,
                totalOfficers: parseInt(totalOfficers[0]?.count) || 0,
                approvalRate: parseFloat(approvalRate),
                avgProcessingDays: parseFloat(processingStats[0]?.avg_days || 0).toFixed(1),
            },
            typeDistribution,
            statusDistribution,
            monthlyTrends: formattedMonthly,
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return errorResponse('Failed to load analytics', 500);
    }
}
