'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Car } from 'lucide-react';
import { clearAuth } from '@/lib/auth';
import { useCallback } from 'react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useCallback(
    (href: string) => (pathname === href ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : ''),
    [pathname]
  );

  function onLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    } catch {}
    try {
      document.cookie = 'auth=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch {}
    router.replace('/');
  }

  return (
    <header className="w-full sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/80 backdrop-blur ring-1 ring-black/5">
      <div className="flex items-center justify-between w-full px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-blue-600" />
          <span className="text-sm font-semibold tracking-tight">Auditoría</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={`rounded-xl px-3 py-2 text-sm ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 ${isActive('/dashboard')}`}
          >
            <Car className="w-4 h-4" />
            Vehículos
          </Link>

          <button
            onClick={onLogout}
            className="rounded-xl px-3 py-2 text-sm bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}