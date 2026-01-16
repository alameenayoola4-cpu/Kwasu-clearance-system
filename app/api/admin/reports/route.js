// Admin Reports API - Generate and export reports (CSV/PDF support)
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
            const totalStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
            const activeStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'`;

            reportData.students = {
                total: parseInt(totalStudents[0]?.count) || 0,
                active: parseInt(activeStudents[0]?.count) || 0,
            };
        }

        if (reportType === 'summary' || reportType === 'officers') {
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

// Helper function to escape CSV values
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Helper function to format date
function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// POST - Generate exportable report (CSV or PDF)
export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { reportType, format = 'csv' } = body;
        const timestamp = new Date().toISOString().split('T')[0];

        let content = '';
        let filename = '';
        let mimeType = '';

        if (format === 'csv') {
            mimeType = 'text/csv';

            if (reportType === 'clearance') {
                const requests = await sql`
                    SELECT cr.*, u.name as student_name, u.matric_no, ct.display_name as clearance_type_name
                    FROM clearance_requests cr
                    LEFT JOIN users u ON cr.student_id = u.id
                    LEFT JOIN clearance_types ct ON cr.clearance_type_id = ct.id
                    ORDER BY cr.created_at DESC
                    LIMIT 500
                `;

                // CSV Header
                content = 'S/N,Student Name,Matric No,Clearance Type,Status,Submitted Date\n';

                // CSV Rows
                requests.forEach((req, idx) => {
                    content += [
                        idx + 1,
                        escapeCSV(req.student_name || 'N/A'),
                        escapeCSV(req.matric_no || 'N/A'),
                        escapeCSV(req.clearance_type_name || req.type || 'N/A'),
                        escapeCSV(req.status),
                        escapeCSV(formatDate(req.created_at))
                    ].join(',') + '\n';
                });

                filename = `clearance-report-${timestamp}.csv`;

            } else if (reportType === 'officers') {
                const officers = await sql`
                    SELECT u.*, ct.display_name as clearance_type_name,
                           (SELECT COUNT(*) FROM clearance_requests WHERE reviewed_by = u.id) as total_reviews
                    FROM users u
                    LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
                    WHERE u.role = 'officer'
                    ORDER BY u.name ASC
                `;

                content = 'S/N,Officer Name,Email,Department,Assigned Type,Total Reviews,Status\n';

                officers.forEach((officer, idx) => {
                    content += [
                        idx + 1,
                        escapeCSV(officer.name),
                        escapeCSV(officer.email),
                        escapeCSV(officer.department || 'N/A'),
                        escapeCSV(officer.clearance_type_name || 'N/A'),
                        officer.total_reviews || 0,
                        escapeCSV(officer.status)
                    ].join(',') + '\n';
                });

                filename = `officers-report-${timestamp}.csv`;

            } else if (reportType === 'statistics') {
                const studentsResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
                const officersResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer'`;
                const pendingResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'pending'`;
                const approvedResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'approved'`;
                const rejectedResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'rejected'`;

                // Summary statistics in CSV format
                content = 'Metric,Value\n';
                content += `Total Students,${studentsResult[0]?.count || 0}\n`;
                content += `Total Officers,${officersResult[0]?.count || 0}\n`;
                content += `Pending Clearances,${pendingResult[0]?.count || 0}\n`;
                content += `Approved Clearances,${approvedResult[0]?.count || 0}\n`;
                content += `Rejected Clearances,${rejectedResult[0]?.count || 0}\n`;
                content += `Report Generated,${new Date().toLocaleString()}\n`;

                filename = `statistics-report-${timestamp}.csv`;
            }

        } else if (format === 'pdf') {
            // For PDF, we'll return HTML that can be printed to PDF
            mimeType = 'text/html';

            let tableContent = '';
            let title = '';

            if (reportType === 'clearance') {
                title = 'Clearance Requests Report';
                const requests = await sql`
                    SELECT cr.*, u.name as student_name, u.matric_no, ct.display_name as clearance_type_name
                    FROM clearance_requests cr
                    LEFT JOIN users u ON cr.student_id = u.id
                    LEFT JOIN clearance_types ct ON cr.clearance_type_id = ct.id
                    ORDER BY cr.created_at DESC
                    LIMIT 500
                `;

                tableContent = `
                    <table>
                        <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Student Name</th>
                                <th>Matric No</th>
                                <th>Clearance Type</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map((r, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${r.student_name || 'N/A'}</td>
                                    <td>${r.matric_no || 'N/A'}</td>
                                    <td>${r.clearance_type_name || r.type || 'N/A'}</td>
                                    <td class="status-${r.status}">${r.status}</td>
                                    <td>${formatDate(r.created_at)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

            } else if (reportType === 'officers') {
                title = 'Officers Activity Report';
                const officers = await sql`
                    SELECT u.*, ct.display_name as clearance_type_name,
                           (SELECT COUNT(*) FROM clearance_requests WHERE reviewed_by = u.id) as total_reviews
                    FROM users u
                    LEFT JOIN clearance_types ct ON u.assigned_clearance_type = ct.id
                    WHERE u.role = 'officer'
                    ORDER BY u.name ASC
                `;

                tableContent = `
                    <table>
                        <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Officer Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Assigned Type</th>
                                <th>Reviews</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${officers.map((o, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${o.name}</td>
                                    <td>${o.email}</td>
                                    <td>${o.department || 'N/A'}</td>
                                    <td>${o.clearance_type_name || 'N/A'}</td>
                                    <td>${o.total_reviews || 0}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

            } else if (reportType === 'statistics') {
                title = 'Statistics Summary Report';
                const studentsResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
                const officersResult = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'officer'`;
                const pendingResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'pending'`;
                const approvedResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'approved'`;
                const rejectedResult = await sql`SELECT COUNT(*) as count FROM clearance_requests WHERE status = 'rejected'`;

                tableContent = `
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Total Students</td><td>${studentsResult[0]?.count || 0}</td></tr>
                            <tr><td>Total Officers</td><td>${officersResult[0]?.count || 0}</td></tr>
                            <tr><td>Pending Clearances</td><td>${pendingResult[0]?.count || 0}</td></tr>
                            <tr><td>Approved Clearances</td><td>${approvedResult[0]?.count || 0}</td></tr>
                            <tr><td>Rejected Clearances</td><td>${rejectedResult[0]?.count || 0}</td></tr>
                        </tbody>
                    </table>
                `;
            }

            content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KWASU ${title}</title>
    <style>
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e8449;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo { font-size: 24px; font-weight: bold; color: #1e8449; }
        h1 { margin: 10px 0; color: #333; font-size: 22px; }
        .date { color: #666; font-size: 14px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
        }
        th {
            background: #1e8449;
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        .status-approved { color: #16a34a; font-weight: 600; }
        .status-pending { color: #d97706; font-weight: 600; }
        .status-rejected { color: #dc2626; font-weight: 600; }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e8449;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .print-btn:hover { background: #166534; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    <div class="header">
        <div class="logo">KWASU Digital Clearance System</div>
        <h1>${title}</h1>
        <div class="date">Generated on: ${new Date().toLocaleString()}</div>
    </div>
    ${tableContent}
    <div class="footer">
        <p>This is an official report generated from the KWASU Digital Clearance System.</p>
        <p>© ${new Date().getFullYear()} Kwara State University</p>
    </div>
</body>
</html>`;

            filename = `${reportType}-report-${timestamp}.html`;
        }

        return NextResponse.json({
            success: true,
            data: {
                reportType,
                format,
                filename,
                mimeType,
                content
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
