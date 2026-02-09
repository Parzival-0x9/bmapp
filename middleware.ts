import { NextRequest, NextResponse } from 'next/server';
import { parseSessionToken, sessionCookieName } from '@/lib/server/auth';

const protectedMatchers = ['/dashboard', '/api/state', '/api/tables', '/api/rates'];

export function middleware(req: NextRequest) {
  const needsAuth = protectedMatchers.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(sessionCookieName)?.value;
  const user = token ? parseSessionToken(token) : null;
  if (user) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const redirect = new URL('/', req.url);
  redirect.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(redirect);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/state', '/api/tables/:path*', '/api/rates']
};
