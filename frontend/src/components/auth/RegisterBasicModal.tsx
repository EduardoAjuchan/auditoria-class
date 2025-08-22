'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050';

export default function RegisterBasicModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setStatus('idle');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/basic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      try { if (data.token) localStorage.setItem('token', data.token); } catch {}
      setStatus('success');
      setMsg('Usuario creado correctamente');
      // limpiar campos al crear usuario
      setUsername('');
      setEmail('');
      setPassword('');
      // pequeño delay para que el usuario vea el mensaje
      setTimeout(() => {
        onClose();
        // optional: notificar a otros componentes
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:login'));
      }, 500);
    } catch (err: any) {
      setMsg(err.message || 'Error en registro');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar (Básico)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Usuario</label>
          <input
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
            placeholder="p.ej. juan"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
            placeholder="juan@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
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
            {loading ? 'Registrando…' : 'Crear cuenta'}
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