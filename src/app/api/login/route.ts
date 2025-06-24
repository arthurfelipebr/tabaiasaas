import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('token', token, { httpOnly: true, path: '/' });
  return res;
}
