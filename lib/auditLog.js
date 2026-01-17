// Audit Log Helper - Tracks all admin/officer actions
import { sql } from './db';

/**
 * Log an action to the audit_logs table
 * @param {Object} params - Logging parameters
 * @param {string} params.action - Action type (approve, reject, create, update, delete, login, logout)
 * @param {string} params.actorType - 'admin' or 'officer'
 * @param {number} params.actorId - ID of the user performing the action
 * @param {string} params.actorName - Name of the user (for display)
 * @param {string} params.targetType - Type of entity affected (clearance, student, officer, etc.)
 * @param {number|string} params.targetId - ID of the affected entity
 * @param {string} params.targetName - Name/identifier of target (optional)
 * @param {Object} params.details - Additional JSON details (optional)
 * @param {string} params.ipAddress - IP address of the request (optional)
 */
export async function logAudit({
    action,
    actorType,
    actorId,
    actorName = null,
    targetType,
    targetId = null,
    targetName = null,
    details = null,
    ipAddress = null,
}) {
    try {
        await sql`
            INSERT INTO audit_logs (
                action,
                actor_type,
                actor_id,
                actor_name,
                target_type,
                target_id,
                target_name,
                details,
                ip_address,
                created_at
            ) VALUES (
                ${action},
                ${actorType},
                ${actorId},
                ${actorName},
                ${targetType},
                ${targetId?.toString() || null},
                ${targetName},
                ${details ? JSON.stringify(details) : null},
                ${ipAddress},
                NOW()
            )
        `;
        return true;
    } catch (error) {
        console.error('Audit log error:', error);
        // Don't throw - audit logging should not break the main operation
        return false;
    }
}

// Action type constants for consistency
export const AUDIT_ACTIONS = {
    // Clearance actions
    APPROVE: 'approve',
    REJECT: 'reject',
    BULK_APPROVE: 'bulk_approve',
    BULK_REJECT: 'bulk_reject',

    // User management
    CREATE_OFFICER: 'create_officer',
    UPDATE_OFFICER: 'update_officer',
    DELETE_OFFICER: 'delete_officer',
    CREATE_STUDENT: 'create_student',
    UPDATE_STUDENT: 'update_student',
    DELETE_STUDENT: 'delete_student',

    // Clearance types
    CREATE_CLEARANCE_TYPE: 'create_clearance_type',
    UPDATE_CLEARANCE_TYPE: 'update_clearance_type',
    DELETE_CLEARANCE_TYPE: 'delete_clearance_type',

    // Auth actions
    LOGIN: 'login',
    LOGOUT: 'logout',
    PASSWORD_RESET: 'password_reset',

    // System actions
    SYSTEM_SETTING: 'system_setting',
    EXPORT_DATA: 'export_data',
};

export const TARGET_TYPES = {
    CLEARANCE: 'clearance',
    STUDENT: 'student',
    OFFICER: 'officer',
    ADMIN: 'admin',
    CLEARANCE_TYPE: 'clearance_type',
    SYSTEM: 'system',
};
