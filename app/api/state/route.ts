import { NextResponse } from 'next/server';
import { ensureApiUser } from '@/lib/server/api-auth';
import { readState } from '@/lib/server/state';

export async function GET() {
  const { unauthorized } = await ensureApiUser();
  if (unauthorized) return unauthorized;

  const state = await readState();
  return NextResponse.json({ ok: true, state });
}
