'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, ShieldOff, CreditCard, PhoneCall } from 'lucide-react';
import { ProfileMediaManager } from '@/components/profile/ProfileMediaManager';

type ProfileRow = {
  id: string;
  name: string;
  status: string | null;
  verified: boolean | null;
  phone_verified?: boolean | null;
  premium: boolean | null;
  created_at: string;
  updated_at: string;
};

type SubscriptionRow = {
  plan: string;
  status: 'inactive' | 'active' | 'past_due' | 'canceled';
  current_period_end: string | null;
};

export default function CuentaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth?next=/cuenta');
  }, [loading, user, router]);

  const load = async () => {
    if (!user) return;
    setFetching(true);

    const { data: p, error: pErr } = await supabase
      .from('profiles')
      .select('id,name,status,verified,phone_verified,premium,created_at,updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pErr) {
      toast({ title: 'Error cargando tu anuncio', description: pErr.message, variant: 'destructive' });
      setFetching(false);
      return;
    }

    setProfile((p as ProfileRow) ?? null);

    const { data: s } = await supabase
      .from('subscriptions')
      .select('plan,status,current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    setSubscription((s as SubscriptionRow) ?? null);
    setFetching(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const statusBadge = useMemo(() => {
    const status = profile?.status ?? 'pending';
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Suspendido
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  }, [profile?.status]);

  const verifiedBadge = useMemo(() => {
    return profile?.verified ? (
      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
        <ShieldCheck className="w-3 h-3 mr-1" />
        Verificado
      </Badge>
    ) : (
      <Badge className="bg-muted text-muted-foreground border-border/40">
        <ShieldOff className="w-3 h-3 mr-1" />
        Sin verificar
      </Badge>
    );
  }, [profile?.verified]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Panel anunciante</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu anuncio y tu suscripción.</p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tu anuncio</CardTitle>
            <Button variant="outline" size="sm" onClick={load} disabled={fetching}>
              Actualizar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fetching ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : !profile ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Aún no has creado ningún anuncio.
                </p>
                <Button onClick={() => router.push('/crear-anuncio')}>Crear anuncio</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{profile.name}</span>
                  {statusBadge}
                  {verifiedBadge}
                  {profile.phone_verified ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <PhoneCall className="w-3 h-3 mr-1" />
                      Teléfono verificado
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-border/40">
                      <PhoneCall className="w-3 h-3 mr-1" />
                      Teléfono sin verificar
                    </Badge>
                  )}
                  {profile.premium ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30">Premium</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Última actualización: {new Date(profile.updated_at).toLocaleString()}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => router.push('/crear-anuncio')}>Editar anuncio</Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/perfil/${profile.id}`)}
                  >
                    Ver mi anuncio
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    Ir al inicio
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {profile && user ? (
          <ProfileMediaManager
            profileId={profile.id}
            ownerUserId={user.id}
            disabledReason={
              profile.status !== 'approved'
                ? 'Tu anuncio no está aprobado todavía. Puedes preparar fotos/vídeos, pero no se mostrarán públicamente hasta que el admin lo apruebe.'
                : undefined
            }
          />
        ) : null}

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {subscription ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Plan: <span className="text-foreground font-medium">{subscription.plan}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Estado: <span className="text-foreground font-medium">{subscription.status}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Fin de periodo: {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '-'}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay suscripción registrada (por defecto: free/inactiva).
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

