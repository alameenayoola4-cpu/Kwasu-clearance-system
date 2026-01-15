// GET /api/admin/seed-data - Seed KWASU faculties, departments, and clearance types
import { sql } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

// KWASU Faculties and Departments
const kwasuData = [
    {
        faculty: 'Agriculture',
        departments: ['Agricultural Economics', 'Agricultural Extension', 'Agronomy', 'Animal Production', 'Crop Production', 'Soil Science']
    },
    {
        faculty: 'Arts',
        departments: ['Arabic', 'Christian Religious Studies', 'English', 'French', 'History', 'Islamic Studies', 'Linguistics', 'Performing Arts', 'Philosophy']
    },
    {
        faculty: 'Communication and Information Sciences',
        departments: ['Computer Science', 'Information and Communication Science', 'Library and Information Science', 'Mass Communication', 'Telecommunication Science']
    },
    {
        faculty: 'Education',
        departments: ['Adult and Primary Education', 'Counsellor Education', 'Educational Management', 'Educational Technology', 'Health Education', 'Human Kinetics', 'Science Education', 'Social Sciences Education']
    },
    {
        faculty: 'Engineering and Technology',
        departments: ['Agricultural and Biosystems Engineering', 'Biomedical Engineering', 'Chemical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical Engineering', 'Food Engineering', 'Materials and Metallurgical Engineering', 'Mechanical Engineering', 'Water Resources and Environmental Engineering']
    },
    {
        faculty: 'Law',
        departments: ['Common Law', 'Islamic Law', 'Jurisprudence and International Law', 'Private and Business Law', 'Public Law']
    },
    {
        faculty: 'Life Sciences',
        departments: ['Biochemistry', 'Microbiology', 'Optometry', 'Plant Biology', 'Zoology']
    },
    {
        faculty: 'Management Sciences',
        departments: ['Accounting', 'Actuarial Science', 'Business Administration', 'Finance', 'Insurance', 'Marketing']
    },
    {
        faculty: 'Physical Sciences',
        departments: ['Chemistry', 'Geology', 'Mathematics', 'Physics', 'Statistics']
    },
    {
        faculty: 'Social Sciences',
        departments: ['Economics', 'Geography', 'Political Science', 'Psychology', 'Sociology']
    },
    {
        faculty: 'Veterinary Medicine',
        departments: ['Veterinary Anatomy', 'Veterinary Medicine', 'Veterinary Microbiology', 'Veterinary Parasitology', 'Veterinary Pathology', 'Veterinary Pharmacology', 'Veterinary Physiology', 'Veterinary Public Health', 'Veterinary Surgery']
    }
];

// Default Clearance Types
const clearanceTypes = [
    {
        name: 'siwes',
        display_name: 'SIWES Clearance',
        description: 'Student Industrial Work Experience Scheme clearance for 300-level students',
        is_faculty_based: false,
        target_level: '300'
    },
    {
        name: 'final',
        display_name: 'Final Year Clearance',
        description: 'Graduation clearance for final year students',
        is_faculty_based: false,
        target_level: 'final'
    }
];

export async function GET() {
    try {
        let departmentsAdded = 0;
        let clearanceTypesAdded = 0;

        // Seed Clearance Types
        for (const type of clearanceTypes) {
            const existing = await sql`SELECT id FROM clearance_types WHERE name = ${type.name}`;

            if (existing.length === 0) {
                await sql`
                    INSERT INTO clearance_types (name, display_name, description, is_faculty_based, target_level, is_active)
                    VALUES (${type.name}, ${type.display_name}, ${type.description}, ${type.is_faculty_based}, ${type.target_level}, true)
                `;
                clearanceTypesAdded++;
            }
        }

        // Seed Departments
        for (const facultyData of kwasuData) {
            for (const dept of facultyData.departments) {
                const existing = await sql`SELECT id FROM departments WHERE name = ${dept} AND faculty = ${facultyData.faculty}`;

                if (existing.length === 0) {
                    let duration = 4;
                    if (facultyData.faculty === 'Engineering and Technology') duration = 5;
                    if (facultyData.faculty === 'Veterinary Medicine') duration = 6;

                    await sql`
                        INSERT INTO departments (name, faculty, program_duration, is_active)
                        VALUES (${dept}, ${facultyData.faculty}, ${duration}, true)
                    `;
                    departmentsAdded++;
                }
            }
        }

        return successResponse(`KWASU data seeded successfully!`, {
            faculties: kwasuData.length,
            departmentsAdded,
            clearanceTypesAdded
        });

    } catch (error) {
        console.error('Seed error:', error);
        return errorResponse('Failed to seed data: ' + error.message, 500);
    }
}
