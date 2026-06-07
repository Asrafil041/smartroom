import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude Next.js static files, API routes, and images from middleware
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp)$/)) {
    return NextResponse.next();
  }

  // Always allow public routes
  if (pathname === '/' || pathname === '/login') {
    return NextResponse.next();
  }

  // For protected routes, let the page-level auth check handle it
  // (client-side via useEffect and localStorage) to avoid server-side
  // session cookie issues in development
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|.*\\..*).*)'],
};
