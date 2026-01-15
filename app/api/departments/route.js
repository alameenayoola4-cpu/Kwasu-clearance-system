// GET /api/departments - Get all departments grouped by faculty
import { sql } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const faculty = searchParams.get('faculty');

        let departments;

        if (faculty) {
            // Get departments for a specific faculty
            departments = await sql`
        SELECT id, name, faculty, program_duration 
        FROM departments 
        WHERE faculty = ${faculty} AND is_active = true
        ORDER BY name ASC
      `;
        } else {
            // Get all departments
            departments = await sql`
        SELECT id, name, faculty, program_duration 
        FROM departments 
        WHERE is_active = true
        ORDER BY faculty ASC, name ASC
      `;
        }

        // Group by faculty
        const faculties = {};
        for (const dept of departments) {
            if (!faculties[dept.faculty]) {
                faculties[dept.faculty] = [];
            }
            faculties[dept.faculty].push({
                id: dept.id,
                name: dept.name,
                program_duration: dept.program_duration
            });
        }

        // Convert to array format
        const facultyList = Object.keys(faculties).sort().map(name => ({
            name,
            departments: faculties[name]
        }));

        return successResponse('Departments retrieved', {
            faculties: facultyList,
            totalDepartments: departments.length
        });

    } catch (error) {
        console.error('Departments API error:', error);
        return errorResponse('Failed to get departments', 500);
    }
}
