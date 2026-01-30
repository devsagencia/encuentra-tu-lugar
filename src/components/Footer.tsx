import Link from 'next/link';
import { Heart } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/tarifas', label: 'Tarifas' },
  { href: '/contacto', label: 'Contacto' },
] as const;

const LEGAL_LINKS = [
  { href: '/legal/aviso-legal', label: 'Aviso legal' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/terminos', label: 'Términos y condiciones' },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-display text-lg font-bold gradient-text">Contactalia</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Plataforma para descubrir anuncios y gestionar tu perfil con control de privacidad y suscripciones.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">Menú</div>
            <ul className="space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">Legal</div>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-xs text-muted-foreground">© {year} Contactalia. Todos los derechos reservados.</div>
          <div className="text-xs text-muted-foreground">
            <span className="opacity-80">Contenido sujeto a moderación y políticas de la plataforma.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

