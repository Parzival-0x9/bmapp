import { NextResponse } from 'next/server';
import { pauseTable } from '@/lib/server/state';

export async function POST(_: Request, { params }: { params: { tableId: string } }) {
  const result = await pauseTable(params.tableId, Date.now());
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
