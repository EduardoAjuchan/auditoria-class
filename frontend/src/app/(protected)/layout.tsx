// src/app/(protected)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/'); // si no hay token, fuera
  }

  return <>{children}</>;
}