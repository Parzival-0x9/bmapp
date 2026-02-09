import { costForElapsed, sessionElapsedMs, totalForSession } from '@/lib/billing';
import { SessionRecord } from '@/lib/types';

describe('billing', () => {
  const baseSession: SessionRecord = {
    id: 's1',
    tableId: 'table-1',
    startedAt: 0,
    hourlyRate: 20,
    pausedDurationMs: 0
  };

  it('computes elapsed and cost deterministically', () => {
    expect(costForElapsed(30 * 60 * 1000, 20)).toBe(10);
    expect(sessionElapsedMs(baseSession, 15 * 60 * 1000)).toBe(15 * 60 * 1000);
  });

  it('subtracts paused duration', () => {
    const session = { ...baseSession, pausedDurationMs: 5 * 60 * 1000, endedAt: 20 * 60 * 1000 };
    expect(totalForSession(session, 0)).toBe(5);
  });
});
