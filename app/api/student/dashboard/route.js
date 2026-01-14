// GET /api/student/dashboard - Get student dashboard data
import { getCurrentUser } from '@/lib/auth';
import { requestQueries, userQueries, clearanceTypeQueries, settingsQueries, db } from '@/lib/db';
import { errorResponse, successResponse, formatDate, timeAgo } from '@/lib/utils';

// Helper to get department's program duration
function getDepartmentDuration(department) {
    try {
        const dept = db.prepare('SELECT program_duration FROM departments WHERE name = ?').get(department);
        return dept?.program_duration || 4; // Default to 4-year if not found
    } catch (e) {
        return 4;
    }
}

// Check if student level matches clearance target level
function levelMatches(studentLevel, targetLevel, programDuration) {
    if (!targetLevel) return true; // No restriction
    if (targetLevel === 'final') {
        const finalYear = programDuration * 100; // 4-year = 400, 5-year = 500
        return parseInt(studentLevel) === finalYear;
    }
    return parseInt(studentLevel) === parseInt(targetLevel);
}

// Get setting value helper
function getSetting(key, defaultValue = null) {
    try {
        const result = settingsQueries.get.get(key);
        return result?.value || defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

export async function GET() {
    try {
        // Get current user
        const tokenUser = await getCurrentUser();

        if (!tokenUser) {
            return errorResponse('Not authenticated', 401);
        }

        if (tokenUser.role !== 'student') {
            return errorResponse('Access denied', 403);
        }

        // Get fresh user data
        const user = userQueries.findById.get(tokenUser.id);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        // Get student's level and department duration
        const studentLevel = user.level || 100;
        const programDuration = getDepartmentDuration(user.department);

        // Get active clearance types the student is eligible for
        const allTypes = clearanceTypeQueries.findActive.all();
        const eligibleTypes = allTypes.filter(type =>
            levelMatches(studentLevel, type.target_level, programDuration)
        );

        // Get student's clearance requests
        const requests = requestQueries.findByStudent.all(user.id);

        // Format requests for frontend
        const formattedRequests = requests.map(req => ({
            id: req.id,
            request_id: req.request_id,
            type: req.type,
            status: req.status,
            rejection_reason: req.rejection_reason,
            reviewer_name: req.reviewer_name,
            reviewed_at: req.reviewed_at ? formatDate(req.reviewed_at) : null,
            created_at: formatDate(req.created_at),
            time_ago: timeAgo(req.created_at),
        }));

        // Match requests to clearance types
        const siwesRequest = formattedRequests.find(r => r.type === 'siwes');
        const finalRequest = formattedRequests.find(r => r.type === 'final' || r.type === 'final-year');

        // Calculate progress
        let completedCount = 0;
        const totalClearances = eligibleTypes.length || 2;
        if (siwesRequest?.status === 'approved') completedCount++;
        if (finalRequest?.status === 'approved') completedCount++;

        const progress = Math.round((completedCount / totalClearances) * 100);

        // Build recent updates from requests
        const recentUpdates = formattedRequests
            .filter(r => r.status !== 'pending')
            .slice(0, 5)
            .map(r => ({
                id: r.id,
                title: r.status === 'approved'
                    ? `${r.type.toUpperCase()} Clearance Approved`
                    : `${r.type.toUpperCase()} Clearance Rejected`,
                description: r.status === 'approved'
                    ? `Your ${r.type} clearance was approved${r.reviewer_name ? ` by ${r.reviewer_name}` : ''}`
                    : r.rejection_reason,
                type: r.status,
                time: r.time_ago,
            }));

        // Get session settings
        const currentSession = getSetting('currentSession', '2025/2026');
        const currentSemester = getSetting('currentSemester', '1');

        return successResponse('Dashboard data retrieved', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                matric_no: user.matric_no,
                department: user.department,
                faculty: user.faculty,
                level: studentLevel,
            },
            session: {
                academic: currentSession,
                semester: currentSemester,
            },
            requests: formattedRequests,
            eligibleClearanceTypes: eligibleTypes,
            siwes: siwesRequest || null,
            final: finalRequest || null,
            progress,
            recentUpdates,
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        return errorResponse('Failed to load dashboard', 500);
    }
}

