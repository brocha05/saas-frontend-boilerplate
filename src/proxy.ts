import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/pricing'];
const AUTH_ROUTES = ['/login', '/register'];
const DASHBOARD_PREFIX = '/dashboard';

function getTokenFromRequest(request: NextRequest): string | null {
  // Next.js middleware cannot access localStorage — token stored in cookie for SSR/middleware
  return request.cookies.get('access-token')?.value ?? null;
}

// Next.js 16+: export name must be "proxy" (previously "middleware")
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isDashboardRoute = pathname.startsWith(DASHBOARD_PREFIX) || pathname === '/';

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isDashboardRoute && !isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (static files)
     * - favicon.ico, public folder
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
