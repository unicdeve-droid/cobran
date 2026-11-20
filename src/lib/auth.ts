import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthPayload } from './jwt';

export { AUTH_COOKIE_NAME, signAuthToken, verifyAuthToken } from './jwt';
export type { AuthPayload } from './jwt';

// Helper para uso em Server Components e Route Handlers (não usar em middleware).
export async function getAuthUser(): Promise<AuthPayload | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
