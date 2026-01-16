// GET /api/departments - Get all departments grouped by faculty
import { sql } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';
import { KWASU_FACULTIES } from '@/lib/kwasuData';

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

        // If database is empty, use KWASU_FACULTIES from lib/kwasuData.js
        if (departments.length === 0) {
            // Use the static data from kwasuData.js
            const facultyList = KWASU_FACULTIES.map(f => ({
                name: f.name,
                shortName: f.shortName,
                departments: f.departments.map(d => ({ name: d }))
            }));

            return successResponse('Departments retrieved (from static data)', {
                faculties: facultyList,
                totalDepartments: KWASU_FACULTIES.reduce((sum, f) => sum + f.departments.length, 0)
            });
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

        // Fallback to static data on error
        const facultyList = KWASU_FACULTIES.map(f => ({
            name: f.name,
            shortName: f.shortName,
            departments: f.departments.map(d => ({ name: d }))
        }));

        return successResponse('Departments retrieved (fallback)', {
            faculties: facultyList,
            totalDepartments: KWASU_FACULTIES.reduce((sum, f) => sum + f.departments.length, 0)
        });
    }
}

