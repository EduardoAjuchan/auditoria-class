'use client';

import { useState } from 'react';
import RegisterBasicModal from '@/components/auth/RegisterBasicModal';
import RegisterHashModal from '@/components/auth/RegisterHashModal';

import { UserPlus, LogIn, Shield, KeyRound } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050';

type Props = {
  onRegisterBasic?: () => void;
  onLoginBasic?: () => void;
  onRegisterHash?: () => void;
  onLoginHash?: () => void;
  onGoogle?: () => void;
};

export default function AuthButtons({
  onRegisterBasic,
  onLoginBasic,
  onRegisterHash,
  onLoginHash,
  onGoogle,
}: Props) {
  const [openBasic, setOpenBasic] = useState(false);
  const [openHash, setOpenHash] = useState(false);

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/70 shadow-xl ring-1 ring-black/5 backdrop-blur p-6 space-y-4">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Autenticación</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Elegí cómo querés registrarte o iniciar sesión.
          </p>
        </header>

        <div className="grid gap-3">
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
            onClick={() => setOpenBasic(true)}
          >
            <UserPlus className="w-4 h-4" />
            Registrar (Básico)
          </button>

          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white bg-blue-600/90 hover:bg-blue-700 transition"
            onClick={onLoginBasic}
          >
            <LogIn className="w-4 h-4" />
            Login (Básico)
          </button>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            onClick={() => setOpenHash(true)}
          >
            <Shield className="w-4 h-4" />
            Registrar (Hash)
          </button>

          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            onClick={onLoginHash}
          >
            <KeyRound className="w-4 h-4" />
            Login (Hash)
          </button>

          {/* Separador “o” */}
          <div className="relative my-2">
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
            <span className="absolute inset-0 -top-3 mx-auto w-fit px-3 text-xs text-zinc-500 bg-white dark:bg-zinc-900">
              o
            </span>
          </div>

          {/* Botón Google estilo oficial funcional */}
          <div className="relative">
            <button
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white 
                         text-sm font-medium text-zinc-700 hover:bg-gray-100 active:bg-gray-200 
                         dark:hover:bg-zinc-800 dark:active:bg-zinc-700 shadow-sm transition h-11 px-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.9 30.4 0 24 0 14.6 0 6.4 5.4 2.4 13.3l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.5c-.5 2.6-2.1 4.8-4.5 6.3l7 5.4c4.1-3.8 6.1-9.4 6.1-16.2z"/>
                <path fill="#FBBC05" d="M10.3 28.7c-1-2.6-1-5.4 0-8l-7.9-6.1c-2.4 4.7-2.4 15.6 0 20.3l7.9-6.2z"/>
                <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7-5.4c-2 1.3-4.6 2.1-9 2.1-6.3 0-11.6-4.3-13.5-10l-7.9 6.2C6.4 42.6 14.6 48 24 48z"/>
              </svg>
              <span className="text-sm font-medium">Registrate / Iniciá con Google</span>
            </button>
            {/* Overlay funcional de GoogleLogin */}
            <div className="absolute inset-0 opacity-0">
              <GoogleLogin
                onSuccess={async (cred: CredentialResponse) => {
                  try {
                    const idToken = cred.credential;
                    if (!idToken) throw new Error('No se recibió id_token de Google.');
                    const res = await fetch(`${API_BASE}/api/auth/login/google`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ idToken }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data?.ok) {
                      console.error('Google login backend error:', data);
                      alert(data?.message || `Error: ${res.status}`);
                      return;
                    }
                    try { localStorage.setItem('token', data.token); } catch {}
                    alert('Login/registro con Google OK');
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:login'));
                  } catch (e: any) {
                    alert(e?.message || 'Error en login con Google');
                  }
                }}
                onError={() => alert('Google Login falló')}
                useOneTap={false}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
      <RegisterBasicModal open={openBasic} onClose={() => setOpenBasic(false)} />
      <RegisterHashModal open={openHash} onClose={() => setOpenHash(false)} />
    </div>
  );
}