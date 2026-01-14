// GET /api/clearance-types - Get active clearance types (public)
import { clearanceTypeQueries, requirementQueries } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET() {
    try {
        // Get active clearance types (async)
        const types = await clearanceTypeQueries.findActive();

        // Get requirements for each type (async)
        const typesWithRequirements = await Promise.all(types.map(async (type) => {
            const requirements = await requirementQueries.findByType(type.id);
            return {
                id: type.id,
                name: type.name,
                display_name: type.display_name,
                description: type.description,
                is_faculty_based: type.is_faculty_based,
                target_level: type.target_level,
                requirements: requirements.map(req => ({
                    id: req.id,
                    name: req.name,
                    description: req.description,
                    is_required: req.is_required,
                    max_size_mb: req.max_size_mb,
                    allowed_formats: req.allowed_formats,
                })),
            };
        }));

        return successResponse('Clearance types retrieved', {
            clearanceTypes: typesWithRequirements
        });

    } catch (error) {
        console.error('Get clearance types error:', error);
        return errorResponse('Failed to get clearance types', 500);
    }
}
