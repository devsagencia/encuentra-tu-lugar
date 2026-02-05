'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const FAVORITE_LIMITS: Record<string, number> = {
  free: 0,
  premium: 50,
  vip: 9999, // ilimitado en la práctica
};

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setFavoriteIds([]);
      setLimit(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    const subRes = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle();
    const plan = subRes.data?.status === 'active' ? (subRes.data?.plan ?? 'free') : 'free';
    setLimit(FAVORITE_LIMITS[plan] ?? 0);

    const favRes = await supabase.from('favorites').select('profile_id').eq('user_id', user.id);
    if (favRes.error) {
      // Tabla favorites no existe (404) o RLS: tratar como sin favoritos para no romper la página
      setFavoriteIds([]);
    } else {
      setFavoriteIds((favRes.data ?? []).map((r) => r.profile_id));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = (profileId: string) => favoriteIds.includes(profileId);
  const count = favoriteIds.length;
  const canAdd = limit > count;
  const favoriteSet = new Set(favoriteIds);

  const add = useCallback(
    async (profileId: string) => {
      if (!user) return;
      if (favoriteIds.includes(profileId)) return;
      if (count >= limit) return;

      setTogglingId(profileId);
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, profile_id: profileId });
      setTogglingId(null);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      await load();
    },
    [user?.id, favoriteIds, count, limit, load]
  );

  const remove = useCallback(
    async (profileId: string) => {
      if (!user) return;

      setTogglingId(profileId);
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('profile_id', profileId);
      setTogglingId(null);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      await load();
    },
    [user?.id, load]
  );

  const toggle = useCallback(
    async (profileId: string) => {
      if (!user) return;
      if (favoriteIds.includes(profileId)) {
        await remove(profileId);
      } else {
        await add(profileId);
      }
    },
    [user, favoriteIds, add, remove]
  );

  return {
    favoriteIds,
    favoriteSet,
    count,
    limit,
    canAdd,
    isFavorite,
    add,
    remove,
    toggle,
    loading,
    togglingId,
    refresh: load,
  };
}
