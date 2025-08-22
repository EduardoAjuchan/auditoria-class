import { NextRequest, NextResponse } from 'next/server';

function isProtectedPath(pathname: string) {
  return pathname.startsWith('/(protected)') || pathname.startsWith('/dashboard');
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth')?.value || null;
  const { pathname, search } = req.nextUrl;

  // 🔒 Si intenta entrar a una ruta protegida sin token → lo mandamos al home
  if (isProtectedPath(pathname) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  // 🌀 Si ya tiene sesión y entra a "/" → lo mandamos al dashboard
  if (!isProtectedPath(pathname) && token && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 🚫 Evitamos cache en rutas protegidas
  if (isProtectedPath(pathname) && token) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(protected)(.*)',
    '/dashboard/:path*',
  ],
};