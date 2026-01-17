// Student Profile API - Update profile and change password
import { sql } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken, hashPassword, verifyPassword } from '../../../../lib/auth';

// GET - Fetch profile data (uses dashboard API, this is just for completeness)
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

        const students = await sql`
            SELECT id, name, email, matric_no, department, faculty, level, phone, address, created_at
            FROM students
            WHERE id = ${decoded.userId}
        `;

        if (students.length === 0) {
            return Response.json({ success: false, message: 'Student not found' }, { status: 404 });
        }

        return Response.json({
            success: true,
            data: { user: students[0] }
        });

    } catch (error) {
        console.error('Profile GET error:', error);
        return Response.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
    }
}

// PUT - Update profile (phone, address)
export async function PUT(request) {
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

        const body = await request.json();
        const { phone, address } = body;

        await sql`
            UPDATE students
            SET 
                phone = ${phone || null},
                address = ${address || null},
                updated_at = NOW()
            WHERE id = ${decoded.userId}
        `;

        return Response.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile PUT error:', error);
        return Response.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
    }
}

// POST - Change password
export async function POST(request) {
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

        const body = await request.json();
        const { action, currentPassword, newPassword } = body;

        if (action !== 'change_password') {
            return Response.json({ success: false, message: 'Invalid action' }, { status: 400 });
        }

        if (!currentPassword || !newPassword) {
            return Response.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return Response.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Get current password hash
        const students = await sql`
            SELECT password FROM students WHERE id = ${decoded.userId}
        `;

        if (students.length === 0) {
            return Response.json({ success: false, message: 'Student not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, students[0].password);
        if (!isValid) {
            return Response.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password and update
        const hashedPassword = await hashPassword(newPassword);

        await sql`
            UPDATE students
            SET password = ${hashedPassword}, updated_at = NOW()
            WHERE id = ${decoded.userId}
        `;

        return Response.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Profile POST error:', error);
        return Response.json({ success: false, message: 'Failed to change password' }, { status: 500 });
    }
}
