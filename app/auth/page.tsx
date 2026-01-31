import { Suspense } from 'react';
import AuthClient from './AuthClient';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando…</div>}>
      <AuthClient />
    </Suspense>
  );
}
