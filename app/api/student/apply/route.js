// POST /api/student/apply - Submit clearance application
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, sql } from '@/lib/db';

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (user.role !== 'student') {
            return NextResponse.json({ message: 'Only students can apply for clearance' }, { status: 403 });
        }

        const body = await request.json();
        const { clearance_type, ...details } = body;

        // Validate clearance type
        if (!['siwes', 'final_year', 'faculty'].includes(clearance_type)) {
            return NextResponse.json({ message: 'Invalid clearance type' }, { status: 400 });
        }

        // Check if student already has a pending application of this type (async)
        const existingRequest = await sql`
            SELECT * FROM clearance_requests 
            WHERE student_id = ${user.id} AND type = ${clearance_type} AND status = 'pending'
        `;

        if (existingRequest.length > 0) {
            return NextResponse.json({
                message: 'You already have a pending application for this clearance type'
            }, { status: 400 });
        }

        // Generate request ID (async)
        const year = new Date().getFullYear();
        const countResult = await sql`SELECT COUNT(*) as count FROM clearance_requests`;
        const count = (parseInt(countResult[0]?.count) || 0) + 1;
        const requestId = `CLR-${year}-${String(count).padStart(4, '0')}`;

        // Insert clearance application (async)
        const result = await requestQueries.create({
            request_id: requestId,
            student_id: user.id,
            type: clearance_type,
        });

        return NextResponse.json({
            success: true,
            message: 'Clearance application submitted successfully',
            data: {
                id: result.lastInsertRowid,
                request_id: requestId,
                type: clearance_type,
                status: 'pending'
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Apply clearance error:', error);
        return NextResponse.json({
            message: 'An error occurred while submitting your application'
        }, { status: 500 });
    }
}
