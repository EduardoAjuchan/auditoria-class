'use client';

type AuthPayload = {
  token: string;
  // si tu backend devuelve más campos (user, roles, exp), los agregás aquí
  [k: string]: any;
};

const COOKIE_NAME = 'auth'; // cookie no httpOnly para control de rutas

export function setAuth(payload: AuthPayload, maxAgeSeconds = 60 * 60) {
  // LocalStorage
  try {
    localStorage.setItem('auth', JSON.stringify(payload));
    localStorage.setItem('token', payload.token);
  } catch {}

  // Cookie básica para que el servidor pueda ver “hay sesión”
  try {
    const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      payload.token
    )}; Path=/; Max-Age=${maxAgeSeconds}; Expires=${expires}; SameSite=Lax`;
  } catch {}
}

export function getAuthClient(): AuthPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
  } catch {}
  try {
    // borrar cookie
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {}
}