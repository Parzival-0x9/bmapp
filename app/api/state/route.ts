import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { readState } from '@/lib/server/state';

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const state = await readState();
  return NextResponse.json({ ok: true, state });
}
