// Middleware for route protection
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'kwasu-clearance-secret-key-2024-secure'
);

const COOKIE_NAME = 'kwasu_auth_token';

// Routes that require authentication
const protectedRoutes = ['/student', '/officer', '/admin'];

// Routes accessible only without authentication
const authRoutes = ['/login', '/register'];

// Role-based route access
const roleRoutes = {
    student: ['/student'],
    officer: ['/officer'],
    admin: ['/admin'],
};

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Get token from cookie
    const token = request.cookies.get(COOKIE_NAME)?.value;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // If accessing auth routes while logged in, redirect to dashboard
    if (isAuthRoute && token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const role = payload.role;

            // Redirect to appropriate dashboard based on role
            const dashboardUrl = new URL(`/${role}`, request.url);
            return NextResponse.redirect(dashboardUrl);
        } catch (error) {
            // Token is invalid, allow access to auth routes
            return NextResponse.next();
        }
    }

    // If accessing protected route
    if (isProtectedRoute) {
        if (!token) {
            // No token, redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            // Verify token
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const role = payload.role;

            // Check if user has access to this route
            const allowedRoutes = roleRoutes[role] || [];
            const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

            if (!hasAccess) {
                // Redirect to appropriate dashboard
                const dashboardUrl = new URL(`/${role}`, request.url);
                return NextResponse.redirect(dashboardUrl);
            }

            return NextResponse.next();

        } catch (error) {
            // Token is invalid, redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);

            // Clear invalid cookie
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete(COOKIE_NAME);
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
};
