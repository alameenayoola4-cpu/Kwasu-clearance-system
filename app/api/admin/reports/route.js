// Admin Reports API - Generate and export reports
import { sql } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

// GET - Get report data
export async function GET(request) {
    try {
        // Verify admin authentication
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const reportType = searchParams.get('type') || 'summary';
        const dateRange = searchParams.get('range') || '30days';

        let reportData = {};

        if (reportType === 'summary' || reportType === 'clearance') {
            // Clearance statistics (async)
            const totalRequests = await sql`SELECT COUNT(*) as count FROM clearance_requests`;
            const pendingRequests = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'pending'`;
            const approvedRequests = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'approved'`;
            const rejectedRequests = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'rejected'`;

            reportData.clearance = {
                total: parseInt(totalRequests[0]?.count) || 0,
                pending: parseInt(pendingRequests[0]?.count) || 0,
                approved: parseInt(approvedRequests[0]?.count) || 0,
                rejected: parseInt(rejectedRequests[0]?.count) || 0,
            };
        }

        if (reportType === 'summary' || reportType === 'students') {
            // Student statistics (async)
            const totalStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
            const activeStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'`;

            reportData.students = {
                total: parseInt(totalStudents[0]?.count) || 0,
                active: parseInt(activeStudents[0]?.count) || 0,
            };
        }

        if (reportType === 'summary' || reportType === 'officers') {
            // Officer statistics (async)
            const totalOfficers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer'`;
            const activeOfficers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer' AND status = 'active'`;

            reportData.officers = {
                total: parseInt(totalOfficers[0]?.count) || 0,
                active: parseInt(activeOfficers[0]?.count) || 0,
            };
        }

        return NextResponse.json({
            success: true,
            data: {
                reportType,
                dateRange,
                generatedAt: new Date().toISOString(),
                ...reportData
            }
        });
    } catch (error) {
        console.error('Reports API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Generate exportable report
export async function POST(request) {
    try {
        // Verify admin authentication
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { reportType } = body;

        let reportContent = '';
        const timestamp = new Date().toISOString().split('T')[0];

        if (reportType === 'clearance') {
            // Generate clearance report (async)
            const requests = await sql`
                SELECT cr.*, u.name as student_name, u.matric_no, ct.display_name as clearance_type_name
                FROM clearance_requests cr
                LEFT JOIN users u ON cr.student_id = u.id
                LEFT JOIN clearance_types ct ON cr.clearance_type_id = ct.id
                ORDER BY cr.created_at DESC
                LIMIT 100
            `;

            reportContent = `KWASU Clearance Report - ${timestamp}\n`;
            reportContent += '='.repeat(50) + '\n\n';
            reportContent += `Total Records: ${requests.length}\n\n`;

            requests.forEach((req, idx) => {
                reportContent += `${idx + 1}. ${req.student_name || 'N/A'} (${req.matric_no || 'N/A'})\n`;
                reportContent += `   Type: ${req.clearance_type_name || 'N/A'}\n`;
                reportContent += `   Status: ${req.status}\n`;
                reportContent += `   Submitted: ${req.created_at}\n\n`;
            });

        } else if (reportType === 'officers') {
            // Generate officer activity report (async)
            const officers = await sql`
                SELECT u.*, ct.display_name as clearance_type_name
                FROM users u
                LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
                WHERE u.role = 'officer'
                ORDER BY u.created_at DESC
            `;

            reportContent = `KWASU Officer Activity Report - ${timestamp}\n`;
            reportContent += '='.repeat(50) + '\n\n';
            reportContent += `Total Officers: ${officers.length}\n\n`;

            officers.forEach((officer, idx) => {
                reportContent += `${idx + 1}. ${officer.name}\n`;
                reportContent += `   Email: ${officer.email}\n`;
                reportContent += `   Department: ${officer.department || 'N/A'}\n`;
                reportContent += `   Assigned Type: ${officer.clearance_type_name || 'N/A'}\n`;
                reportContent += `   Status: ${officer.status}\n\n`;
            });

        } else if (reportType === 'statistics') {
            // Generate statistics report (async)
            const studentsResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
            const officersResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer'`;
            const pendingResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'pending'`;
            const approvedResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'approved'`;
            const rejectedResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'rejected'`;

            const stats = {
                students: parseInt(studentsResult[0]?.count) || 0,
                officers: parseInt(officersResult[0]?.count) || 0,
                pending: parseInt(pendingResult[0]?.count) || 0,
                approved: parseInt(approvedResult[0]?.count) || 0,
                rejected: parseInt(rejectedResult[0]?.count) || 0,
            };

            reportContent = `KWASU Monthly Statistics Report - ${timestamp}\n`;
            reportContent += '='.repeat(50) + '\n\n';
            reportContent += `Total Students: ${stats.students}\n`;
            reportContent += `Total Officers: ${stats.officers}\n`;
            reportContent += `Pending Clearances: ${stats.pending}\n`;
            reportContent += `Approved Clearances: ${stats.approved}\n`;
            reportContent += `Rejected Clearances: ${stats.rejected}\n`;
        }

        return NextResponse.json({
            success: true,
            data: {
                reportType,
                filename: `kwasu-${reportType}-report-${timestamp}.txt`,
                content: reportContent
            }
        });
    } catch (error) {
        console.error('Reports POST error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
