import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Aviso legal</h1>
          <p className="text-muted-foreground">Documento provisional (plantilla). Completar con datos del titular.</p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>- Titular: (pendiente)</p>
            <p>- NIF/CIF: (pendiente)</p>
            <p>- Domicilio: (pendiente)</p>
            <p>- Email de contacto: (pendiente)</p>
            <p>- Finalidad: plataforma de publicación y consulta de anuncios (con moderación).</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

