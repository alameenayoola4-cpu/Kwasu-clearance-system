// Admin Students API - Get all students
import { db } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Verify admin authentication
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all students
        const students = db.prepare(`
            SELECT id, email, name, matric_no, department, faculty, clearance_type, status, created_at
            FROM users 
            WHERE role = 'student'
            ORDER BY created_at DESC
        `).all();

        return NextResponse.json({
            success: true,
            data: { students }
        });
    } catch (error) {
        console.error('Students API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
