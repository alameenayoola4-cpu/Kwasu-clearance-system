// Reset Password API - Validate token and set new password
import { sql } from '../../../../lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { token, email, password, action } = await request.json();

        if (!token || !email) {
            return Response.json({
                success: false,
                message: 'Invalid request'
            }, { status: 400 });
        }

        // Hash the token to compare with stored hash
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find the reset record
        let resets = [];
        try {
            resets = await sql`
                SELECT * FROM password_resets 
                WHERE email = ${email.toLowerCase()} 
                AND token = ${tokenHash}
                AND user_type = 'student'
                AND expires_at > NOW()
            `;
        } catch (tableError) {
            // Table might not exist
            if (tableError.code === '42P01') {
                return Response.json({
                    success: false,
                    message: 'Invalid or expired reset link. Please request a new one.'
                }, { status: 400 });
            }
            throw tableError;
        }

        if (resets.length === 0) {
            return Response.json({
                success: false,
                message: 'Invalid or expired reset link. Please request a new one.'
            }, { status: 400 });
        }

        // If just validating the token
        if (action === 'validate') {
            return Response.json({
                success: true,
                message: 'Token is valid'
            });
        }

        // Reset password action
        if (action === 'reset') {
            if (!password || password.length < 6) {
                return Response.json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                }, { status: 400 });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update user password (using users table with student role)
            await sql`
                UPDATE users 
                SET password = ${hashedPassword}, updated_at = NOW()
                WHERE email = ${email.toLowerCase()}
                AND role = 'student'
            `;

            // Delete the reset token
            await sql`
                DELETE FROM password_resets WHERE email = ${email.toLowerCase()}
            `;

            console.log('Password reset successful for:', email);

            return Response.json({
                success: true,
                message: 'Password has been reset successfully'
            });
        }

        return Response.json({
            success: false,
            message: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('Reset password error:', error);
        return Response.json({
            success: false,
            message: 'An error occurred. Please try again.'
        }, { status: 500 });
    }
}
