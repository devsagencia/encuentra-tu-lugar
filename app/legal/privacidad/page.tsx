import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Política de privacidad</h1>
          <p className="text-muted-foreground">Documento provisional (plantilla). Completar con detalles del tratamiento.</p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>- Datos tratados: cuenta, perfil, medios subidos, uso del servicio.</p>
            <p>- Finalidad: prestación del servicio, moderación, seguridad y soporte.</p>
            <p>- Base legal: consentimiento y ejecución del contrato/servicio.</p>
            <p>- Derechos: acceso, rectificación, supresión, oposición, limitación y portabilidad.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

