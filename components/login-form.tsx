'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

const resolveNextPath = (nextParam: string | null): string => {
  if (!nextParam) return '/dashboard';
  if (!nextParam.startsWith('/') || nextParam.startsWith('//')) return '/dashboard';
  return nextParam;
};

export const LoginForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const payload = await res.json();
    setLoading(false);
    if (!res.ok) return setError(payload.message || 'Login failed');

    const nextPath = resolveNextPath(params.get('next'));
    window.location.assign(nextPath);
    router.refresh();
  };

  return (
    <form className="card login" onSubmit={onSubmit}>
      <h1>Billiards Manager</h1>
      <p>Sign in with manager credentials.</p>
      <input aria-label="Username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input
        aria-label="Password"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <small className="hint">Default dev credentials: admin / admin123</small>
    </form>
  );
};
