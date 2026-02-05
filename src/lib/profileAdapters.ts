import type { Profile, Category } from '@/data/mockProfiles';

type DbProfileRow = {
  id: string;
  name: string;
  age: number | null;
  category: string;
  city: string;
  description: string | null;
  zone?: string | null;
  postal_code?: string | null;
  languages?: string[] | null;
  available_days?: string[] | null;
  accompaniment_types?: string[] | null;
  hair_color?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  profession?: string | null;
  nationality?: string | null;
  birth_place?: string | null;
  image_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  views_count: number | null;
  verified: boolean | null;
  phone_verified?: boolean | null;
  public_plan?: string | null;
  premium: boolean | null;
  tags: string[] | null;
  phone: string | null;
  whatsapp: boolean | null;
  schedule: string | null;
  private_images_count?: number | null;
  private_videos_count?: number | null;
};

type DbMediaRow = {
  id: string;
  media_type: 'image' | 'video';
  public_url: string | null;
  storage_path: string;
  position: number;
};

// El campo `profiles.category` se mantiene por compatibilidad con datos antiguos,
// pero la plataforma ya no usa categorías explícitas. Normalizamos a 'social'.
export function toCategory(_value: string | null | undefined): Category {
  return 'social';
}

export function mediaPublicUrl(bucket: string, storagePath: string): string {
  // En este proyecto usamos bucket público, así que la URL de Supabase sirve directamente.
  // Si quieres hacerlo privado más adelante, habrá que cambiar a signed URLs.
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export function toProfileCardModel(profile: DbProfileRow, media: DbMediaRow[] = []): Profile {
  const imageMedia = media
    .filter((m) => m.media_type === 'image')
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const videoMedia = media
    .filter((m) => m.media_type === 'video')
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const images = imageMedia.map((m) => m.public_url || mediaPublicUrl('profile-media', m.storage_path));
  const videos = videoMedia.map((m) => m.public_url || mediaPublicUrl('profile-media', m.storage_path));

  const fallbackImage =
    profile.image_url || images[0] || '/placeholder.svg';

  return {
    id: profile.id,
    userId: profile.user_id,
    name: profile.name,
    age: profile.age ?? 0,
    category: toCategory(profile.category),
    city: profile.city,
    description: profile.description || '',
    image: fallbackImage,
    images: images.length ? images : [fallbackImage],
    videos,
    privateImagesCount: profile.private_images_count ?? 0,
    privateVideosCount: profile.private_videos_count ?? 0,
    rating: Number(profile.rating ?? 0),
    reviews: Number(profile.reviews_count ?? 0),
    views: Number(profile.views_count ?? 0),
    verified: Boolean(profile.verified),
    premium: Boolean(profile.premium),
    publicPlan:
      (profile.public_plan as 'free' | 'premium' | 'vip' | null | undefined) ??
      (profile.premium ? 'premium' : 'free'),
    tags: profile.tags ?? [],
    phone: profile.phone ?? undefined,
    whatsapp: profile.whatsapp ? (profile.phone ?? undefined) : undefined,
    whatsappEnabled: Boolean(profile.whatsapp),
    schedule: profile.schedule ?? undefined,

    zone: (profile.zone as string | null) ?? undefined,
    postalCode: (profile.postal_code as string | null) ?? undefined,
    languages: (profile.languages as string[] | null) ?? undefined,
    availableDays: (profile.available_days as string[] | null) ?? undefined,
    accompanimentTypes: (profile.accompaniment_types as string[] | null) ?? undefined,
    hairColor: (profile.hair_color as string | null) ?? undefined,
    heightCm: (profile.height_cm as number | null) ?? undefined,
    weightKg: (profile.weight_kg as number | null) ?? undefined,
    profession: (profile.profession as string | null) ?? undefined,
    nationality: (profile.nationality as string | null) ?? undefined,
    birthPlace: (profile.birth_place as string | null) ?? undefined,
    phoneVerified: Boolean(profile.phone_verified),
  };
}

