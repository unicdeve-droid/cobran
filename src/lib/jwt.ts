import { SignJWT, jwtVerify } from 'jose';

// Módulo "puro", sem dependências de next/headers, para poder ser importado
// tanto pelo middleware (Edge Runtime) quanto pelas API routes (Node Runtime).

export const AUTH_COOKIE_NAME = 'admin_session';
const JWT_EXPIRATION = '7d';

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não está definido no .env');
  }
  return new TextEncoder().encode(secret);
}

export interface AuthPayload {
  sub: string;
  email: string;
}

export async function signAuthToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== 'string') return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
