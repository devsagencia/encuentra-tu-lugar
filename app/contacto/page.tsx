import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactoPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Contacto</h1>
          <p className="text-muted-foreground">Soporte, incidencias y consultas.</p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Escríbenos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Por ahora el contacto está en modo demo. Añadiremos un formulario y correo de soporte en la siguiente iteración.
            </p>
            <p>
              Si tienes un error concreto, envíanos: URL, captura, y el mensaje de consola/red.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

