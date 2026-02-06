'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flag } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toProfileCardModel } from '@/lib/profileAdapters';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'fake', label: 'Perfil falso o suplantación' },
  { value: 'harassment', label: 'Acoso o comportamiento inadecuado' },
  { value: 'other', label: 'Otro' },
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading } = useAuth();
  const { isFavorite, toggle, canAdd, limit, togglingId } = useFavorites();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const viewRecordedRef = useRef(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const fav = profile ? isFavorite(profile.id) : false;
  const canFavorite = user && (fav || (canAdd && limit > 0));
  const busy = profile ? togglingId === profile.id : false;
  const canReport = Boolean(user && profile && profile.userId !== user.id);

  const refetchProfile = async () => {
    if (!id) return;
    const sel = 'id,user_id,name,age,category,city,description,zone,postal_code,languages,available_days,accompaniment_types,hair_color,height_cm,weight_kg,profession,nationality,birth_place,image_url,rating,reviews_count,views_count,verified,phone_verified,premium,public_plan,tags,phone,whatsapp,schedule,status,profile_media(id,media_type,visibility,public_url,storage_path,position)';
    const { data } = await supabase.from('profiles').select(sel).eq('id', id).maybeSingle();
    if (data?.id) {
      const row = data as any;
      if (row.private_images_count == null) row.private_images_count = 0;
      if (row.private_videos_count == null) row.private_videos_count = 0;
      setProfile(toProfileCardModel(row, row.profile_media ?? []));
    }
  };

  useEffect(() => {
    const load = async () => {
      setFetching(true);

      const selectWithCounts = `
        id,
        user_id,
        name,
        age,
        category,
        city,
        description,
        zone,
        postal_code,
        languages,
        available_days,
        accompaniment_types,
        hair_color,
        height_cm,
        weight_kg,
        profession,
        nationality,
        birth_place,
        image_url,
        rating,
        reviews_count,
        views_count,
        verified,
        phone_verified,
        premium,
        public_plan,
        private_images_count,
        private_videos_count,
        tags,
        phone,
        whatsapp,
        schedule,
        status,
        profile_media (
          id,
          media_type,
          visibility,
          public_url,
          storage_path,
          position
        )
      `;

      const selectWithoutCounts = `
        id,
        user_id,
        name,
        age,
        category,
        city,
        description,
        zone,
        postal_code,
        languages,
        available_days,
        accompaniment_types,
        hair_color,
        height_cm,
        weight_kg,
        profession,
        nationality,
        birth_place,
        image_url,
        rating,
        reviews_count,
        views_count,
        verified,
        phone_verified,
        premium,
        public_plan,
        tags,
        phone,
        whatsapp,
        schedule,
        status,
        profile_media (
          id,
          media_type,
          visibility,
          public_url,
          storage_path,
          position
        )
      `;

      let data: any = null;
      let error: any = null;

      const res = await supabase
        .from('profiles')
        .select(selectWithCounts)
        .eq('id', id)
        .maybeSingle();

      data = res.data;
      error = res.error;

      // Si falla (p. ej. columnas private_*_count no existen porque no se ha ejecutado la migración), reintentar sin ellas
      const isColumnError =
        error &&
        (res.error?.code === 'PGRST204' ||
          res.error?.code === '42703' ||
          res.error?.message?.includes('column') ||
          res.error?.message?.includes('private_images_count') ||
          res.error?.message?.includes('private_videos_count') ||
          (res.error as any)?.status === 400);
      if (isColumnError) {
        const fallback = await supabase
          .from('profiles')
          .select(selectWithoutCounts)
          .eq('id', id)
          .maybeSingle();
        if (!fallback.error) {
          data = fallback.data;
          error = null;
          if (data) {
            data.private_images_count = 0;
            data.private_videos_count = 0;
          }
        }
      }

      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
        setFetching(false);
        return;
      }

      if (!data) {
        setProfile(null);
        setFetching(false);
        return;
      }

      const mapped = toProfileCardModel(data, data.profile_media ?? []);
      setProfile(mapped);
      setFetching(false);

      if (!viewRecordedRef.current) {
        viewRecordedRef.current = true;
        void Promise.resolve(supabase.rpc('record_profile_view', { p_profile_id: id }))
          .then(() => {
            setProfile((prev: any) => prev ? { ...prev, views: (prev.views ?? 0) + 1 } : null);
          })
          .catch(() => { /* RPC no existe si no se ha ejecutado la migración 20260130011000 */ });
      }
    };

    if (!loading) load();
  }, [id, loading]);

  if (fetching) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Cargando perfil…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Perfil no encontrado</h1>
          <Button onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back + Favorito + Reportar */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            {canReport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportOpen(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Flag className="w-4 h-4 mr-1" />
                Reportar
              </Button>
            )}
            {user && limit > 0 && (
              <Button
                variant={fav ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggle(profile.id)}
                disabled={!canAdd && !fav}
                className={fav ? 'gap-2' : 'gap-2'}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                {fav ? 'En favoritos' : 'Añadir a favoritos'}
              </Button>
            )}
            {user && limit === 0 && !fav && (
              <span className="text-sm text-muted-foreground">Plan Gratis: sin favoritos. <Link href="/tarifas" className="text-primary hover:underline">Mejorar plan</Link></span>
            )}
          </div>
        </div>

        {/* Diálogo Reportar */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reportar perfil</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user || !profile || reportSubmitting) return;
                setReportSubmitting(true);
                const { error } = await supabase.from('reports').insert({
                  reporter_id: user.id,
                  profile_id: profile.id,
                  reason: reportReason,
                  description: reportDescription.trim() || null,
                });
                setReportSubmitting(false);
                if (error) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                  return;
                }
                toast({ title: 'Reporte enviado', description: 'Revisaremos tu reporte. Gracias.' });
                setReportOpen(false);
                setReportReason('spam');
                setReportDescription('');
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Detalles (opcional)</Label>
                <Textarea
                  placeholder="Añade más información si lo deseas..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={reportSubmitting}>
                  {reportSubmitting ? 'Enviando…' : 'Enviar reporte'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Column */}
          <div className="order-1">
            <ProfileGallery
              images={profile.images}
              videos={profile.videos}
              name={profile.name}
              privateImagesCount={profile.privateImagesCount ?? 0}
              privateVideosCount={profile.privateVideosCount ?? 0}
              showPrivateBlurred={!user}
            />
          </div>

          {/* Info Column */}
          <div className="order-2">
            <div className="lg:sticky lg:top-24">
              <ProfileInfo
                profile={profile}
                currentUserId={user?.id}
                profileId={profile.id}
                onRated={refetchProfile}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
