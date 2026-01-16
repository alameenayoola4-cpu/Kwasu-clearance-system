// Officer Export API - Export handled requests as CSV or PDF summary
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

        const { format, fromDate, toDate } = await request.json();

        // Build date filter
        let dateFilter = '';
        const params = [user.id];

        if (fromDate) {
            dateFilter += ` AND cr.reviewed_at >= '${fromDate}'`;
        }
        if (toDate) {
            dateFilter += ` AND cr.reviewed_at <= '${toDate}'::date + INTERVAL '1 day'`;
        }

        // Get handled requests
        const requests = await sql`
            SELECT 
                cr.request_id,
                cr.type,
                cr.status,
                cr.reviewed_at,
                cr.rejection_reason,
                u.name as student_name,
                u.matric_no,
                u.department
            FROM clearance_requests cr
            JOIN users u ON cr.student_id = u.id
            WHERE cr.reviewed_by = ${user.id}
            ${fromDate ? sql`AND cr.reviewed_at >= ${fromDate}::date` : sql``}
            ${toDate ? sql`AND cr.reviewed_at <= ${toDate}::date + INTERVAL '1 day'` : sql``}
            ORDER BY cr.reviewed_at DESC
        `;

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Request ID', 'Student Name', 'Matric No', 'Department', 'Type', 'Status', 'Reviewed At', 'Rejection Reason'];
            const rows = requests.map(r => [
                r.request_id,
                r.student_name,
                r.matric_no,
                r.department,
                r.type,
                r.status,
                r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : '',
                r.rejection_reason || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="officer_report_${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        } else {
            // Return JSON for PDF generation (client-side)
            const approved = requests.filter(r => r.status === 'approved').length;
            const rejected = requests.filter(r => r.status === 'rejected').length;

            return Response.json({
                success: true,
                data: {
                    officer: {
                        name: user.name,
                        department: user.department
                    },
                    summary: {
                        total: requests.length,
                        approved,
                        rejected,
                        approvalRate: requests.length > 0 ? ((approved / requests.length) * 100).toFixed(0) : 0
                    },
                    requests: requests.map(r => ({
                        requestId: r.request_id,
                        studentName: r.student_name,
                        matricNo: r.matric_no,
                        department: r.department,
                        type: r.type,
                        status: r.status,
                        reviewedAt: r.reviewed_at,
                        rejectionReason: r.rejection_reason
                    })),
                    generatedAt: new Date().toISOString()
                }
            });
        }

    } catch (error) {
        console.error('Officer export error:', error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}
