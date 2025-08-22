'use client';

import AuthButtons from '@/components/auth/AuthButtons';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-center">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">AUDITORIA</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Formas de autenticación implementadas
        </p>
      </header>

      <AuthButtons
        onRegisterBasic={() => console.log('Registrar Básico')}
        onLoginBasic={() => console.log('Login Básico')}
        onRegisterHash={() => console.log('Registrar Hash')}
        onLoginHash={() => console.log('Login Hash')}
        onGoogle={() => console.log('Login/Registro con Google')}
      />

      
    </main>
  );
}