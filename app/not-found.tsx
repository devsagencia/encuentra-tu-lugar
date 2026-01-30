import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Página no encontrada</p>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
