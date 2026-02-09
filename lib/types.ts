export type TableStatus = 'available' | 'occupied' | 'paused' | 'closed';

export interface AuthUser {
  id: string;
  username: string;
  role: 'manager' | 'staff';
}

export interface SessionRecord {
  id: string;
  tableId: string;
  startedAt: number;
  endedAt?: number;
  pausedAt?: number;
  pausedDurationMs: number;
  hourlyRate: number;
}

export interface BilliardsTable {
  id: string;
  name: string;
  status: TableStatus;
  activeSessionId?: string;
}

export interface AppRateConfig {
  defaultHourlyRate: number;
}

export interface HallState {
  tables: BilliardsTable[];
  sessions: Record<string, SessionRecord>;
  rates: AppRateConfig;
  updatedAt: number;
}
