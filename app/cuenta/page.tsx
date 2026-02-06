'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, ShieldOff, CreditCard, PhoneCall, Info, Heart, User, Upload } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { ProfileMediaManager } from '@/components/profile/ProfileMediaManager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, session, loading } = useAuth();
  const { count: favoritesCount, limit: favoritesLimit } = useFavorites();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [fetching, setFetching] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const syncDoneRef = useRef(false);

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

  // Al volver de Stripe con éxito, sincronizar suscripción en nuestra BD (por si el webhook no llegó)
  useEffect(() => {
    const stripeSuccess = searchParams.get('stripe') === 'success';
    const sessionId = searchParams.get('session_id');
    if (!stripeSuccess || !sessionId || !user || syncDoneRef.current) return;
    syncDoneRef.current = true;

    (async () => {
      try {
        const res = await fetch('/api/sync-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, user_id: user.id }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await load();
          router.replace('/cuenta', { scroll: false });
          toast({ title: 'Suscripción activada', description: 'Tu perfil ya aparece como Premium.' });
        } else {
          toast({
            title: 'No se pudo sincronizar la suscripción',
            description: (data?.error as string) || 'Intenta pulsar Actualizar en la sección Suscripción.',
            variant: 'destructive',
          });
        }
      } catch (e) {
        toast({
          title: 'Error de conexión',
          description: 'No se pudo verificar la suscripción. Pulsa Actualizar en Suscripción.',
          variant: 'destructive',
        });
      }
    })();
  }, [user, session, searchParams, router, toast, load]);

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

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato no válido', description: 'Sube una imagen (JPG, PNG, etc.).', variant: 'destructive' });
      return;
    }
    setAvatarUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('profile-media').upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Error al subir', description: uploadError.message, variant: 'destructive' });
      setAvatarUploading(false);
      return;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-media/${path}`;
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) {
      toast({ title: 'Error al guardar', description: updateError.message, variant: 'destructive' });
      setAvatarUploading(false);
      return;
    }
    toast({ title: 'Foto actualizada', description: 'Tu foto de perfil se verá en el header.' });
    setAvatarUploading(false);
    e.target.value = '';
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard usuario</h1>
          <p className="text-muted-foreground mt-1">
            Accede a tu cuenta. Si quieres anunciarte, podrás crear tu perfil desde aquí.
          </p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Foto de perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt="Tu foto" />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-medium">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Esta foto se muestra en el header cuando inicias sesión. Solo tú la ves.
              </p>
              <label className={avatarUploading ? 'pointer-events-none opacity-70' : ''}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {avatarUploading ? 'Subiendo…' : 'Subir foto'}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-red-500/35 bg-red-500/10 p-5 gradient-border">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/25">
              <Info className="h-5 w-5 text-red-300" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-semibold text-foreground">Aviso importante</div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            <span className="font-medium text-foreground">
              Contactalia no permite ni facilita servicios de carácter sexual.
            </span>{' '}
            Las funcionalidades de la plataforma no implican encuentros íntimos ni servicios sexuales a cambio de dinero.
          </p>
          <div className="mt-3">
            <Button asChild variant="secondary" size="sm" className="bg-red-500/15 text-red-100 border border-red-500/25 hover:bg-red-500/20">
              <Link href="/informacion">Leer información completa de la plataforma</Link>
            </Button>
          </div>
            </div>
          </div>
        </div>

        <Card className="glass-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{profile ? 'Tu perfil de anunciante' : 'Tu cuenta'}</CardTitle>
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
                  Actualmente eres <span className="text-foreground font-medium">visitante</span>. Si quieres anunciarte,
                  crea tu perfil de anunciante.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => router.push('/crear-anuncio')}>Crear anuncio</Button>
                  <Button variant="outline" onClick={() => router.push('/tarifas')}>
                    Ver tarifas
                  </Button>
                </div>
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

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Mis favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {favoritesLimit >= 9999
                ? `Tienes ${favoritesCount} perfiles guardados (ilimitados con VIP).`
                : `Tienes ${favoritesCount} de ${favoritesLimit} favoritos.`}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/favoritos">Ver mis favoritos</Link>
            </Button>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Suscripción
            </CardTitle>
            <Button variant="outline" size="sm" onClick={load} disabled={fetching}>
              Actualizar
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {subscription ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Plan: <span className="text-foreground font-medium">
                      {subscription.plan.includes('vip') ? 'VIP' : subscription.plan.includes('premium') ? 'Premium' : subscription.plan}
                      {subscription.plan.includes('_') ? ` (${subscription.plan.split('_')[1]})` : ''}
                    </span>
                  </p>
                  {subscription.status === 'active' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Estado: <span className="text-foreground font-medium">{subscription.status}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Fin de periodo: {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '-'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No hay suscripción registrada (por defecto: free/inactiva).
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Si acabas de pagar, pulsa &quot;Actualizar&quot; arriba. Si sigue sin aparecer, en Stripe → Developers → Webhooks revisa &quot;Recent deliveries&quot; para ver si el webhook se está llamando.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

