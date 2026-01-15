// GET/POST /api/admin/announcements - CRUD for announcements
import { getCurrentUser } from '@/lib/auth';
import { announcementQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        // Allow all authenticated users to view announcements
        const { searchParams } = new URL(request.url);
        const audience = searchParams.get('audience');
        const activeOnly = searchParams.get('active') === 'true';

        let announcements;
        if (activeOnly) {
            announcements = await announcementQueries.findActive(audience || user.role);
        } else if (user.role === 'admin') {
            announcements = await announcementQueries.findAll();
        } else {
            announcements = await announcementQueries.findActive(user.role);
        }

        return successResponse('Announcements retrieved', { announcements });

    } catch (error) {
        console.error('Announcements error:', error);
        return errorResponse('Failed to load announcements', 500);
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        if (user.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const body = await request.json();
        const { title, content, priority, target_audience, is_active, expires_at } = body;

        if (!title || !content) {
            return errorResponse('Title and content are required');
        }

        const announcement = await announcementQueries.create({
            title,
            content,
            priority: priority || 'normal',
            target_audience: target_audience || 'all',
            is_active: is_active !== false,
            expires_at: expires_at || null,
            created_by: user.id,
        });

        return successResponse('Announcement created', { announcement });

    } catch (error) {
        console.error('Create announcement error:', error);
        return errorResponse('Failed to create announcement', 500);
    }
}

export async function PUT(request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const body = await request.json();
        const { id, title, content, priority, target_audience, is_active, expires_at } = body;

        if (!id) {
            return errorResponse('Announcement ID is required');
        }

        await announcementQueries.update(id, {
            title,
            content,
            priority,
            target_audience,
            is_active,
            expires_at,
        });

        return successResponse('Announcement updated');

    } catch (error) {
        console.error('Update announcement error:', error);
        return errorResponse('Failed to update announcement', 500);
    }
}

export async function DELETE(request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return errorResponse('Announcement ID is required');
        }

        await announcementQueries.delete(parseInt(id));

        return successResponse('Announcement deleted');

    } catch (error) {
        console.error('Delete announcement error:', error);
        return errorResponse('Failed to delete announcement', 500);
    }
}
