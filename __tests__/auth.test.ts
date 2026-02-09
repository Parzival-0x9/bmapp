import { createSessionToken, parseSessionToken, verifyCredentials } from '@/lib/server/auth';

describe('server auth', () => {
  it('verifies credentials and parses signed token', () => {
    expect(verifyCredentials('admin', 'admin123')).toBe(true);
    expect(verifyCredentials('admin', 'bad')).toBe(false);

    const token = createSessionToken({ id: 'u1', username: 'admin', role: 'manager' });
    const user = parseSessionToken(token);
    expect(user?.username).toBe('admin');
  });

  it('rejects tampered token', () => {
    const token = createSessionToken({ id: 'u1', username: 'admin', role: 'manager' });
    const tampered = `${token}x`;
    expect(parseSessionToken(tampered)).toBeNull();
  });
});
