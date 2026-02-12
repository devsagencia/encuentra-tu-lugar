'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Trash2, Upload, Image as ImageIcon, Video as VideoIcon, Crown } from 'lucide-react';

type MediaType = 'image' | 'video';
type MediaVisibility = 'public' | 'registered' | 'paid' | 'vip';

type MediaRow = {
  id: string;
  profile_id: string;
  media_type: MediaType;
  storage_path: string;
  public_url: string | null;
  position: number;
  visibility?: MediaVisibility;
  created_at: string;
};

const BUCKET = 'profile-media';

export function ProfileMediaManager({
  profileId,
  ownerUserId,
  disabledReason,
}: {
  profileId: string;
  ownerUserId: string;
  disabledReason?: string;
}) {
  const { toast } = useToast();
  // Nota: aunque el anuncio esté pendiente/no aprobado, permitimos preparar media y su visibilidad.
  // La aprobación solo afecta a la publicación pública (RLS / listados), no a la configuración del anunciante.
  const showPendingNotice = Boolean(disabledReason);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState<MediaType | null>(null);
  const [plan, setPlan] = useState<'free' | 'premium' | 'vip'>('free');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profile_media')
      .select('*')
      .eq('profile_id', profileId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: 'Error cargando media', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    setItems((data as MediaRow[]) ?? []);

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan,status')
      .eq('user_id', ownerUserId)
      .maybeSingle();
    const raw = (sub?.plan as string | undefined) || 'free';
    const active = sub?.status === 'active';
    // Normalizar: en BD el plan es "vip_anunciante", "premium_visitante", etc.
    const p: 'free' | 'premium' | 'vip' =
      !active ? 'free' : raw.includes('vip') ? 'vip' : raw.includes('premium') ? 'premium' : 'free';
    setPlan(p);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const nextPosition = useMemo(() => {
    return items.length ? Math.max(...items.map((i) => i.position)) + 1 : 0;
  }, [items]);

  const limits = useMemo(() => {
    // Límites por anuncio (perfil) según plan del anunciante
    // Nota: en este proyecto el anunciante tiene 1 perfil; si se añade multi-anuncio, habrá que adaptar.
    if (plan === 'vip') {
      return {
        image: { public: 15, registered: 25, vip: 25 },
        video: { public: 15, registered: 15, vip: 15 },
        allowRegistered: true,
        allowPaid: true,
        allowVip: true,
      };
    }
    if (plan === 'premium') {
      return {
        image: { public: 10, registered: 10, vip: 10 },
        video: { public: 5, registered: 5, vip: 5 },
        allowRegistered: true,
        allowPaid: true,
        allowVip: true,
      };
    }
    return {
      image: { public: 1, registered: 0, vip: 0 },
      video: { public: 0, registered: 0, vip: 0 },
      allowRegistered: false,
      allowPaid: false,
      allowVip: false,
    };
  }, [plan]);

  const counts = useMemo(() => {
    const init = {
      image: { public: 0, registered: 0, vip: 0 },
      video: { public: 0, registered: 0, vip: 0 },
    };
    for (const m of items) {
      const v = (m.visibility || 'public') as MediaVisibility;
      const type = m.media_type;
      // Para límites del anunciante usamos 3 "cubos":
      // - public
      // - registered (privado)
      // - vip (incluye vip y paid, porque son contenidos de pago)
      const bucket = v === 'paid' || v === 'vip' ? 'vip' : v;
      // Para conteo de límites usamos:
      // - public
      // - registered
      // - vip (incluye vip y paid, porque el plan especifica cupo VIP)
      if (bucket === 'public') init[type].public += 1;
      else if (bucket === 'registered') init[type].registered += 1;
      else init[type].vip += 1;
    }
    return init;
  }, [items]);

  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const handleFiles = async (type: MediaType, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(type);

    try {
      // Límite por plan (subida siempre entra como público inicialmente)
      const maxPublic = limits[type].public;
      if (maxPublic >= 0 && counts[type].public >= maxPublic) {
        toast({
          title: 'Límite alcanzado',
          description: `Tu plan (${plan.toUpperCase()}) permite ${maxPublic} ${type === 'image' ? 'foto(s)' : 'vídeo(s)'} públicas por anuncio.`,
          variant: 'destructive',
        });
        return;
      }

      // Subimos uno a uno para poder mostrar errores por archivo
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;

        const id = crypto.randomUUID();
        const safeName = file.name.replace(/[^\w.\-]+/g, '_');
        const storagePath = `${ownerUserId}/${profileId}/${type}/${id}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, {
            upsert: false,
            cacheControl: '3600',
          });

        if (uploadError) {
          // Bucket inexistente o permisos
          toast({
            title: 'Error subiendo archivo',
            description:
              uploadError.message +
              ' (Comprueba que existe el bucket "profile-media" en Supabase Storage y que tienes permisos).',
            variant: 'destructive',
          });
          continue;
        }

        const publicUrl = getPublicUrl(storagePath);

        const { error: insertError } = await supabase.from('profile_media').insert({
          profile_id: profileId,
          media_type: type,
          storage_path: storagePath,
          public_url: publicUrl,
          position: nextPosition + i,
          visibility: 'public',
        });

        if (insertError) {
          toast({
            title: 'Error guardando media',
            description: insertError.message,
            variant: 'destructive',
          });
        }
      }

      toast({ title: 'Subida completada', description: 'Tus archivos se han añadido al anuncio.' });
      await load();
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (row: MediaRow) => {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([row.storage_path]);
    if (removeError) {
      toast({ title: 'Error borrando del storage', description: removeError.message, variant: 'destructive' });
      return;
    }

    const { error: deleteError } = await supabase.from('profile_media').delete().eq('id', row.id);
    if (deleteError) {
      toast({ title: 'Error borrando registro', description: deleteError.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Archivo eliminado' });
    load();
  };

  const handleVisibilityChange = async (row: MediaRow, visibility: MediaVisibility) => {
    if (visibility === 'registered' && !limits.allowRegistered) {
      toast({ title: 'Requiere Premium', description: 'Para contenido privado necesitas Premium o VIP.', variant: 'destructive' });
      return;
    }
    if (visibility === 'paid' && !limits.allowPaid) {
      toast({ title: 'Requiere Premium', description: 'Para contenido Premium necesitas Premium o VIP.', variant: 'destructive' });
      return;
    }
    if (visibility === 'vip' && !limits.allowVip) {
      toast({ title: 'Requiere VIP', description: 'Para contenido VIP necesitas el plan VIP.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('profile_media')
      .update({ visibility })
      .eq('id', row.id);

    if (error) {
      toast({ title: 'No se pudo actualizar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Visibilidad actualizada' });
    load();
  };

  const visibilityBadge = (v?: MediaVisibility) => {
    switch (v) {
      case 'registered':
        return <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30">privado</Badge>;
      case 'paid':
        return <Badge className="bg-primary/15 text-primary border-primary/30">privado premium</Badge>;
      case 'vip':
        return <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30">privado VIP</Badge>;
      default:
        return <Badge className="bg-green-500/15 text-green-300 border-green-500/30">público</Badge>;
    }
  };

  return (
    <Card className="glass-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fotos y vídeos</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
          >
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPendingNotice ? (
          <div className="space-y-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Pendiente
            </Badge>
            <p className="text-sm text-muted-foreground">{disabledReason}</p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-border/40 bg-background/20 px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Plan actual:{' '}
            <span className="text-foreground font-medium">
              {plan === 'free' ? 'Gratis' : plan === 'premium' ? 'Premium' : 'VIP'}
            </span>
            {plan === 'free' ? (
              <span className="ml-2 text-xs">
                (Para usar <span className="font-medium">Privadas</span> o <span className="font-medium">Privadas VIP</span>, mejora tu plan.)
              </span>
            ) : null}
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/tarifas">
              <Crown className="w-4 h-4 mr-2" />
              Ver tarifas
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background/30 px-4 py-3 text-sm cursor-pointer hover:bg-background/40 transition-colors">
            <ImageIcon className="w-4 h-4" />
            {uploading === 'image' ? 'Subiendo…' : 'Subir fotos'}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading !== null}
              onChange={(e) => handleFiles('image', e.target.files)}
            />
          </label>
          <label className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background/30 px-4 py-3 text-sm cursor-pointer hover:bg-background/40 transition-colors">
            <VideoIcon className="w-4 h-4" />
            {uploading === 'video' ? 'Subiendo…' : 'Subir vídeos'}
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              disabled={uploading !== null}
              onChange={(e) => handleFiles('video', e.target.files)}
            />
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando media…</p>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No has subido fotos/vídeos todavía.
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Upload className="w-3 h-3" />
              Crea el bucket <span className="font-mono">profile-media</span> en Supabase Storage si aún no existe.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((m) => (
              <div key={m.id} className="relative rounded-lg overflow-hidden border border-border/40 bg-background/20">
                {m.media_type === 'image' ? (
                  <img
                    src={m.public_url || getPublicUrl(m.storage_path)}
                    alt="media"
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <video
                    src={m.public_url || getPublicUrl(m.storage_path)}
                    className="w-full h-40 object-cover"
                    controls
                  />
                )}
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background/60">
                      {m.media_type}
                    </Badge>
                    {visibilityBadge(m.visibility)}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleDelete(m)}
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="absolute bottom-2 left-2 right-2">
                  <Select
                    value={(m.visibility || 'public') as string}
                    onValueChange={(v) => handleVisibilityChange(m, v as MediaVisibility)}
                    disabled={false}
                  >
                    <SelectTrigger className="h-9 bg-background/70 backdrop-blur border-border/60">
                      <SelectValue placeholder="Visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Pública</SelectItem>
                      <SelectItem value="registered" disabled={!limits.allowRegistered}>
                        Privada (solo registrados)
                      </SelectItem>
                      <SelectItem value="paid" disabled={!limits.allowPaid}>
                        Privada Premium (suscripción activa)
                      </SelectItem>
                      <SelectItem value="vip" disabled={!limits.allowVip}>
                        Privada VIP 👑 (plan VIP)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

