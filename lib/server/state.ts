import fs from 'node:fs/promises';
import path from 'node:path';
import { HallState, SessionRecord } from '@/lib/types';
import { totalForSession } from '@/lib/billing';

const getDataFile = () => process.env.STATE_FILE_PATH || path.join(process.cwd(), 'data', 'state.json');

const defaultState = (): HallState => ({
  tables: Array.from({ length: 8 }, (_, i) => ({ id: `table-${i + 1}`, name: `Table ${i + 1}`, status: 'available' })),
  sessions: {},
  rates: { defaultHourlyRate: 18 },
  updatedAt: Date.now()
});

async function ensureState(): Promise<void> {
  const dataFile = getDataFile();

  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(defaultState(), null, 2), 'utf8');
  }
}

export async function readState(): Promise<HallState> {
  await ensureState();
  const raw = await fs.readFile(getDataFile(), 'utf8');
  return JSON.parse(raw) as HallState;
}

export async function writeState(next: HallState): Promise<void> {
  next.updatedAt = Date.now();
  await fs.writeFile(getDataFile(), JSON.stringify(next, null, 2), 'utf8');
}

export async function updateState(mutator: (state: HallState) => { ok: boolean; message: string; total?: number }): Promise<{ ok: boolean; message: string; total?: number }> {
  const state = await readState();
  const result = mutator(state);
  if (result.ok) await writeState(state);
  return result;
}

const getSession = (state: HallState, tableId: string): SessionRecord | null => {
  const table = state.tables.find((t) => t.id === tableId);
  if (!table?.activeSessionId) return null;
  return state.sessions[table.activeSessionId] ?? null;
};

export async function startTable(tableId: string, now = Date.now()) {
  return updateState((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return { ok: false, message: 'Table not found.' };
    if (table.status !== 'available') return { ok: false, message: 'Table is not available.' };
    const sessionId = `session-${tableId}-${now}`;
    state.sessions[sessionId] = {
      id: sessionId,
      tableId,
      startedAt: now,
      pausedDurationMs: 0,
      hourlyRate: state.rates.defaultHourlyRate
    };
    table.status = 'occupied';
    table.activeSessionId = sessionId;
    return { ok: true, message: `${table.name} session started.` };
  });
}

export async function pauseTable(tableId: string, now = Date.now()) {
  return updateState((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table?.activeSessionId) return { ok: false, message: 'No active session.' };
    if (table.status !== 'occupied') return { ok: false, message: 'Table is not running.' };
    const session = getSession(state, tableId);
    if (!session) return { ok: false, message: 'Session not found.' };
    session.pausedAt = now;
    table.status = 'paused';
    return { ok: true, message: `${table.name} paused.` };
  });
}

export async function resumeTable(tableId: string, now = Date.now()) {
  return updateState((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table?.activeSessionId) return { ok: false, message: 'No active session.' };
    if (table.status !== 'paused') return { ok: false, message: 'Table is not paused.' };
    const session = getSession(state, tableId);
    if (!session) return { ok: false, message: 'Session not found.' };
    const pausedAt = session.pausedAt ?? now;
    session.pausedDurationMs += Math.max(0, now - pausedAt);
    session.pausedAt = undefined;
    table.status = 'occupied';
    return { ok: true, message: `${table.name} resumed.` };
  });
}

export async function stopTable(tableId: string, now = Date.now()) {
  return updateState((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table?.activeSessionId) return { ok: false, message: 'No active session.' };
    const session = getSession(state, tableId);
    if (!session || session.endedAt) return { ok: false, message: 'Session already ended.' };
    session.endedAt = now;
    const total = totalForSession(session, now);
    table.status = 'available';
    table.activeSessionId = undefined;
    return { ok: true, message: `${table.name} ended. Total: $${total.toFixed(2)}`, total };
  });
}

export async function setRate(hourlyRate: number) {
  return updateState((state) => {
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) return { ok: false, message: 'Invalid hourly rate.' };
    state.rates.defaultHourlyRate = Number(hourlyRate.toFixed(2));
    return { ok: true, message: `Updated hourly rate to $${state.rates.defaultHourlyRate.toFixed(2)}` };
  });
}
