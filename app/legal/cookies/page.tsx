import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Política de cookies</h1>
          <p className="text-muted-foreground">Documento provisional (plantilla). Ajustar según analítica/cookies usadas.</p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Uso de cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>- Cookies técnicas: necesarias para iniciar sesión y mantener la sesión.</p>
            <p>- Cookies de personalización/analítica: (pendiente, si se habilitan).</p>
            <p>- Puedes gestionar cookies desde la configuración de tu navegador.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

