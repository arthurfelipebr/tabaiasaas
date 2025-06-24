import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = verify(token, JWT_SECRET) as { userId: number };
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}
