'use client';

import { totalForSession, sessionElapsedMs } from '@/lib/billing';
import { formatDuration, formatTimestamp } from '@/lib/time';
import { BilliardsTable, SessionRecord } from '@/lib/types';

interface TableCardProps {
  table: BilliardsTable;
  session?: SessionRecord;
  now: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const TableCard = ({ table, session, now, onStart, onStop, onPause, onResume }: TableCardProps) => {
  const elapsed = session ? sessionElapsedMs(session, now) : 0;
  const runningTotal = session ? totalForSession(session, now) : 0;

  return (
    <article className="card table-card">
      <header>
        <h3>{table.name}</h3>
        <span className={`status ${table.status}`}>{table.status}</span>
      </header>

      <div className="metric">Elapsed: {formatDuration(elapsed)}</div>
      {session && (
        <>
          <div className="metric">Started: {formatTimestamp(session.startedAt)}</div>
          <div className="metric">Rate: ${session.hourlyRate.toFixed(2)}/hr</div>
          <div className="metric total">Total: ${runningTotal.toFixed(2)}</div>
        </>
      )}

      <div className="actions">
        <button className="btn" onClick={onStart} disabled={table.status !== 'available'}>
          Start
        </button>
        <button className="btn danger" onClick={onStop} disabled={table.status === 'available'}>
          End
        </button>
        <button className="btn secondary" onClick={onPause} disabled={table.status !== 'occupied'}>
          Pause
        </button>
        <button className="btn secondary" onClick={onResume} disabled={table.status !== 'paused'}>
          Resume
        </button>
      </div>
    </article>
  );
};
