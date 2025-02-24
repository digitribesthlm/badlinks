import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-token');

  // Only allow access to url-manager and redirect all other authenticated routes
  if (authToken) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/url-manager', request.url));
    }
    if (!pathname.startsWith('/url-manager') && 
        !pathname.startsWith('/_next') && 
        !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/url-manager', request.url));
    }
  } else if (pathname.startsWith('/url-manager')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 