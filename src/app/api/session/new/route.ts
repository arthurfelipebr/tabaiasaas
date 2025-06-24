import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${process.env.EVOLUTION_API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.EVOLUTION_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ webhook: `${req.nextUrl.origin}/api/webhook` })
  });

  const data = await res.json();
  const session = await prisma.session.create({ data: { userId: user.id, evolutionId: data.id, status: data.status, qrCode: data.qrCode } });
  return NextResponse.json(session);
}
