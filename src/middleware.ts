import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from './lib/jwt';

// Protege todas as páginas do painel /xcexm2r4oq4tfzm7rf5222, exceto a de login.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/xcexm2r4oq4tfzm7rf5222/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyAuthToken(token) : null;

  if (!user) {
    const loginUrl = new URL('/xcexm2r4oq4tfzm7rf5222/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/xcexm2r4oq4tfzm7rf5222/:path*'],
};
