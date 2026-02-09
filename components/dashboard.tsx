'use client';

import { TableCard } from './table-card';
import { useAppStore } from '@/lib/store';
import { useNow } from '@/hooks/use-now';
import { ThemeToggle } from './theme-toggle';

export const Dashboard = () => {
  const now = useNow();
  const { authUser, tables, sessions, setRate, rates, signOut, startTable, stopTable, pauseTable, resumeTable } =
    useAppStore();

  return (
    <main className="layout">
      <section className="toolbar card">
        <div>
          <h1>Billiards Hall Dashboard</h1>
          <p>Signed in as {authUser?.name}</p>
        </div>
        <div className="toolbar-actions">
          <label>
            Hourly rate
            <input
              type="number"
              min="1"
              step="0.5"
              value={rates.defaultHourlyRate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </label>
          <ThemeToggle />
          <button className="btn danger" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>

      <section className="grid">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            now={now}
            session={table.activeSessionId ? sessions[table.activeSessionId] : undefined}
            onStart={() => startTable(table.id, now)}
            onStop={() => stopTable(table.id, now)}
            onPause={() => pauseTable(table.id, now)}
            onResume={() => resumeTable(table.id, now)}
          />
        ))}
      </section>
    </main>
  );
};
