'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet } from 'lucide-react';

type SubscriptionRow = {
  user_id: string;
  plan: string;
  status: string;
};

const VISITOR_PRICES: Record<string, number> = {
  premium: 19.99,
  vip: 39.99,
};

const ADVERTISER_PRICES: Record<string, number> = {
  premium: 29.99,
  vip: 59.99,
};

function eur(amount: number) {
  return amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

export function AdminAccounting() {
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [advertiserUserIds, setAdvertiserUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      // 1) Suscripciones activas
      const { data: s, error: sErr } = await supabase
        .from('subscriptions')
        .select('user_id,plan,status')
        .eq('status', 'active');

      if (sErr) {
        console.error('Error loading subscriptions for accounting:', sErr);
        setSubs([]);
        setAdvertiserUserIds(new Set());
        setLoading(false);
        return;
      }

      const activeSubs = (s as SubscriptionRow[]) ?? [];
      setSubs(activeSubs);

      // 2) Clasificar como "anunciante" si existe perfil (1 perfil por usuario en el modelo actual)
      const ids = Array.from(new Set(activeSubs.map((x) => x.user_id).filter(Boolean)));
      if (ids.length === 0) {
        setAdvertiserUserIds(new Set());
        setLoading(false);
        return;
      }

      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('user_id')
        .in('user_id', ids);

      if (pErr) {
        console.error('Error loading profiles for accounting:', pErr);
        setAdvertiserUserIds(new Set());
        setLoading(false);
        return;
      }

      const setIds = new Set<string>(((p as any[]) ?? []).map((r) => r.user_id).filter(Boolean));
      setAdvertiserUserIds(setIds);
      setLoading(false);
    };

    run();
  }, []);

  const summary = useMemo(() => {
    let visitorCount = 0;
    let advertiserCount = 0;
    let visitorRevenue = 0;
    let advertiserRevenue = 0;

    const breakdown: Record<
      'visitantes' | 'anunciantes',
      { free: number; premium: number; vip: number; revenue: number }
    > = {
      visitantes: { free: 0, premium: 0, vip: 0, revenue: 0 },
      anunciantes: { free: 0, premium: 0, vip: 0, revenue: 0 },
    };

    for (const r of subs) {
      const plan = (r.plan || 'free').toLowerCase();
      const isAdvertiser = advertiserUserIds.has(r.user_id);
      const bucket = isAdvertiser ? 'anunciantes' : 'visitantes';

      if (plan === 'premium') breakdown[bucket].premium += 1;
      else if (plan === 'vip') breakdown[bucket].vip += 1;
      else breakdown[bucket].free += 1;

      const price = isAdvertiser ? ADVERTISER_PRICES[plan] : VISITOR_PRICES[plan];
      const amount = typeof price === 'number' ? price : 0;
      breakdown[bucket].revenue += amount;

      if (isAdvertiser) {
        advertiserCount += 1;
        advertiserRevenue += amount;
      } else {
        visitorCount += 1;
        visitorRevenue += amount;
      }
    }

    return {
      visitorCount,
      advertiserCount,
      visitorRevenue,
      advertiserRevenue,
      totalRevenue: visitorRevenue + advertiserRevenue,
      totalCount: visitorCount + advertiserCount,
      breakdown,
    };
  }, [subs, advertiserUserIds]);

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Contabilidad (suscripciones activas)
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Suma estimada mensual basada en planes activos. Clasificación por “anunciante” si el usuario tiene perfil.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando contabilidad…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/40 bg-background/20 p-4">
                <div className="text-sm text-muted-foreground">Ingresos usuarios</div>
                <div className="text-2xl font-bold text-foreground">{eur(summary.visitorRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.visitorCount} suscripciones activas
                </div>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/20 p-4">
                <div className="text-sm text-muted-foreground">Ingresos anunciantes</div>
                <div className="text-2xl font-bold text-foreground">{eur(summary.advertiserRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.advertiserCount} suscripciones activas
                </div>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold text-foreground">{eur(summary.totalRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.totalCount} suscripciones activas
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Gratis</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>VIP</TableHead>
                  <TableHead className="text-right">Suma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(['visitantes', 'anunciantes'] as const).map((k) => (
                  <TableRow key={k}>
                    <TableCell className="font-medium">
                      {k === 'visitantes' ? 'Usuarios' : 'Anunciantes'}{' '}
                      <Badge variant="outline" className="ml-2 border-border/50 text-foreground">
                        {k}
                      </Badge>
                    </TableCell>
                    <TableCell>{summary.breakdown[k].free}</TableCell>
                    <TableCell>{summary.breakdown[k].premium}</TableCell>
                    <TableCell>{summary.breakdown[k].vip}</TableCell>
                    <TableCell className="text-right font-semibold">{eur(summary.breakdown[k].revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

