// GET /api/admin/init-db - Initialize database schema (admin only)
// This should be run once after deployment to create tables
import { getCurrentUser } from '@/lib/auth';
import { initializeDatabase } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Initialize the database schema
        await initializeDatabase();

        return successResponse('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        return errorResponse('Failed to initialize database: ' + error.message, 500);
    }
}
