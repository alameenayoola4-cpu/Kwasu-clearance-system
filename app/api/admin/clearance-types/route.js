// GET /api/admin/clearance-types - Get all clearance types
// POST /api/admin/clearance-types - Create new clearance type
import { getCurrentUser } from '@/lib/auth';
import { clearanceTypeQueries, requirementQueries } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const types = clearanceTypeQueries.findAll.all();

        // Get requirements for each type
        const typesWithRequirements = types.map(type => ({
            id: type.id,
            name: type.name,
            display_name: type.display_name,
            description: type.description,
            is_faculty_based: type.is_faculty_based,
            is_active: type.is_active,
            target_level: type.target_level,
            created_at: type.created_at,
            requirements: requirementQueries.findByType.all(type.id),
        }));

        return successResponse('Clearance types retrieved', {
            clearanceTypes: typesWithRequirements
        });

    } catch (error) {
        console.error('Get clearance types error:', error);
        return errorResponse('Failed to get clearance types', 500);
    }
}

export async function POST(request) {
    try {
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'admin') {
            return errorResponse('Access denied', 403);
        }

        const body = await request.json();
        const { name, display_name, description, is_faculty_based, target_level, requirements } = body;

        // Validate required fields
        if (!name || !display_name) {
            return errorResponse('Name and Display Name are required');
        }

        if (!target_level) {
            return errorResponse('Target Student Level is required');
        }

        // Check if name already exists
        const existing = clearanceTypeQueries.findByName.get(name);
        if (existing) {
            return errorResponse('A clearance type with this name already exists');
        }

        // Create clearance type
        const result = clearanceTypeQueries.create.run({
            name: name.toLowerCase().replace(/\s+/g, '-'),
            display_name,
            description: description || null,
            is_faculty_based: is_faculty_based ? 1 : 0,
            target_level: target_level || null,
            created_by: tokenUser.id,
        });

        const typeId = result.lastInsertRowid;

        // Add requirements if provided
        if (requirements && Array.isArray(requirements)) {
            requirements.forEach((req, index) => {
                requirementQueries.create.run({
                    clearance_type_id: typeId,
                    name: req.name,
                    description: req.description || null,
                    is_required: req.is_required !== false ? 1 : 0,
                    max_size_mb: req.max_size_mb || 10,
                    allowed_formats: req.allowed_formats || 'pdf,jpg,png',
                    sort_order: index,
                });
            });
        }

        // Get created type with requirements
        const createdType = clearanceTypeQueries.findById.get(typeId);
        const createdRequirements = requirementQueries.findByType.all(typeId);

        return successResponse('Clearance type created successfully', {
            clearanceType: {
                ...createdType,
                requirements: createdRequirements,
            },
        });

    } catch (error) {
        console.error('Create clearance type error:', error);
        return errorResponse('Failed to create clearance type', 500);
    }
}
