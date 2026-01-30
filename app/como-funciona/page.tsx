import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Cómo funciona</h1>
          <p className="text-muted-foreground">Guía rápida para visitantes y anunciantes.</p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Para visitantes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>- Explora anuncios públicos en la portada.</p>
              <p>- Regístrate para acceder a contenido marcado como “Solo registrados”.</p>
              <p>- Si tienes suscripción activa, podrás ver contenido Premium/VIP según el plan.</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Para anunciantes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>- Crea tu anuncio y completa la información del perfil.</p>
              <p>- Sube fotos y vídeos y elige su visibilidad (según tu plan).</p>
              <p>- El equipo puede revisar y aprobar el anuncio antes de su publicación.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

