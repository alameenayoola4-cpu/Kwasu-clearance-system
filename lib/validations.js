// Validation schemas using Zod
const { z } = require('zod');

// Email validation for KWASU domain (flexible for testing)
const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required');

// Password validation schema
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

// Simple password for login (less strict)
const loginPasswordSchema = z.string().min(1, 'Password is required');

// Matric number validation (KWASU format: U2019/CSC/001 or similar)
const matricNoSchema = z.string()
    .min(5, 'Invalid matric number')
    .max(20, 'Invalid matric number')
    .regex(/^[A-Z0-9\/\-]+$/i, 'Invalid matric number format');

// Registration schema for students
const studentRegistrationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    matric_no: matricNoSchema,
    department: z.string().min(2, 'Department is required'),
    faculty: z.string().min(2, 'Faculty is required'),
    level: z.number().int().min(100).max(600).optional(),
});

// Login schema
const loginSchema = z.object({
    email: emailSchema,
    password: loginPasswordSchema,
    role: z.enum(['student', 'officer', 'admin'], {
        errorMap: () => ({ message: 'Invalid role selected' })
    }),
});

// Officer creation schema (admin use)
const officerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: emailSchema,
    password: passwordSchema,
    department: z.string().min(2, 'Department is required'),
    clearance_type: z.enum(['siwes', 'final', 'both'], {
        errorMap: () => ({ message: 'Invalid clearance type' })
    }),
});

// Clearance request schema
const clearanceRequestSchema = z.object({
    type: z.enum(['siwes', 'final'], {
        errorMap: () => ({ message: 'Invalid clearance type' })
    }),
});

// Rejection schema
const rejectionSchema = z.object({
    reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(1000, 'Rejection reason is too long'),
});

// File validation constants
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @returns {object} - { valid: boolean, message: string }
 */
function validateFile(file) {
    if (!file) {
        return { valid: false, message: 'No file provided' };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return { valid: false, message: 'Invalid file type. Only PDF, JPG, and PNG are allowed' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, message: 'File size exceeds 10MB limit' };
    }

    return { valid: true, message: 'File is valid' };
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    // Remove path separators and special characters
    return filename
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\.\./g, '')
        .trim();
}

/**
 * Validate and parse request body with schema
 * @param {object} data - Request body
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {object} - { success: boolean, data?: object, error?: string }
 */
function validateBody(data, schema) {
    try {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }

        // Get first error message
        const firstError = result.error.errors[0];
        return { success: false, error: firstError.message };
    } catch (error) {
        return { success: false, error: 'Validation failed' };
    }
}

module.exports = {
    studentRegistrationSchema,
    loginSchema,
    officerSchema,
    clearanceRequestSchema,
    rejectionSchema,
    validateFile,
    sanitizeFilename,
    validateBody,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
};
