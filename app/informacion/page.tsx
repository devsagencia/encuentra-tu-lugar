import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLATFORM_INFO_SECTIONS, PLATFORM_INFO_TITLE } from '@/lib/platformInfo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function InformacionPlataformaPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            {PLATFORM_INFO_TITLE}
          </h1>
          <p className="text-muted-foreground">
            Documento informativo para entender la finalidad y normas de uso del servicio.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link href="/cuenta">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al dashboard
              </Link>
            </Button>
          </div>
        </div>

        {PLATFORM_INFO_SECTIONS.map((s) => (
          <Card key={s.title} className="glass-card border-border">
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              {s.paragraphs.map((p) => (
                <p key={p} className={s.emphasize && p.includes('no permite') ? 'text-foreground font-semibold' : undefined}>
                  {p}
                </p>
              ))}
              {s.bullets?.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        ))}

        <div className="pt-2 flex justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/cuenta">Volver al dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

