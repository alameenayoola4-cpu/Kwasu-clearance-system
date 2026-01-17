// Forgot Password API - Students Only
import { sql } from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({
                success: false,
                message: 'Email is required'
            }, { status: 400 });
        }

        // Only check users with student role
        const students = await sql`
            SELECT id, name, email FROM users 
            WHERE email = ${email.toLowerCase()} 
            AND role = 'student'
        `;

        // Always return success to prevent email enumeration attacks
        if (students.length === 0) {
            console.log('Password reset requested for non-existent student email:', email);
            return Response.json({
                success: true,
                message: 'If a student account with that email exists, a reset link has been sent.'
            });
        }

        const student = students[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Try to create reset, handle if table doesn't exist
        try {
            await sql`
                INSERT INTO password_resets (email, token, user_type, expires_at, created_at)
                VALUES (${email.toLowerCase()}, ${resetTokenHash}, 'student', ${expiresAt}, NOW())
                ON CONFLICT (email) DO UPDATE SET
                    token = ${resetTokenHash},
                    user_type = 'student',
                    expires_at = ${expiresAt},
                    created_at = NOW()
            `;
        } catch (tableError) {
            // If table doesn't exist, create it first
            if (tableError.code === '42P01') {
                await sql`
                    CREATE TABLE IF NOT EXISTS password_resets (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        token VARCHAR(255) NOT NULL,
                        user_type VARCHAR(20) NOT NULL DEFAULT 'student',
                        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                `;
                // Now insert the token
                await sql`
                    INSERT INTO password_resets (email, token, user_type, expires_at, created_at)
                    VALUES (${email.toLowerCase()}, ${resetTokenHash}, 'student', ${expiresAt}, NOW())
                `;
            } else {
                throw tableError;
            }
        }

        // Create reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Log only in development mode (never expose tokens in production)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Password reset requested for: ${student.name} (${email})`);
            console.log(`[DEV] Reset URL: ${resetUrl}`);
        }

        // TODO: Integrate email service (e.g., Resend, SendGrid)
        // await sendPasswordResetEmail(email, resetUrl, student.name);

        return Response.json({
            success: true,
            message: 'If a student account with that email exists, a reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return Response.json({
            success: false,
            message: 'An error occurred. Please try again.'
        }, { status: 500 });
    }
}
