// Database configuration and connection for Neon Postgres
import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const sql = neon(process.env.DATABASE_URL);

// Helper function to run queries
async function query(text, params = []) {
  try {
    const result = await sql(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database schema
async function initializeDatabase() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('student', 'officer', 'admin')) NOT NULL,
        matric_no TEXT UNIQUE,
        staff_id TEXT UNIQUE,
        department TEXT,
        faculty TEXT,
        phone TEXT,
        level INTEGER,
        assigned_clearance_type INTEGER,
        assigned_faculty TEXT,
        clearance_type TEXT CHECK(clearance_type IN ('siwes', 'final', 'both') OR clearance_type IS NULL),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Clearance Types table
    await sql`
      CREATE TABLE IF NOT EXISTS clearance_types (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        is_faculty_based BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        target_level TEXT DEFAULT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Departments table
    await sql`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        faculty TEXT NOT NULL,
        program_duration INTEGER DEFAULT 4 CHECK(program_duration IN (4, 5, 6)),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Document Requirements table
    await sql`
      CREATE TABLE IF NOT EXISTS document_requirements (
        id SERIAL PRIMARY KEY,
        clearance_type_id INTEGER NOT NULL REFERENCES clearance_types(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_required BOOLEAN DEFAULT true,
        max_size_mb INTEGER DEFAULT 10,
        allowed_formats TEXT DEFAULT 'pdf,jpg,png',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Clearance requests table
    await sql`
      CREATE TABLE IF NOT EXISTS clearance_requests (
        id SERIAL PRIMARY KEY,
        request_id TEXT UNIQUE NOT NULL,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        clearance_type_id INTEGER REFERENCES clearance_types(id),
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Documents table
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL REFERENCES clearance_requests(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // System Settings table
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Seed default settings if they don't exist
    const existingSettings = await sql`SELECT COUNT(*) as count FROM system_settings`;
    if (parseInt(existingSettings[0].count) === 0) {
      await sql`INSERT INTO system_settings (key, value) VALUES ('siteName', 'KWASU Digital Clearance System')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('supportEmail', 'support@kwasu.edu.ng')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('allowRegistration', 'true')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('requireEmailVerification', 'false')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('sessionTimeout', '30')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('maintenanceMode', 'false')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('currentSession', '2025/2026')`;
      await sql`INSERT INTO system_settings (key, value) VALUES ('currentSemester', '1')`;
      console.log('Default settings seeded');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// User queries
const userQueries = {
  async create(data) {
    const result = await sql`
      INSERT INTO users (email, password, name, role, matric_no, department, faculty, clearance_type, level)
      VALUES (${data.email}, ${data.password}, ${data.name}, ${data.role}, ${data.matric_no || null}, ${data.department || null}, ${data.faculty || null}, ${data.clearance_type || null}, ${data.level || null})
      RETURNING *
    `;
    return { lastInsertRowid: result[0]?.id, changes: 1 };
  },

  async findByEmail(email) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },

  async findById(id) {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  },

  async findByMatric(matric_no) {
    const result = await sql`SELECT * FROM users WHERE matric_no = ${matric_no}`;
    return result[0] || null;
  },

  async findByRole(role) {
    const result = await sql`SELECT * FROM users WHERE role = ${role}`;
    return result;
  },

  async findOfficers(role) {
    const result = await sql`SELECT * FROM users WHERE role = ${role} ORDER BY created_at DESC`;
    return result;
  },

  async updateStatus(status, id) {
    await sql`UPDATE users SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    return { changes: 1 };
  },

  async update(data) {
    await sql`
      UPDATE users 
      SET name = ${data.name}, department = ${data.department}, faculty = ${data.faculty}, clearance_type = ${data.clearance_type}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.id}
    `;
    return { changes: 1 };
  },

  async count(role) {
    const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = ${role}`;
    return { count: parseInt(result[0].count) };
  },
};

// Clearance request queries
const requestQueries = {
  async create(data) {
    const result = await sql`
      INSERT INTO clearance_requests (request_id, student_id, type)
      VALUES (${data.request_id}, ${data.student_id}, ${data.type})
      RETURNING *
    `;
    return { lastInsertRowid: result[0]?.id, changes: 1 };
  },

  async findById(id) {
    const result = await sql`SELECT * FROM clearance_requests WHERE id = ${id}`;
    return result[0] || null;
  },

  async findByRequestId(requestId) {
    const result = await sql`SELECT * FROM clearance_requests WHERE request_id = ${requestId}`;
    return result[0] || null;
  },

  async findByStudent(studentId) {
    const result = await sql`
      SELECT cr.*, u.name as reviewer_name 
      FROM clearance_requests cr 
      LEFT JOIN users u ON cr.reviewed_by = u.id 
      WHERE cr.student_id = ${studentId}
      ORDER BY cr.created_at DESC
    `;
    return result;
  },

  async findByType(type) {
    const result = await sql`
      SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
      FROM clearance_requests cr
      JOIN users u ON cr.student_id = u.id
      WHERE cr.type = ${type}
      ORDER BY cr.created_at DESC
    `;
    return result;
  },

  async findByTypeAndStatus(type, status) {
    const result = await sql`
      SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
      FROM clearance_requests cr
      JOIN users u ON cr.student_id = u.id
      WHERE cr.type = ${type} AND cr.status = ${status}
      ORDER BY cr.created_at DESC
    `;
    return result;
  },

  async findPending() {
    const result = await sql`
      SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
      FROM clearance_requests cr
      JOIN users u ON cr.student_id = u.id
      WHERE cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `;
    return result;
  },

  async findPendingByType(type) {
    const result = await sql`
      SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
      FROM clearance_requests cr
      JOIN users u ON cr.student_id = u.id
      WHERE cr.status = 'pending' AND cr.type = ${type}
      ORDER BY cr.created_at DESC
    `;
    return result;
  },

  async approve(reviewerId, requestId) {
    await sql`
      UPDATE clearance_requests 
      SET status = 'approved', reviewed_by = ${reviewerId}, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `;
    return { changes: 1 };
  },

  async reject(reason, reviewerId, requestId) {
    await sql`
      UPDATE clearance_requests 
      SET status = 'rejected', rejection_reason = ${reason}, reviewed_by = ${reviewerId}, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `;
    return { changes: 1 };
  },

  async countByStatus(status) {
    const result = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = ${status}`;
    return { count: parseInt(result[0].count) };
  },

  async countByType(type) {
    const result = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE type = ${type}`;
    return { count: parseInt(result[0].count) };
  },

  async countByTypeAndStatus(type, status) {
    const result = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE type = ${type} AND status = ${status}`;
    return { count: parseInt(result[0].count) };
  },

  async existsForStudent(studentId, type, excludeStatus) {
    const result = await sql`SELECT id FROM clearance_requests WHERE student_id = ${studentId} AND type = ${type} AND status != ${excludeStatus}`;
    return result[0] || null;
  },
};

// Document queries
const documentQueries = {
  async create(data) {
    const result = await sql`
      INSERT INTO documents (request_id, name, original_name, file_path, file_type, file_size)
      VALUES (${data.request_id}, ${data.name}, ${data.original_name}, ${data.file_path}, ${data.file_type}, ${data.file_size || null})
      RETURNING *
    `;
    return { lastInsertRowid: result[0]?.id, changes: 1 };
  },

  async findByRequest(requestId) {
    const result = await sql`SELECT * FROM documents WHERE request_id = ${requestId} ORDER BY uploaded_at ASC`;
    return result;
  },

  async findById(id) {
    const result = await sql`SELECT * FROM documents WHERE id = ${id}`;
    return result[0] || null;
  },

  async delete(id) {
    await sql`DELETE FROM documents WHERE id = ${id}`;
    return { changes: 1 };
  },

  async deleteByRequest(requestId) {
    await sql`DELETE FROM documents WHERE request_id = ${requestId}`;
    return { changes: 1 };
  },
};

// Clearance Type queries
const clearanceTypeQueries = {
  async create(data) {
    const result = await sql`
      INSERT INTO clearance_types (name, display_name, description, is_faculty_based, target_level, created_by)
      VALUES (${data.name}, ${data.display_name}, ${data.description || null}, ${data.is_faculty_based || false}, ${data.target_level || null}, ${data.created_by || null})
      RETURNING *
    `;
    return { lastInsertRowid: result[0]?.id, changes: 1 };
  },

  async findAll() {
    const result = await sql`SELECT * FROM clearance_types ORDER BY created_at ASC`;
    return result;
  },

  async findActive() {
    const result = await sql`SELECT * FROM clearance_types WHERE is_active = true ORDER BY created_at ASC`;
    return result;
  },

  async findById(id) {
    const result = await sql`SELECT * FROM clearance_types WHERE id = ${id}`;
    return result[0] || null;
  },

  async findByName(name) {
    const result = await sql`SELECT * FROM clearance_types WHERE name = ${name}`;
    return result[0] || null;
  },

  async update(data) {
    await sql`
      UPDATE clearance_types 
      SET display_name = ${data.display_name}, description = ${data.description}, is_faculty_based = ${data.is_faculty_based}, target_level = ${data.target_level}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.id}
    `;
    return { changes: 1 };
  },

  async deactivate(id) {
    await sql`UPDATE clearance_types SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    return { changes: 1 };
  },

  async activate(id) {
    await sql`UPDATE clearance_types SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    return { changes: 1 };
  },

  async count() {
    const result = await sql`SELECT COUNT(*) as count FROM clearance_types`;
    return { count: parseInt(result[0].count) };
  },
};

// Document Requirements queries
const requirementQueries = {
  async create(data) {
    const result = await sql`
      INSERT INTO document_requirements (clearance_type_id, name, description, is_required, max_size_mb, allowed_formats, sort_order)
      VALUES (${data.clearance_type_id}, ${data.name}, ${data.description || null}, ${data.is_required ?? true}, ${data.max_size_mb || 10}, ${data.allowed_formats || 'pdf,jpg,png'}, ${data.sort_order || 0})
      RETURNING *
    `;
    return { lastInsertRowid: result[0]?.id, changes: 1 };
  },

  async findByType(typeId) {
    const result = await sql`SELECT * FROM document_requirements WHERE clearance_type_id = ${typeId} ORDER BY sort_order ASC`;
    return result;
  },

  async findById(id) {
    const result = await sql`SELECT * FROM document_requirements WHERE id = ${id}`;
    return result[0] || null;
  },

  async update(data) {
    await sql`
      UPDATE document_requirements 
      SET name = ${data.name}, description = ${data.description}, is_required = ${data.is_required}, max_size_mb = ${data.max_size_mb}, allowed_formats = ${data.allowed_formats}, sort_order = ${data.sort_order}
      WHERE id = ${data.id}
    `;
    return { changes: 1 };
  },

  async delete(id) {
    await sql`DELETE FROM document_requirements WHERE id = ${id}`;
    return { changes: 1 };
  },

  async deleteByType(typeId) {
    await sql`DELETE FROM document_requirements WHERE clearance_type_id = ${typeId}`;
    return { changes: 1 };
  },
};

// Officer queries
const officerQueries = {
  async create(data) {
    const result = await sql`
      INSERT INTO users (email, password, name, role, staff_id, department, faculty, phone, assigned_clearance_type, assigned_faculty)
      VALUES (${data.email}, ${data.password}, ${data.name}, 'officer', ${data.staff_id || null}, ${data.department || null}, ${data.faculty || null}, ${data.phone || null}, ${data.assigned_clearance_type || null}, ${data.assigned_faculty || null})
      RETURNING *
    `;
    return { lastInsertRowid: result[0]?.id, changes: 1 };
  },

  async findAll() {
    const result = await sql`
      SELECT u.*, ct.display_name as assigned_type_name 
      FROM users u 
      LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
      WHERE u.role = 'officer' 
      ORDER BY u.created_at DESC
    `;
    return result;
  },

  async findActive() {
    const result = await sql`
      SELECT u.*, ct.display_name as assigned_type_name 
      FROM users u 
      LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
      WHERE u.role = 'officer' AND u.status = 'active'
      ORDER BY u.created_at DESC
    `;
    return result;
  },

  async findByStaffId(staffId) {
    const result = await sql`SELECT * FROM users WHERE staff_id = ${staffId}`;
    return result[0] || null;
  },

  async update(data) {
    await sql`
      UPDATE users 
      SET name = ${data.name}, department = ${data.department}, faculty = ${data.faculty}, phone = ${data.phone}, 
          assigned_clearance_type = ${data.assigned_clearance_type}, assigned_faculty = ${data.assigned_faculty}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.id} AND role = 'officer'
    `;
    return { changes: 1 };
  },

  async deactivate(id) {
    await sql`UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ${id} AND role = 'officer'`;
    return { changes: 1 };
  },

  async activate(id) {
    await sql`UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ${id} AND role = 'officer'`;
    return { changes: 1 };
  },

  async count() {
    const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer'`;
    return { count: parseInt(result[0].count) };
  },

  async countActive() {
    const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer' AND status = 'active'`;
    return { count: parseInt(result[0].count) };
  },
};

// Settings queries
const settingsQueries = {
  async getAll() {
    const result = await sql`SELECT key, value FROM system_settings`;
    return result;
  },

  async get(key) {
    const result = await sql`SELECT value FROM system_settings WHERE key = ${key}`;
    return result[0] || null;
  },

  async set(key, value) {
    await sql`
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
    `;
    return { changes: 1 };
  },
};

export {
  sql,
  query,
  initializeDatabase,
  userQueries,
  requestQueries,
  documentQueries,
  clearanceTypeQueries,
  requirementQueries,
  officerQueries,
  settingsQueries,
};
