// Official KWASU Faculties and Departments Data
// Updated based on user input

export const KWASU_FACULTIES = [
    {
        id: 'ict',
        name: 'Faculty of Information And Communication Technology',
        shortName: 'ICT',
        departments: [
            'Computer Science',
            'Mass Communication',
            'Library And Information Science',
        ]
    },
    {
        id: 'agriculture',
        name: 'Faculty of Agriculture And Veterinary Sciences',
        shortName: 'Agriculture',
        departments: [
            'Agricultural Economics And Extension Services',
            'Animal Production',
            'Fisheries And Aquaculture',
            'Crop Production',
            'Food Science And Technology',
        ]
    },
    {
        id: 'administration',
        name: 'Faculty of Administration',
        shortName: 'Administration',
        departments: [
            'Accounting',
            'Banking And Finance',
            'Business Administration',
            'Public Administration',
        ]
    },
    {
        id: 'arts',
        name: 'Faculty of Arts',
        shortName: 'Arts',
        departments: [
            'Arabic Language And Literature',
            'Christian Studies',
            'English Language',
            'History And International Studies',
            'Islamic Studies',
            'Linguistics',
            'Performing Arts',
        ]
    },
    {
        id: 'education',
        name: 'Faculty of Education',
        shortName: 'Education',
        departments: [
            'Business Education',
            'Early Childhood Education',
            'Human Kinetics And Health Education',
            'Special Education',
            'Educational Management',
            'Science Education',
            'Arts Education',
        ]
    },
    {
        id: 'engineering',
        name: 'Faculty of Engineering',
        shortName: 'Engineering',
        departments: [
            'Agricultural Engineering',
            'Civil Engineering',
            'Electrical And Electronic Engineering',
            'Mechanical Engineering',
            'Material Science Engineering',
        ]
    },
    {
        id: 'science',
        name: 'Faculty of Pure And Applied Sciences',
        shortName: 'Science',
        departments: [
            'Biochemistry',
            'Chemistry',
            'Geology',
            'Industrial Chemistry',
            'Mathematics',
            'Microbiology',
            'Physics',
            'Plant And Environmental Biology',
            'Statistics',
            'Zoology',
        ]
    },
    {
        id: 'social_science',
        name: 'Faculty of Social Science',
        shortName: 'Social Science',
        departments: [
            'Economics',
            'Political Science',
            'Sociology',
            'Geography',
        ]
    },
    {
        id: 'medical',
        name: 'Faculty of Basic Medical Sciences',
        shortName: 'Medical Sciences',
        departments: [
            'Anatomy',
            'Physiology',
            'Medical Biochemistry',
            'Nursing Science',
        ]
    },
    {
        id: 'law',
        name: 'Faculty of Law',
        shortName: 'Law',
        departments: [
            'Private And Property Law',
            'Public Law',
            'Jurisprudence And International Law',
        ]
    },
    {
        id: 'environmental',
        name: 'Faculty of Environmental Sciences',
        shortName: 'Environmental',
        departments: [
            'Architecture',
            'Estate Management',
            'Urban And Regional Planning',
            'Quantity Surveying',
            'Building Technology',
        ]
    }
];

// Flatten all departments for quick access
export const ALL_DEPARTMENTS = KWASU_FACULTIES.flatMap(faculty =>
    faculty.departments.map(dept => dept)
).sort();

// Get faculty by department name
export const getFacultyByDepartment = (departmentName) => {
    return KWASU_FACULTIES.find(faculty =>
        faculty.departments.some(dept =>
            dept.toLowerCase() === departmentName.toLowerCase()
        )
    );
};

// Get all department names as simple array
export const getDepartmentNames = () => ALL_DEPARTMENTS;

// Get faculty names as simple array
export const getFacultyNames = () => KWASU_FACULTIES.map(f => f.name);

// Get short faculty names
export const getFacultyShortNames = () => KWASU_FACULTIES.map(f => f.shortName);

// Get departments grouped by faculty for dropdowns
export const getDepartmentsByFaculty = () => {
    return KWASU_FACULTIES.map(faculty => ({
        faculty: faculty.name,
        shortName: faculty.shortName,
        departments: faculty.departments
    }));
};
