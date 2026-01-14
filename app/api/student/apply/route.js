// POST /api/student/apply - Submit clearance application
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, db } from '@/lib/db';

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

        // Check if student already has a pending application of this type
        const existingRequest = db.prepare(`
            SELECT * FROM clearance_requests 
            WHERE student_id = ? AND type = ? AND status = 'pending'
        `).get(user.id, clearance_type);

        if (existingRequest) {
            return NextResponse.json({
                message: 'You already have a pending application for this clearance type'
            }, { status: 400 });
        }

        // Generate request ID
        const year = new Date().getFullYear();
        const countResult = db.prepare('SELECT COUNT(*) as count FROM clearance_requests').get();
        const count = (countResult?.count || 0) + 1;
        const requestId = `CLR-${year}-${String(count).padStart(4, '0')}`;

        // Insert clearance application using named parameters
        const result = requestQueries.create.run({
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
