// Database configuration and connection
const Database = require('better-sqlite3');
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

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
function initializeDatabase() {
  // Users table (updated with staff_id for officers)
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

  // Add new columns if they don't exist (for existing databases)
  try { db.exec('ALTER TABLE users ADD COLUMN staff_id TEXT UNIQUE'); } catch (e) { }
  try { db.exec('ALTER TABLE users ADD COLUMN phone TEXT'); } catch (e) { }
  try { db.exec('ALTER TABLE users ADD COLUMN assigned_clearance_type INTEGER'); } catch (e) { }
  try { db.exec('ALTER TABLE users ADD COLUMN assigned_faculty TEXT'); } catch (e) { }

  // Clearance Types table (admin-configurable)
  db.exec(`
    CREATE TABLE IF NOT EXISTS clearance_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      is_faculty_based BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      target_level TEXT DEFAULT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Add target_level column if it doesn't exist
  try { db.exec('ALTER TABLE clearance_types ADD COLUMN target_level TEXT DEFAULT NULL'); } catch (e) { }

  // Add level column to users for students
  try { db.exec('ALTER TABLE users ADD COLUMN level INTEGER'); } catch (e) { }

  // Departments table with program duration
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      faculty TEXT NOT NULL,
      program_duration INTEGER DEFAULT 4 CHECK(program_duration IN (4, 5, 6)),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Document Requirements table (per clearance type)
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

  // Clearance requests table (updated type to reference clearance_types)
  db.exec(`
    CREATE TABLE IF NOT EXISTS clearance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      clearance_type_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id),
      FOREIGN KEY (clearance_type_id) REFERENCES clearance_types(id)
    )
  `);

  // Add clearance_type_id column if it doesn't exist
  try { db.exec('ALTER TABLE clearance_requests ADD COLUMN clearance_type_id INTEGER'); } catch (e) { }

  // Documents table
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

  // Create indexes for performance (base indexes)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_matric ON users(matric_no);
    CREATE INDEX IF NOT EXISTS idx_requests_student ON clearance_requests(student_id);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON clearance_requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_type ON clearance_requests(type);
    CREATE INDEX IF NOT EXISTS idx_documents_request ON documents(request_id);
  `);

  // Create new indexes (may fail if columns don't exist yet in old databases)
  try { db.exec('CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id)'); } catch (e) { }
  try { db.exec('CREATE INDEX IF NOT EXISTS idx_clearance_types_name ON clearance_types(name)'); } catch (e) { }
  try { db.exec('CREATE INDEX IF NOT EXISTS idx_doc_requirements_type ON document_requirements(clearance_type_id)'); } catch (e) { }

  // System Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default settings if they don't exist
  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
  if (existingSettings.count === 0) {
    const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');
    insertSetting.run('siteName', 'KWASU Digital Clearance System');
    insertSetting.run('supportEmail', 'support@kwasu.edu.ng');
    insertSetting.run('allowRegistration', 'true');
    insertSetting.run('requireEmailVerification', 'false');
    insertSetting.run('sessionTimeout', '30');
    insertSetting.run('maintenanceMode', 'false');
    insertSetting.run('currentSession', '2025/2026');
    insertSetting.run('currentSemester', '1');
    console.log('Default settings seeded');
  }

  // Add session settings if they don't exist (for existing databases)
  try {
    const sessionExists = db.prepare("SELECT value FROM system_settings WHERE key = 'currentSession'").get();
    if (!sessionExists) {
      db.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?)").run('currentSession', '2025/2026');
      db.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?)").run('currentSemester', '1');
    }
  } catch (e) { }

  // Default clearance types seeding removed - admin should create all clearance types
  // with appropriate target_level for level-based filtering

  console.log('Database initialized successfully');
}

// Initialize on first import
initializeDatabase();

// User queries
const userQueries = {
  create: db.prepare(`
    INSERT INTO users (email, password, name, role, matric_no, department, faculty, clearance_type)
    VALUES (@email, @password, @name, @role, @matric_no, @department, @faculty, @clearance_type)
  `),

  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),

  findById: db.prepare('SELECT * FROM users WHERE id = ?'),

  findByMatric: db.prepare('SELECT * FROM users WHERE matric_no = ?'),

  findByRole: db.prepare('SELECT * FROM users WHERE role = ?'),

  findOfficers: db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC'),

  updateStatus: db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),

  update: db.prepare(`
    UPDATE users 
    SET name = @name, department = @department, faculty = @faculty, clearance_type = @clearance_type, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),

  count: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?'),
};

// Clearance request queries
const requestQueries = {
  create: db.prepare(`
    INSERT INTO clearance_requests (request_id, student_id, type)
    VALUES (@request_id, @student_id, @type)
  `),

  findById: db.prepare('SELECT * FROM clearance_requests WHERE id = ?'),

  findByRequestId: db.prepare('SELECT * FROM clearance_requests WHERE request_id = ?'),

  findByStudent: db.prepare(`
    SELECT cr.*, u.name as reviewer_name 
    FROM clearance_requests cr 
    LEFT JOIN users u ON cr.reviewed_by = u.id 
    WHERE cr.student_id = ? 
    ORDER BY cr.created_at DESC
  `),

  findByType: db.prepare(`
    SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
    FROM clearance_requests cr
    JOIN users u ON cr.student_id = u.id
    WHERE cr.type = ?
    ORDER BY cr.created_at DESC
  `),

  findByTypeAndStatus: db.prepare(`
    SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
    FROM clearance_requests cr
    JOIN users u ON cr.student_id = u.id
    WHERE cr.type = ? AND cr.status = ?
    ORDER BY cr.created_at DESC
  `),

  findPending: db.prepare(`
    SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
    FROM clearance_requests cr
    JOIN users u ON cr.student_id = u.id
    WHERE cr.status = 'pending'
    ORDER BY cr.created_at DESC
  `),

  findPendingByType: db.prepare(`
    SELECT cr.*, u.name as student_name, u.matric_no, u.department, u.faculty
    FROM clearance_requests cr
    JOIN users u ON cr.student_id = u.id
    WHERE cr.status = 'pending' AND cr.type = ?
    ORDER BY cr.created_at DESC
  `),

  approve: db.prepare(`
    UPDATE clearance_requests 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  reject: db.prepare(`
    UPDATE clearance_requests 
    SET status = 'rejected', rejection_reason = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  countByStatus: db.prepare('SELECT COUNT(*) as count FROM clearance_requests WHERE status = ?'),

  countByType: db.prepare('SELECT COUNT(*) as count FROM clearance_requests WHERE type = ?'),

  countByTypeAndStatus: db.prepare('SELECT COUNT(*) as count FROM clearance_requests WHERE type = ? AND status = ?'),

  existsForStudent: db.prepare('SELECT id FROM clearance_requests WHERE student_id = ? AND type = ? AND status != ?'),
};

// Document queries
const documentQueries = {
  create: db.prepare(`
    INSERT INTO documents (request_id, name, original_name, file_path, file_type, file_size)
    VALUES (@request_id, @name, @original_name, @file_path, @file_type, @file_size)
  `),

  findByRequest: db.prepare('SELECT * FROM documents WHERE request_id = ? ORDER BY uploaded_at ASC'),

  findById: db.prepare('SELECT * FROM documents WHERE id = ?'),

  delete: db.prepare('DELETE FROM documents WHERE id = ?'),

  deleteByRequest: db.prepare('DELETE FROM documents WHERE request_id = ?'),
};

// Clearance Type queries
const clearanceTypeQueries = {
  create: db.prepare(`
    INSERT INTO clearance_types (name, display_name, description, is_faculty_based, target_level, created_by)
    VALUES (@name, @display_name, @description, @is_faculty_based, @target_level, @created_by)
  `),

  findAll: db.prepare('SELECT * FROM clearance_types ORDER BY created_at ASC'),

  findActive: db.prepare('SELECT * FROM clearance_types WHERE is_active = 1 ORDER BY created_at ASC'),

  findById: db.prepare('SELECT * FROM clearance_types WHERE id = ?'),

  findByName: db.prepare('SELECT * FROM clearance_types WHERE name = ?'),

  update: db.prepare(`
    UPDATE clearance_types 
    SET display_name = @display_name, description = @description, is_faculty_based = @is_faculty_based, target_level = @target_level, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),

  deactivate: db.prepare('UPDATE clearance_types SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),

  activate: db.prepare('UPDATE clearance_types SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),

  count: db.prepare('SELECT COUNT(*) as count FROM clearance_types'),
};

// Document Requirements queries
const requirementQueries = {
  create: db.prepare(`
    INSERT INTO document_requirements (clearance_type_id, name, description, is_required, max_size_mb, allowed_formats, sort_order)
    VALUES (@clearance_type_id, @name, @description, @is_required, @max_size_mb, @allowed_formats, @sort_order)
  `),

  findByType: db.prepare('SELECT * FROM document_requirements WHERE clearance_type_id = ? ORDER BY sort_order ASC'),

  findById: db.prepare('SELECT * FROM document_requirements WHERE id = ?'),

  update: db.prepare(`
    UPDATE document_requirements 
    SET name = @name, description = @description, is_required = @is_required, max_size_mb = @max_size_mb, allowed_formats = @allowed_formats, sort_order = @sort_order
    WHERE id = @id
  `),

  delete: db.prepare('DELETE FROM document_requirements WHERE id = ?'),

  deleteByType: db.prepare('DELETE FROM document_requirements WHERE clearance_type_id = ?'),
};

// Officer queries (for admin)
const officerQueries = {
  create: db.prepare(`
    INSERT INTO users (email, password, name, role, staff_id, department, faculty, phone, assigned_clearance_type, assigned_faculty)
    VALUES (@email, @password, @name, 'officer', @staff_id, @department, @faculty, @phone, @assigned_clearance_type, @assigned_faculty)
  `),

  findAll: db.prepare(`
    SELECT u.*, ct.display_name as assigned_type_name 
    FROM users u 
    LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
    WHERE u.role = 'officer' 
    ORDER BY u.created_at DESC
  `),

  findActive: db.prepare(`
    SELECT u.*, ct.display_name as assigned_type_name 
    FROM users u 
    LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
    WHERE u.role = 'officer' AND u.status = 'active'
    ORDER BY u.created_at DESC
  `),

  findByStaffId: db.prepare('SELECT * FROM users WHERE staff_id = ?'),

  update: db.prepare(`
    UPDATE users 
    SET name = @name, department = @department, faculty = @faculty, phone = @phone, 
        assigned_clearance_type = @assigned_clearance_type, assigned_faculty = @assigned_faculty, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id AND role = 'officer'
  `),

  deactivate: db.prepare("UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'officer'"),

  activate: db.prepare("UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'officer'"),

  count: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'officer'"),

  countActive: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'officer' AND status = 'active'"),
};

// Settings queries
const settingsQueries = {
  getAll: db.prepare('SELECT key, value FROM system_settings'),

  get: db.prepare('SELECT value FROM system_settings WHERE key = ?'),

  set: db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'),
};

module.exports = {
  db,
  userQueries,
  requestQueries,
  documentQueries,
  clearanceTypeQueries,
  requirementQueries,
  officerQueries,
  settingsQueries,
};

