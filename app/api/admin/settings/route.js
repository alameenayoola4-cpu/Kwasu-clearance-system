// Admin Settings API - Get and update system settings
import { settingsQueries } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

// GET - Retrieve all settings
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

        // Get all settings (async)
        const settingsRows = await settingsQueries.getAll();

        // Convert to object format
        const settings = {};
        settingsRows.forEach(row => {
            // Parse boolean and number values
            if (row.value === 'true') {
                settings[row.key] = true;
            } else if (row.value === 'false') {
                settings[row.key] = false;
            } else if (!isNaN(row.value) && row.value !== '') {
                settings[row.key] = parseInt(row.value, 10);
            } else {
                settings[row.key] = row.value;
            }
        });

        return NextResponse.json({
            success: true,
            data: { settings }
        });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update settings
export async function PUT(request) {
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
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json(
                { success: false, message: 'Invalid settings data' },
                { status: 400 }
            );
        }

        // Update each setting (async)
        for (const [key, value] of Object.entries(settings)) {
            // Convert values to strings for storage
            const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
            await settingsQueries.set(key, stringValue);
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Settings PUT error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
