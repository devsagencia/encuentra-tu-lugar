'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Crown, Heart, Lock, Star, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type PlanId = 'free' | 'premium' | 'vip';

const VISITANTE_PLANS = [
  {
    id: 'free' as const,
    title: 'Gratis',
    price: '0€',
    period: '',
    icon: Users,
    highlight: false,
    features: ['Ver anuncios públicos'],
  },
  {
    id: 'premium' as const,
    title: 'Premium',
    price: '19.99€',
    period: '/mes',
    icon: Star,
    highlight: true,
    features: [
      'Todo lo del plan Gratis',
      'Ver contenido privado (solo registrados)',
      'Ver contenido Premium (suscripción activa)',
      'Hasta 50 favoritos',
    ],
  },
  {
    id: 'vip' as const,
    title: 'VIP',
    price: '39.99€',
    period: '/mes',
    icon: Crown,
    highlight: false,
    badge: '👑 VIP',
    features: [
      'Todo lo del plan Premium',
      'Ver contenido VIP 👑',
      'Favoritos ilimitados',
      'Sin publicidad',
      'Notificaciones prioritarias',
      'Soporte prioritario',
    ],
  },
] as const;

const ANUNCIANTE_PLANS = [
  {
    id: 'free' as const,
    title: 'Gratis',
    price: '0€',
    period: '',
    icon: Heart,
    highlight: false,
    features: [
      '1 anuncio activo',
      '1 foto por anuncio (pública)',
      'Duración 30 días',
    ],
  },
  {
    id: 'premium' as const,
    title: 'Premium',
    price: '29.99€',
    period: '/mes',
    icon: Star,
    highlight: true,
    features: [
      '1 anuncio activo',
      '10 fotos públicas + 10 privadas + 10 VIP por anuncio',
      '5 vídeos públicos + 5 privados + 5 VIP por anuncio',
      'Badge ⭐ PREMIUM verificado',
      'Estadísticas',
    ],
  },
  {
    id: 'vip' as const,
    title: 'VIP',
    price: '59.99€',
    period: '/mes',
    icon: Crown,
    highlight: false,
    badge: '👑 VIP',
    features: [
      '1 anuncio activo',
      '15 fotos públicas + 25 privadas + 25 VIP por anuncio',
      '15 vídeos públicos + 15 privados + 15 VIP por anuncio',
      'Posición destacada TOP',
      'Badge 👑 VIP verificado',
      'Soporte prioritario',
    ],
  },
] as const;

function PlanCard({
  id,
  title,
  price,
  period,
  icon: Icon,
  highlight,
  badge,
  features,
  onSelect,
  loading,
}: {
  id: PlanId;
  title: string;
  price: string;
  period?: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
  features: string[];
  onSelect: (id: PlanId) => void;
  loading: boolean;
}) {
  return (
    <Card className={`glass-card border-border ${highlight ? 'ring-1 ring-primary/40' : ''}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/15' : 'bg-muted/40'}`}>
              <Icon className={`w-5 h-5 ${highlight ? 'text-primary' : 'text-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-xl font-display">{title}</CardTitle>
              {badge ? (
                <Badge className="mt-1 bg-purple-500/15 text-purple-300 border-purple-500/30">{badge}</Badge>
              ) : null}
            </div>
          </div>
          {highlight ? (
            <Badge className="bg-primary/15 text-primary border-primary/30">Recomendado</Badge>
          ) : null}
        </div>

        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-foreground">{price}</span>
          {period ? <span className="text-muted-foreground pb-1">{period}</span> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button
          className={`w-full ${highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
          variant={highlight ? 'default' : 'outline'}
          onClick={() => onSelect(id)}
          disabled={loading}
        >
          {loading ? 'Procesando…' : id === 'free' ? 'Usar Gratis' : `Elegir ${title}`}
        </Button>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Activación inmediata en modo demo (sin pasarela de pago).
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuscripcionPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState<PlanId | null>(null);

  const canUse = useMemo(() => !loading && Boolean(user), [loading, user]);

  const setPlan = async (plan: PlanId) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas una cuenta para activar una suscripción.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(plan);
    const { error } = await supabase.from('subscriptions').upsert(
      {
        user_id: user.id,
        plan,
        status: plan === 'free' ? 'inactive' : 'active',
      },
      { onConflict: 'user_id' }
    );
    setSaving(null);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Suscripción actualizada',
      description: plan === 'free' ? 'Plan Gratis activado.' : `Plan ${plan.toUpperCase()} activado.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Suscripciones</h1>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a tu experiencia. Puedes cambiarlo cuando quieras.
          </p>
          {!canUse ? (
            <div className="text-sm text-muted-foreground">
              Para activar Premium/VIP necesitas iniciar sesión.
            </div>
          ) : null}
        </div>

        <Tabs defaultValue="visitantes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="visitantes">Visitantes</TabsTrigger>
            <TabsTrigger value="anunciantes">Anunciantes</TabsTrigger>
          </TabsList>

          <TabsContent value="visitantes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VISITANTE_PLANS.map((p) => (
                <PlanCard
                  key={p.id}
                  {...p}
                  onSelect={setPlan}
                  loading={saving === p.id}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anunciantes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ANUNCIANTE_PLANS.map((p) => (
                <PlanCard
                  key={p.id}
                  {...p}
                  onSelect={setPlan}
                  loading={saving === p.id}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

