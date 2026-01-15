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

        // Async query
        const types = await clearanceTypeQueries.findAll();

        // Get requirements for each type (async with Promise.all)
        const typesWithRequirements = await Promise.all(types.map(async (type) => {
            const requirements = await requirementQueries.findByType(type.id);
            return {
                id: type.id,
                name: type.name,
                display_name: type.display_name,
                description: type.description,
                is_faculty_based: type.is_faculty_based,
                is_active: type.is_active,
                target_level: type.target_level,
                created_at: type.created_at,
                requirements,
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

        // Check if name already exists (async)
        const existing = await clearanceTypeQueries.findByName(name);
        if (existing) {
            return errorResponse('A clearance type with this name already exists');
        }

        // Create clearance type (async)
        const result = await clearanceTypeQueries.create({
            name: name.toLowerCase().replace(/\s+/g, '-'),
            display_name,
            description: description || null,
            is_faculty_based: is_faculty_based || false,
            target_level: target_level || null,
            created_by: tokenUser.id,
        });

        const typeId = result.lastInsertRowid;

        // Add requirements if provided (async)
        if (requirements && Array.isArray(requirements)) {
            for (let index = 0; index < requirements.length; index++) {
                const req = requirements[index];
                await requirementQueries.create({
                    clearance_type_id: typeId,
                    name: req.name,
                    description: req.description || null,
                    is_required: req.is_required !== false,
                    max_size_mb: req.max_size_mb || 10,
                    allowed_formats: req.allowed_formats || 'pdf,jpg,png',
                    sort_order: index,
                });
            }
        }

        // Get created type with requirements (async)
        const createdType = await clearanceTypeQueries.findById(typeId);
        const createdRequirements = await requirementQueries.findByType(typeId);

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
