import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { AuthUser } from '@/lib/types';

const SESSION_COOKIE = 'bmapp_session';

interface AuthConfig {
  secret: string;
  adminUser: string;
  adminPass: string;
}

const getAuthConfig = (): AuthConfig => {
  const secret = process.env.SESSION_SECRET || 'dev-only-change-me';
  const adminUser = process.env.BMAPP_ADMIN_USER || 'admin';
  const adminPass = process.env.BMAPP_ADMIN_PASSWORD || 'admin123';

  if (process.env.NODE_ENV === 'production') {
    const missing = [
      !process.env.SESSION_SECRET && 'SESSION_SECRET',
      !process.env.BMAPP_ADMIN_USER && 'BMAPP_ADMIN_USER',
      !process.env.BMAPP_ADMIN_PASSWORD && 'BMAPP_ADMIN_PASSWORD'
    ].filter(Boolean);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
    }
  }

  return { secret, adminUser, adminPass };
};

const b64 = (v: string) => Buffer.from(v, 'utf8').toString('base64url');
const unb64 = (v: string) => Buffer.from(v, 'base64url').toString('utf8');

const sign = (payload: string) => {
  const { secret } = getAuthConfig();
  return createHmac('sha256', secret).update(payload).digest('base64url');
};

export const verifyCredentials = (username: string, password: string): boolean => {
  const { adminUser, adminPass } = getAuthConfig();
  return username === adminUser && password === adminPass;
};

export const createSessionToken = (user: AuthUser): string => {
  const payload = JSON.stringify({ ...user, exp: Date.now() + 1000 * 60 * 60 * 12 });
  const encoded = b64(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
};

export const parseSessionToken = (token: string): AuthUser | null => {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const parsed = JSON.parse(unb64(encoded)) as AuthUser & { exp: number };
    if (Date.now() > parsed.exp) return null;
    return { id: parsed.id, username: parsed.username, role: parsed.role };
  } catch {
    return null;
  }
};

export const setSessionCookie = async (token: string) => {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12
  });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
};

export const requireUser = async (): Promise<AuthUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseSessionToken(token);
};

export const sessionCookieName = SESSION_COOKIE;
