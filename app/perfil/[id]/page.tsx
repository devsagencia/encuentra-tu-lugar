'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toProfileCardModel } from '@/lib/profileAdapters';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
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
        `
        )
        .eq('id', id)
        .maybeSingle();

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

      // Si no está aprobado, solo lo podrá ver el dueño (o admin/moderator por RLS).
      // RLS ya protege; aquí solo convertimos.
      setProfile(toProfileCardModel(data as any, (data as any).profile_media ?? []));
      setFetching(false);
    };

    // Espera a que sepamos si hay usuario (para evitar parpadeos en algunos casos).
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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Column */}
          <div className="order-1">
            <ProfileGallery
              images={profile.images}
              videos={profile.videos}
              name={profile.name}
            />
          </div>

          {/* Info Column */}
          <div className="order-2">
            <div className="lg:sticky lg:top-24">
              <ProfileInfo profile={profile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
