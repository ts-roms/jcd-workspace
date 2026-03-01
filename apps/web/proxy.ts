import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Protected routes require authentication
  // Redirect to login if no tokens present
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!accessToken || !refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Note: We don't redirect from auth pages to dashboard here
  // Let the client-side handle that after verifying the tokens are valid
  // This prevents redirect loops with expired/invalid tokens

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
