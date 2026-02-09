import { BilliardsTable } from './types';

export const canStart = (table: BilliardsTable): boolean => table.status === 'available';
export const canStop = (table: BilliardsTable): boolean => table.status === 'occupied' || table.status === 'paused';
export const canPause = (table: BilliardsTable): boolean => table.status === 'occupied';
export const canResume = (table: BilliardsTable): boolean => table.status === 'paused';
