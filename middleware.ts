import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'bmapp_session';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) return NextResponse.next();

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
