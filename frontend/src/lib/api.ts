'use client';

// Base de tu backend (ajustá .env.local si cambia)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE as string;

/** Guarda o borra el JWT del almacenamiento local */
export function setToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem('token');
    else localStorage.setItem('token', token);
  } catch {
    // localStorage puede no existir en SSR; lo ignoramos
  }
}

/** Obtiene el JWT si existe */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

/** Wrapper de fetch con JSON y Authorization automático */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // Intentamos leer JSON; si no hay body, devolvemos undefined
  const text = await res.text();
  let data: any = undefined;
  try { data = text ? JSON.parse(text) : undefined; } catch {}

  if (!res.ok) {
    const msg = data?.message || res.statusText || 'Error';
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return data as T;
}