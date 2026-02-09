import { NextResponse } from 'next/server';
import { readState } from '@/lib/server/state';

export async function GET() {
  const state = await readState();
  return NextResponse.json({ ok: true, state });
}
