// GET /api/admin/officers/[id] - Get single officer
// PUT /api/admin/officers/[id] - Update officer
// DELETE /api/admin/officers/[id] - Deactivate officer
import { getCurrentUser } from '@/lib/auth';
import { userQueries, officerQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request, { params }) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const { id } = await params;
        const officer = await userQueries.findById(id);

        if (!officer || officer.role !== 'officer') {
            return errorResponse('Officer not found', 404);
        }

        return successResponse('Officer retrieved', {
            officer: {
                id: officer.id,
                name: officer.name,
                email: officer.email,
                staff_id: officer.staff_id,
                phone: officer.phone,
                department: officer.department,
                faculty: officer.faculty,
                assigned_clearance_type: officer.assigned_clearance_type,
                assigned_faculty: officer.assigned_faculty,
                status: officer.status,
                created_at: officer.created_at,
            }
        });

    } catch (error) {
        console.error('Get officer error:', error);
        return errorResponse('Failed to get officer', 500);
    }
}

export async function PUT(request, { params }) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const { id } = await params;
        const officer = await userQueries.findById(id);

        if (!officer || officer.role !== 'officer') {
            return errorResponse('Officer not found', 404);
        }

        const body = await request.json();
        const { name, email, phone, department, faculty, assigned_clearance_type, assigned_faculty, status } = body;

        // Update officer (async)
        await officerQueries.update({
            id: parseInt(id),
            name: name || officer.name,
            email: email || officer.email,
            phone: phone !== undefined ? phone : officer.phone,
            department: department !== undefined ? department : officer.department,
            faculty: faculty !== undefined ? faculty : officer.faculty,
            assigned_clearance_type: assigned_clearance_type !== undefined ? assigned_clearance_type : officer.assigned_clearance_type,
            assigned_faculty: assigned_faculty !== undefined ? assigned_faculty : officer.assigned_faculty,
        });

        // Handle status change separately (async)
        if (status === 'active') {
            await officerQueries.activate(id);
        } else if (status === 'inactive') {
            await officerQueries.deactivate(id);
        }

        const updatedOfficer = await userQueries.findById(id);

        return successResponse('Officer updated successfully', {
            officer: {
                id: updatedOfficer.id,
                name: updatedOfficer.name,
                email: updatedOfficer.email,
                staff_id: updatedOfficer.staff_id,
                phone: updatedOfficer.phone,
                department: updatedOfficer.department,
                faculty: updatedOfficer.faculty,
                assigned_clearance_type: updatedOfficer.assigned_clearance_type,
                assigned_faculty: updatedOfficer.assigned_faculty,
                status: updatedOfficer.status,
            }
        });

    } catch (error) {
        console.error('Update officer error:', error);
        return errorResponse('Failed to update officer', 500);
    }
}

export async function DELETE(request, { params }) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const { id } = await params;
        const officer = await userQueries.findById(id);

        if (!officer || officer.role !== 'officer') {
            return errorResponse('Officer not found', 404);
        }

        // Deactivate instead of delete (async)
        await officerQueries.deactivate(id);

        return successResponse('Officer deactivated successfully');

    } catch (error) {
        console.error('Deactivate officer error:', error);
        return errorResponse('Failed to deactivate officer', 500);
    }
}
