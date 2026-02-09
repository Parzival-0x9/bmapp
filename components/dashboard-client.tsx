'use client';

import { useEffect, useMemo, useState } from 'react';
import { HallState } from '@/lib/types';
import { sessionElapsedMs, totalForSession } from '@/lib/billing';
import { formatDuration, formatTimestamp } from '@/lib/time';
import { ThemeToggle } from './theme-toggle';
import { Toast } from './toast';

type ApiResult = { ok: boolean; message: string; total?: number };

export const DashboardClient = ({ initialState, username }: { initialState: HallState; username: string }) => {
  const [state, setState] = useState(initialState);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) return;
    const payload = (await res.json()) as { ok: true; state: HallState };
    setState(payload.state);
  };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    const poll = window.setInterval(refresh, 4000);
    return () => {
      clearInterval(interval);
      clearInterval(poll);
    };
  }, []);

  const invoke = async (url: string, body?: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const result = (await res.json()) as ApiResult;
    setToast(result.message);
    await refresh();
  };

  const metrics = useMemo(() => {
    const active = state.tables.filter((t) => t.status !== 'available').length;
    return { active, total: state.tables.length };
  }, [state.tables]);

  return (
    <main className="layout">
      <section className="toolbar card">
        <div>
          <h1>Billiards Hall Dashboard</h1>
          <p>Signed in as {username}</p>
          <p>
            Active tables: {metrics.active}/{metrics.total}
          </p>
        </div>
        <div className="toolbar-actions">
          <label>
            Hourly rate
            <input
              type="number"
              min="1"
              step="0.5"
              value={state.rates.defaultHourlyRate}
              onChange={(e) => invoke('/api/rates', { hourlyRate: Number(e.target.value) })}
            />
          </label>
          <ThemeToggle />
          <button
            className="btn danger"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/';
            }}
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="grid">
        {state.tables.map((table) => {
          const session = table.activeSessionId ? state.sessions[table.activeSessionId] : undefined;
          const elapsed = session ? sessionElapsedMs(session, now) : 0;
          const total = session ? totalForSession(session, now) : 0;
          return (
            <article className="card table-card" key={table.id}>
              <header>
                <h3>{table.name}</h3>
                <span className={`status ${table.status}`}>{table.status}</span>
              </header>
              <div className="metric">Elapsed: {formatDuration(elapsed)}</div>
              {session && (
                <>
                  <div className="metric">Started: {formatTimestamp(session.startedAt)}</div>
                  <div className="metric">Rate: ${session.hourlyRate.toFixed(2)}/hr</div>
                  <div className="metric total">Running: ${total.toFixed(2)}</div>
                </>
              )}
              <div className="actions">
                <button className="btn" disabled={table.status !== 'available'} onClick={() => invoke(`/api/tables/${table.id}/start`)}>
                  Start
                </button>
                <button className="btn danger" disabled={table.status === 'available'} onClick={() => invoke(`/api/tables/${table.id}/stop`)}>
                  End
                </button>
                <button className="btn secondary" disabled={table.status !== 'occupied'} onClick={() => invoke(`/api/tables/${table.id}/pause`)}>
                  Pause
                </button>
                <button className="btn secondary" disabled={table.status !== 'paused'} onClick={() => invoke(`/api/tables/${table.id}/resume`)}>
                  Resume
                </button>
              </div>
            </article>
          );
        })}
      </section>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
};
