// Database seeding script for demo data
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'kwasu.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Hash password synchronously for seeding
const SALT_ROUNDS = 12;

async function seed() {
    console.log('🌱 Starting database seed...\n');

    // Create tables if they don't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'officer', 'admin')) NOT NULL,
      matric_no TEXT UNIQUE,
      staff_id TEXT UNIQUE,
      department TEXT,
      faculty TEXT,
      phone TEXT,
      assigned_clearance_type INTEGER,
      assigned_faculty TEXT,
      clearance_type TEXT CHECK(clearance_type IN ('siwes', 'final', 'both') OR clearance_type IS NULL),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS clearance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('siwes', 'final')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES clearance_requests(id) ON DELETE CASCADE
    )
  `);

    // Clearance Types table
    db.exec(`
    CREATE TABLE IF NOT EXISTS clearance_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      is_faculty_based BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

    // Document Requirements table
    db.exec(`
    CREATE TABLE IF NOT EXISTS document_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clearance_type_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_required BOOLEAN DEFAULT 1,
      max_size_mb INTEGER DEFAULT 10,
      allowed_formats TEXT DEFAULT 'pdf,jpg,png',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clearance_type_id) REFERENCES clearance_types(id) ON DELETE CASCADE
    )
  `);

    // Create indexes
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_matric ON users(matric_no);
    CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id);
    CREATE INDEX IF NOT EXISTS idx_requests_student ON clearance_requests(student_id);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON clearance_requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_type ON clearance_requests(type);
    CREATE INDEX IF NOT EXISTS idx_documents_request ON documents(request_id);
    CREATE INDEX IF NOT EXISTS idx_clearance_types_name ON clearance_types(name);
    CREATE INDEX IF NOT EXISTS idx_doc_requirements_type ON document_requirements(clearance_type_id);
  `);

    // Hash the demo password
    const demoPassword = await bcrypt.hash('Demo@123', SALT_ROUNDS);

    // Prepare statements
    const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, name, role, matric_no, staff_id, department, faculty, phone, clearance_type)
    VALUES (@email, @password, @name, @role, @matric_no, @staff_id, @department, @faculty, @phone, @clearance_type)
  `);

    const insertRequest = db.prepare(`
    INSERT OR IGNORE INTO clearance_requests (request_id, student_id, type, status, rejection_reason, reviewed_by, reviewed_at)
    VALUES (@request_id, @student_id, @type, @status, @rejection_reason, @reviewed_by, @reviewed_at)
  `);

    // ============================================
    // SEED ADMIN USERS
    // ============================================
    console.log('👤 Creating admin users...');

    insertUser.run({
        email: 'admin@kwasu.edu.ng',
        password: demoPassword,
        name: 'System Administrator',
        role: 'admin',
        matric_no: null,
        staff_id: 'KWASU/ADM/001',
        department: 'ICT Directorate',
        faculty: 'Administration',
        phone: '08012345678',
        clearance_type: null,
    });

    // ============================================
    // SEED CLEARANCE OFFICERS
    // ============================================
    console.log('👮 Creating clearance officers...');

    insertUser.run({
        email: 'siwes.officer@kwasu.edu.ng',
        password: demoPassword,
        name: 'Dr. Adebayo Ogunlesi',
        role: 'officer',
        matric_no: null,
        staff_id: 'KWASU/SIWES/001',
        department: 'SIWES Unit',
        faculty: 'Student Affairs',
        phone: '08023456789',
        clearance_type: 'siwes',
    });

    insertUser.run({
        email: 'final.officer@kwasu.edu.ng',
        password: demoPassword,
        name: 'Mrs. Ngozi Okoro',
        role: 'officer',
        matric_no: null,
        staff_id: 'KWASU/REG/002',
        department: 'Registry',
        faculty: 'Academic Affairs',
        phone: '08034567890',
        clearance_type: 'final',
    });

    insertUser.run({
        email: 'officer@kwasu.edu.ng',
        password: demoPassword,
        name: 'Dr. Aminu Bello',
        role: 'officer',
        matric_no: null,
        staff_id: 'KWASU/BUR/003',
        department: 'Bursary',
        faculty: 'Finance',
        phone: '08045678901',
        clearance_type: 'both',
    });

    // ============================================
    // SEED STUDENTS
    // ============================================
    console.log('🎓 Creating student accounts...');

    const students = [
        {
            email: 'student@kwasu.edu.ng',
            name: 'Oluwaseun Adeyemi',
            matric_no: 'U2019/CSC/001',
            department: 'Computer Science',
            faculty: 'Physical Sciences',
        },
        {
            email: 'chibuike.okafor@kwasu.edu.ng',
            name: 'Chibuike Samuel Okafor',
            matric_no: 'U2019/CSC/042',
            department: 'Computer Science',
            faculty: 'Physical Sciences',
        },
        {
            email: 'john.doe@kwasu.edu.ng',
            name: 'John Doe',
            matric_no: 'U2020/ENG/024',
            department: 'Mechanical Engineering',
            faculty: 'Engineering',
        },
        {
            email: 'jane.smith@kwasu.edu.ng',
            name: 'Jane Smith',
            matric_no: 'U2019/MED/015',
            department: 'Medicine',
            faculty: 'Health Sciences',
        },
        {
            email: 'musa.adamu@kwasu.edu.ng',
            name: 'Musa Adamu',
            matric_no: 'U2020/LAW/033',
            department: 'Law',
            faculty: 'Law',
        },
    ];

    for (const student of students) {
        insertUser.run({
            ...student,
            password: demoPassword,
            role: 'student',
            staff_id: null,
            phone: null,
            clearance_type: null,
        });
    }

    // ============================================
    // SEED CLEARANCE REQUESTS
    // ============================================
    console.log('📋 Creating sample clearance requests...');

    // Get student IDs
    const getStudentId = db.prepare('SELECT id FROM users WHERE email = ?');
    const getOfficerId = db.prepare('SELECT id FROM users WHERE email = ?');

    const student1 = getStudentId.get('student@kwasu.edu.ng');
    const student2 = getStudentId.get('chibuike.okafor@kwasu.edu.ng');
    const student3 = getStudentId.get('john.doe@kwasu.edu.ng');
    const student4 = getStudentId.get('jane.smith@kwasu.edu.ng');
    const student5 = getStudentId.get('musa.adamu@kwasu.edu.ng');

    const siwesOfficer = getOfficerId.get('siwes.officer@kwasu.edu.ng');
    const finalOfficer = getOfficerId.get('final.officer@kwasu.edu.ng');

    if (student1 && student2 && student3 && student4 && student5) {
        // Pending SIWES request
        insertRequest.run({
            request_id: 'CLR-2024-0001',
            student_id: student1.id,
            type: 'siwes',
            status: 'pending',
            rejection_reason: null,
            reviewed_by: null,
            reviewed_at: null,
        });

        // Approved Final clearance
        insertRequest.run({
            request_id: 'CLR-2024-0002',
            student_id: student1.id,
            type: 'final',
            status: 'approved',
            rejection_reason: null,
            reviewed_by: finalOfficer?.id || null,
            reviewed_at: new Date().toISOString(),
        });

        // Pending request from another student
        insertRequest.run({
            request_id: 'CLR-2024-0003',
            student_id: student2.id,
            type: 'siwes',
            status: 'pending',
            rejection_reason: null,
            reviewed_by: null,
            reviewed_at: null,
        });

        // Rejected request
        insertRequest.run({
            request_id: 'CLR-2024-0004',
            student_id: student3.id,
            type: 'final',
            status: 'rejected',
            rejection_reason: 'The uploaded "Proof of Payment" document is blurry and the transaction ID is not legible. Please re-scan and re-upload.',
            reviewed_by: finalOfficer?.id || null,
            reviewed_at: new Date().toISOString(),
        });

        // More pending requests
        insertRequest.run({
            request_id: 'CLR-2024-0005',
            student_id: student4.id,
            type: 'siwes',
            status: 'pending',
            rejection_reason: null,
            reviewed_by: null,
            reviewed_at: null,
        });

        insertRequest.run({
            request_id: 'CLR-2024-0006',
            student_id: student5.id,
            type: 'final',
            status: 'pending',
            rejection_reason: null,
            reviewed_by: null,
            reviewed_at: null,
        });
    }

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📝 Demo Accounts:');
    console.log('─'.repeat(50));
    console.log('| Role     | Email                      | Password  |');
    console.log('─'.repeat(50));
    console.log('| Admin    | admin@kwasu.edu.ng         | Demo@123  |');
    console.log('| Officer  | siwes.officer@kwasu.edu.ng | Demo@123  |');
    console.log('| Officer  | final.officer@kwasu.edu.ng | Demo@123  |');
    console.log('| Officer  | officer@kwasu.edu.ng       | Demo@123  |');
    console.log('| Student  | student@kwasu.edu.ng       | Demo@123  |');
    console.log('─'.repeat(50));
    console.log('\n');
}

seed().catch(console.error);
