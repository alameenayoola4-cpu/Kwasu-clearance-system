// GET /api/admin/clearance-types/[id] - Get single clearance type
// PUT /api/admin/clearance-types/[id] - Update clearance type
// DELETE /api/admin/clearance-types/[id] - Deactivate clearance type
import { getCurrentUser } from '@/lib/auth';
import { clearanceTypeQueries, requirementQueries } from '@/lib/db';
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
        const type = clearanceTypeQueries.findById.get(id);

        if (!type) {
            return errorResponse('Clearance type not found', 404);
        }

        const requirements = requirementQueries.findByType.all(id);

        return successResponse('Clearance type retrieved', {
            clearanceType: {
                ...type,
                requirements,
            }
        });

    } catch (error) {
        console.error('Get clearance type error:', error);
        return errorResponse('Failed to get clearance type', 500);
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
        const type = clearanceTypeQueries.findById.get(id);

        if (!type) {
            return errorResponse('Clearance type not found', 404);
        }

        const body = await request.json();
        const { display_name, description, is_faculty_based, requirements } = body;

        // Update clearance type
        clearanceTypeQueries.update.run({
            id: parseInt(id),
            display_name: display_name || type.display_name,
            description: description !== undefined ? description : type.description,
            is_faculty_based: is_faculty_based !== undefined ? (is_faculty_based ? 1 : 0) : type.is_faculty_based,
        });

        // Update requirements if provided
        if (requirements && Array.isArray(requirements)) {
            // Delete existing requirements
            requirementQueries.deleteByType.run(id);

            // Add new requirements
            requirements.forEach((req, index) => {
                requirementQueries.create.run({
                    clearance_type_id: parseInt(id),
                    name: req.name,
                    description: req.description || null,
                    is_required: req.is_required !== false ? 1 : 0,
                    max_size_mb: req.max_size_mb || 10,
                    allowed_formats: req.allowed_formats || 'pdf,jpg,png',
                    sort_order: index,
                });
            });
        }

        // Get updated type with requirements
        const updatedType = clearanceTypeQueries.findById.get(id);
        const updatedRequirements = requirementQueries.findByType.all(id);

        return successResponse('Clearance type updated successfully', {
            clearanceType: {
                ...updatedType,
                requirements: updatedRequirements,
            }
        });

    } catch (error) {
        console.error('Update clearance type error:', error);
        return errorResponse('Failed to update clearance type', 500);
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
        const type = clearanceTypeQueries.findById.get(id);

        if (!type) {
            return errorResponse('Clearance type not found', 404);
        }

        // Deactivate instead of delete (to preserve history)
        clearanceTypeQueries.deactivate.run(id);

        return successResponse('Clearance type deactivated successfully');

    } catch (error) {
        console.error('Deactivate clearance type error:', error);
        return errorResponse('Failed to deactivate clearance type', 500);
    }
}
