import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie, verifyCredentials } from '@/lib/server/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? '').trim();
  const password = String(body?.password ?? '');

  if (!username || !password) {
    return NextResponse.json({ ok: false, message: 'Username and password are required.' }, { status: 400 });
  }

  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ ok: false, message: 'Invalid credentials.' }, { status: 401 });
  }

  const token = createSessionToken({ id: `user-${username}`, username, role: 'manager' });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, message: 'Signed in.' });
}
