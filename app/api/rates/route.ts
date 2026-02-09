import { NextResponse } from 'next/server';
import { setRate } from '@/lib/server/state';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const hourlyRate = Number(body?.hourlyRate);
  const result = await setRate(hourlyRate);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
