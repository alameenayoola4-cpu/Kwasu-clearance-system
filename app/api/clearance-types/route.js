// GET /api/clearance-types - Get active clearance types (public)
import { clearanceTypeQueries, requirementQueries } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET() {
    try {
        const types = clearanceTypeQueries.findActive.all();

        // Get requirements for each type
        const typesWithRequirements = types.map(type => ({
            id: type.id,
            name: type.name,
            display_name: type.display_name,
            description: type.description,
            is_faculty_based: type.is_faculty_based,
            requirements: requirementQueries.findByType.all(type.id).map(req => ({
                id: req.id,
                name: req.name,
                description: req.description,
                is_required: req.is_required,
                max_size_mb: req.max_size_mb,
                allowed_formats: req.allowed_formats,
            })),
        }));

        return successResponse('Clearance types retrieved', {
            clearanceTypes: typesWithRequirements
        });

    } catch (error) {
        console.error('Get clearance types error:', error);
        return errorResponse('Failed to get clearance types', 500);
    }
}
