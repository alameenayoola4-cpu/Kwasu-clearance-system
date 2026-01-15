// GET /api/admin/seed-data - Seed KWASU faculties and departments
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

export async function GET() {
    try {
        let departmentsAdded = 0;

        for (const facultyData of kwasuData) {
            for (const dept of facultyData.departments) {
                // Check if department already exists
                const existing = await sql`SELECT id FROM departments WHERE name = ${dept} AND faculty = ${facultyData.faculty}`;

                if (existing.length === 0) {
                    // Determine program duration (Engineering = 5 years, Medicine/Vet = 6 years, others = 4)
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

        return successResponse(`KWASU data seeded successfully. ${departmentsAdded} departments added.`, {
            faculties: kwasuData.length,
            departmentsAdded
        });

    } catch (error) {
        console.error('Seed error:', error);
        return errorResponse('Failed to seed data: ' + error.message, 500);
    }
}
