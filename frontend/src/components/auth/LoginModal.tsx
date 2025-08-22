'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050';

type Mode = 'basic' | 'hash';

export default function LoginModal({
  open,
  onClose,
  initialMode = 'basic',
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Cuando se abra el modal, sincronizamos el modo inicial y limpiamos campos
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setUsername('');
      setPassword('');
      setMsg(null);
      setStatus('idle');
    }
  }, [open, initialMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setStatus('idle');
    setLoading(true);

    try {
      const path =
        mode === 'basic' ? '/api/auth/login/basic' : '/api/auth/login/hash';

      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const apiMsg = (typeof data?.error === 'string' && data.error)
          || (typeof data?.message === 'string' && data.message)
          || (typeof data?.msg === 'string' && data.msg)
          || `HTTP ${res.status}`;
        throw new Error(apiMsg);
      }

      try {
        if (data.token) {
          localStorage.setItem('token', data.token);
          // set cookie for server-side/middleware checks
          const maxAge = 60 * 60; // 1h default, ajustá si tu backend define otro
          document.cookie = `auth=${encodeURIComponent(data.token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
        }
      } catch {}
      setMsg('Inicio de sesión correcto');
      setStatus('success');

      // redirigir al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const friendly = typeof err?.message === 'string' && err.message.trim().length > 0
        ? err.message
        : 'Error al iniciar sesión';
      setMsg(friendly);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Iniciar sesión">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de método */}
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode('basic')}
            className={`px-3 py-1.5 rounded-full ring-1 transition ${
              mode === 'basic'
                ? 'bg-blue-600 text-white ring-blue-600 shadow'
                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Básico
          </button>
          <button
            type="button"
            onClick={() => setMode('hash')}
            className={`px-3 py-1.5 rounded-full ring-1 transition ${
              mode === 'hash'
                ? 'bg-blue-600 text-white ring-blue-600 shadow'
                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Hash
          </button>
        </div>

        <div>
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Usuario</label>
          <input
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
            placeholder="tu_usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {msg && (
          <div
            role="alert"
            className={`w-full rounded-xl px-4 py-2 text-sm font-medium transition
              ${status === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}
          >
            {msg}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}