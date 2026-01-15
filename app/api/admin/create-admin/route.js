// GET /api/admin/create-admin - Create default admin user
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Check if admin already exists
        const existingAdmin = await sql`SELECT id FROM users WHERE email = 'admin@kwasu.edu.ng'`;

        if (existingAdmin.length > 0) {
            return successResponse('Admin user already exists. Login with: admin@kwasu.edu.ng / Admin123!', {
                email: 'admin@kwasu.edu.ng',
                password: 'Admin123!'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword('Admin123!');

        // Create admin user
        await sql`
      INSERT INTO users (email, password, name, role, status)
      VALUES ('admin@kwasu.edu.ng', ${hashedPassword}, 'System Administrator', 'admin', 'active')
    `;

        return successResponse('Admin user created successfully!', {
            email: 'admin@kwasu.edu.ng',
            password: 'Admin123!',
            note: 'Change this password after first login!'
        });

    } catch (error) {
        console.error('Create admin error:', error);
        return errorResponse('Failed to create admin: ' + error.message, 500);
    }
}
