'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProfileCard } from '@/components/ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { toProfileCardModel } from '@/lib/profileAdapters';
import { type Profile } from '@/data/mockProfiles';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PROFILES_SELECT = `
  id,
  name,
  age,
  category,
  city,
  description,
  image_url,
  rating,
  reviews_count,
  views_count,
  verified,
  premium,
  public_plan,
  tags,
  phone,
  whatsapp,
  schedule,
  accompaniment_types,
  profile_media (
    id,
    media_type,
    visibility,
    public_url,
    storage_path,
    position
  )
`;

export default function FavoritosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { favoriteIds, count, limit, loading: favLoading } = useFavorites();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?next=/favoritos');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || favoriteIds.length === 0) {
        setProfiles([]);
        setFetching(false);
        return;
      }

      setFetching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILES_SELECT)
        .in('id', favoriteIds)
        .eq('status', 'approved');

      if (error) {
        setProfiles([]);
        setFetching(false);
        return;
      }

      const byId = new Map<string, Profile>();
      for (const row of data ?? []) {
        const p = toProfileCardModel(row, row.profile_media ?? []);
        byId.set(p.id, p);
      }
      const ordered = favoriteIds.map((id) => byId.get(id)).filter(Boolean) as Profile[];
      setProfiles(ordered);
      setFetching(false);
    };

    if (!favLoading) load();
  }, [user, favoriteIds, favLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            Mis favoritos
          </h1>
          <p className="text-muted-foreground mt-1">
            {limit >= 9999 ? 'Favoritos ilimitados (plan VIP).' : `Tienes ${count} de ${limit} favoritos guardados.`}
          </p>
        </div>

        {favLoading || fetching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Heart className="w-14 h-14 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aún no tienes favoritos</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {limit === 0
                ? 'El plan Gratis no incluye favoritos. Mejora a Premium o VIP para guardar perfiles.'
                : 'Cuando añadas perfiles a favoritos desde el listado o desde un perfil, aparecerán aquí.'}
            </p>
            {limit === 0 ? (
              <Button asChild>
                <Link href="/tarifas">Ver planes</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/">Explorar perfiles</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
