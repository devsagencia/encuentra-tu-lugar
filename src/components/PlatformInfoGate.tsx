'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_INFO_SECTIONS, PLATFORM_INFO_TITLE, PLATFORM_INFO_VERSION } from '@/lib/platformInfo';

const storageKey = `contactalia_platform_info_ack_${PLATFORM_INFO_VERSION}`;

export function PlatformInfoGate() {
  const [open, setOpen] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Solo en cliente
    try {
      const already = localStorage.getItem(storageKey) === '1';
      setOpen(!already);
    } catch {
      // Si localStorage falla, forzamos lectura (mejor bloquear que saltárselo)
      setOpen(true);
    }
  }, []);

  const canContinue = useMemo(() => hasScrolledToEnd && accepted, [hasScrolledToEnd, accepted]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (nearBottom) setHasScrolledToEnd(true);
  };

  const acceptAndClose = () => {
    if (!canContinue) return;
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[101] w-[min(900px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/60 bg-background p-0 shadow-2xl overflow-hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="p-5 sm:p-6 border-b border-border/50 bg-background/80">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-semibold text-foreground">{PLATFORM_INFO_TITLE}</div>
                    <div className="text-sm text-muted-foreground">
                      Para continuar usando Contactalia debes leer este texto completo y aceptarlo.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Obligatorio
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Versión: <span className="font-mono">{PLATFORM_INFO_VERSION}</span>
                  </span>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href="/informacion">Abrir en página completa</Link>
              </Button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="h-[50vh] sm:h-[55vh] overflow-y-auto rounded-lg border border-border/50 bg-muted/10 p-4"
            >
              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                {PLATFORM_INFO_SECTIONS.map((s) => (
                  <section key={s.title} className="space-y-2">
                    <div className="text-foreground font-semibold">{s.title}</div>
                    {s.paragraphs.map((p) => (
                      <p
                        key={p}
                        className={s.emphasize && p.includes('no permite') ? 'text-foreground font-semibold' : undefined}
                      >
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
                  </section>
                ))}
                <div className="pt-2 text-xs text-muted-foreground/80">
                  Fin del documento.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border/50 bg-background/40 p-4">
              <div className="space-y-1">
                {!hasScrolledToEnd ? (
                  <div className="text-sm text-muted-foreground">
                    Desplázate hasta el final para habilitar la aceptación.
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Lectura completada.
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="platform_info_ack"
                    checked={accepted}
                    disabled={!hasScrolledToEnd}
                    onCheckedChange={(v) => setAccepted(Boolean(v))}
                  />
                  <label htmlFor="platform_info_ack" className="text-sm leading-snug text-foreground">
                    He leído y entendido la información y acepto continuar usando Contactalia.
                  </label>
                </div>
              </div>

              <Button
                className="shrink-0"
                disabled={!canContinue}
                onClick={acceptAndClose}
              >
                Continuar
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

