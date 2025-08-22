'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050';

/**
 * Botón de Google aislado, sin romper tu layout.
 * Usa el SDK oficial, obtiene el id_token y lo manda a tu backend.
 */
export default function GoogleAuthInline() {
  return (
    <div className="w-full flex justify-center">
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
  );
}