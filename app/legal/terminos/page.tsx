import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TerminosPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Términos y condiciones</h1>
          <p className="text-muted-foreground">Documento provisional (plantilla). Ajustar a las normas de la plataforma.</p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Normas básicas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>- Los anuncios pueden estar sujetos a revisión y moderación.</p>
            <p>- El usuario es responsable del contenido que publica y del cumplimiento legal aplicable.</p>
            <p>- La plataforma puede retirar contenido o cuentas en caso de incumplimiento.</p>
            <p>- Suscripciones: acceso a funcionalidades/contenido según el plan activo.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

