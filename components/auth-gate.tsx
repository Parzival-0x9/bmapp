'use client';

import { FormEvent, useState } from 'react';
import { useAppStore } from '@/lib/store';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const user = useAppStore((s) => s.authUser);
  const signIn = useAppStore((s) => s.signIn);
  const [name, setName] = useState('');

  if (!user) {
    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      signIn(name.trim());
      setName('');
    };

    return (
      <main className="centered">
        <form className="card" onSubmit={onSubmit}>
          <h1>Billiards Manager</h1>
          <p>Sign in to access tables and billing controls.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name"
            aria-label="Staff name"
          />
          <button className="btn" type="submit">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
};
