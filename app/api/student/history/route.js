// GET /api/student/history - Get student's clearance history
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requestQueries } from '@/lib/db';

export async function GET(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (user.role !== 'student') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        // Get all clearance requests for this student using existing query
        const requests = requestQueries.findByStudent.all(user.id);

        return NextResponse.json({
            success: true,
            data: requests.map(r => ({
                id: r.id,
                clearance_id: r.request_id,
                type: r.type,
                status: r.status,
                rejection_reason: r.rejection_reason,
                created_at: r.created_at,
                updated_at: r.updated_at,
            }))
        });

    } catch (error) {
        console.error('History fetch error:', error);
        return NextResponse.json({
            message: 'An error occurred while fetching history'
        }, { status: 500 });
    }
}
