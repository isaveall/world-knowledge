import { NextRequest, NextResponse } from 'next/server';

// Middleware runs in Edge Runtime - no Node.js modules allowed
// We only do basic JWT structure validation here, real auth is in route handlers
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Basic check: JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
