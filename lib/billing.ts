import { durationMs } from './time';
import { SessionRecord } from './types';

export const sessionElapsedMs = (session: SessionRecord, now: number): number => {
  const end = session.endedAt ?? now;
  const raw = durationMs(session.startedAt, end);
  return Math.max(0, raw - session.pausedDurationMs);
};

export const costForElapsed = (elapsedMs: number, hourlyRate: number): number => {
  const hours = elapsedMs / (1000 * 60 * 60);
  return Number((hours * hourlyRate).toFixed(2));
};

export const totalForSession = (session: SessionRecord, now: number): number =>
  costForElapsed(sessionElapsedMs(session, now), session.hourlyRate);
