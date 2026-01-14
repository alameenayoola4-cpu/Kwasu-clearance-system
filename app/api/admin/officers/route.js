// POST /api/admin/officers - Create new officer
// GET /api/admin/officers - Get all officers
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { userQueries, officerQueries } from '@/lib/db';
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

        const officers = officerQueries.findAll.all();

        return successResponse('Officers retrieved', {
            officers: officers.map(o => ({
                id: o.id,
                name: o.name,
                email: o.email,
                staff_id: o.staff_id,
                phone: o.phone,
                department: o.department,
                faculty: o.faculty,
                assigned_clearance_type: o.assigned_clearance_type,
                assigned_type_name: o.assigned_type_name,
                assigned_faculty: o.assigned_faculty,
                status: o.status,
                created_at: o.created_at,
            }))
        });

    } catch (error) {
        console.error('Get officers error:', error);
        return errorResponse('Failed to get officers', 500);
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

        // Parse body
        const body = await request.json();
        const { name, email, password, staff_id, phone, department, faculty, assigned_clearance_type, assigned_faculty } = body;

        // Validate required fields
        if (!name || !staff_id || !password) {
            return errorResponse('Name, Staff ID, and Password are required');
        }

        // Check if email already exists
        if (email) {
            const existingEmail = userQueries.findByEmail.get(email);
            if (existingEmail) {
                return errorResponse('An account with this email already exists');
            }
        }

        // Check if staff_id already exists
        const existingStaffId = officerQueries.findByStaffId.get(staff_id);
        if (existingStaffId) {
            return errorResponse('An officer with this Staff ID already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate email from staff_id if not provided
        const officerEmail = email || `${staff_id.toLowerCase().replace(/\s+/g, '')}@kwasu.edu.ng`;

        // Create officer
        const result = officerQueries.create.run({
            email: officerEmail,
            password: hashedPassword,
            name,
            staff_id,
            phone: phone || null,
            department: department || null,
            faculty: faculty || null,
            assigned_clearance_type: assigned_clearance_type || null,
            assigned_faculty: assigned_faculty || null,
        });

        // Get created officer
        const officer = userQueries.findById.get(result.lastInsertRowid);

        return successResponse('Officer created successfully', {
            officer: {
                id: officer.id,
                name: officer.name,
                email: officer.email,
                staff_id: officer.staff_id,
                department: officer.department,
                assigned_clearance_type: officer.assigned_clearance_type,
            },
        });

    } catch (error) {
        console.error('Create officer error:', error);
        return errorResponse('Failed to create officer', 500);
    }
}
