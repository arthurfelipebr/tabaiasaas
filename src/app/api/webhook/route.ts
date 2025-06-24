import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processMessage } from '@/lib/parser';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await prisma.session.findFirst({ where: { evolutionId: body.session } });
  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 400 });
  await prisma.mensagemBruta.create({ data: { sessionId: session.id, payload: JSON.stringify(body) } });
  await processMessage({ text: body.message, session: body.session, from: body.from });
  return NextResponse.json({ ok: true });
}
