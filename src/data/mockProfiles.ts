// Categoría legacy (se mantiene por compatibilidad con datos antiguos).
// La experiencia de navegación y filtros principales se basan en "actividades / intereses" (multi-select).
export type Category = 'social';

export const activityOptions = [
  { id: 'Amistad', label: 'Amistad', icon: '🤝' },
  { id: 'Salidas y ocio', label: 'Salidas y ocio', icon: '🎉' },
  { id: 'Viajes', label: 'Viajes', icon: '✈️' },
  { id: 'Eventos', label: 'Eventos', icon: '📅' },
  { id: 'Actividades culturales', label: 'Actividades culturales', icon: '🎭' },
  { id: 'Acompañamiento para eventos', label: 'Acompañamiento para eventos', icon: '🥂' },
  { id: 'Influencers / RRSS', label: 'Influencers / RRSS', icon: '📱' },
  { id: 'Modelaje', label: 'Modelaje', icon: '👗' },
  { id: 'Fotografía', label: 'Fotografía', icon: '📸' },
  { id: 'Networking', label: 'Networking', icon: '🧩' },
  { id: 'Personas afines', label: 'Personas afines', icon: '🫶' },
  { id: 'Compartir experiencias', label: 'Compartir experiencias', icon: '✨' },
  { id: 'Vida social', label: 'Vida social', icon: '🏙️' },
  { id: 'Comunidad local', label: 'Comunidad local', icon: '📍' },
] as const;

export type Activity = (typeof activityOptions)[number]['id'];

export interface Profile {
  id: string;
  /** user_id del anunciante (para no mostrar "Valorar" al dueño del perfil). */
  userId?: string;
  name: string;
  age: number;
  category: Category;
  city: string;
  description: string;
  image: string;
  images: string[];
  videos: string[];
  /** Número de imágenes con visibilidad no pública (para mostrar placeholders desenfocados). */
  privateImagesCount?: number;
  /** Número de vídeos con visibilidad no pública (para mostrar placeholders desenfocados). */
  privateVideosCount?: number;
  rating: number;
  reviews: number;
  views: number;
  verified: boolean;
  premium: boolean;
  tags: string[];
  phone?: string;
  whatsapp?: string;
  whatsappEnabled?: boolean;
  schedule?: string;
  publicPlan?: 'free' | 'premium' | 'vip';

  // Campos ampliados (anuncio real)
  zone?: string;
  postalCode?: string;
  languages?: string[];
  availableDays?: string[];
  accompanimentTypes?: string[];
  hairColor?: string;
  heightCm?: number;
  weightKg?: number;
  profession?: string;
  nationality?: string;
  birthPlace?: string;
  phoneVerified?: boolean;
}

export const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'social', label: 'Social', icon: '✨' },
];

export const spanishCities = [
  'Todas las ciudades',
  // Capitales de provincia (y ciudades autónomas)
  'A Coruña',
  'Albacete',
  'Alicante',
  'Almería',
  'Ávila',
  'Badajoz',
  'Barcelona',
  'Bilbao',
  'Burgos',
  'Cáceres',
  'Cádiz',
  'Castellón de la Plana',
  'Ceuta',
  'Ciudad Real',
  'Córdoba',
  'Cuenca',
  'Girona',
  'Granada',
  'Guadalajara',
  'Huelva',
  'Huesca',
  'Jaén',
  'Las Palmas de Gran Canaria',
  'León',
  'Lleida',
  'Logroño',
  'Lugo',
  'Madrid',
  'Málaga',
  'Melilla',
  'Mérida',
  'Murcia',
  'Ourense',
  'Oviedo',
  'Palencia',
  'Palma',
  'Pamplona',
  'Pontevedra',
  'Salamanca',
  'San Sebastián',
  'Santa Cruz de Tenerife',
  'Santander',
  'Santiago de Compostela',
  'Segovia',
  'Sevilla',
  'Soria',
  'Tarragona',
  'Teruel',
  'Toledo',
  'Valencia',
  'Valladolid',
  'Vitoria-Gasteiz',
  'Zamora',
  'Zaragoza',
];

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Valentina',
    age: 26,
    category: 'social',
    city: 'Madrid',
    description:
      'Me encanta conocer gente nueva y compartir planes: ocio, eventos y experiencias en la ciudad. Perfil orientado a socializar con respeto.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=1000&fit=crop',
    ],
    videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4',
    ],
    rating: 4.9,
    reviews: 127,
    views: 3420,
    verified: true,
    premium: true,
    publicPlan: 'vip',
    tags: ['Social', 'Eventos', 'Experiencias'],
    phone: '+34 612 345 678',
    whatsapp: '+34 612 345 678',
    schedule: 'Lunes a Domingo, 10:00 - 02:00',
    accompanimentTypes: ['Compartir experiencias', 'Salidas y ocio', 'Eventos', 'Vida social'],
  },
  {
    id: '2',
    name: 'Marcos',
    age: 32,
    category: 'social',
    city: 'Barcelona',
    description:
      'Busco conocer personas afines para planes y actividades (ocio, cultura y viajes). Comunicación clara y respetuosa.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
    ],
    videos: [],
    rating: 4.7,
    reviews: 89,
    views: 2180,
    verified: true,
    premium: false,
    publicPlan: 'free',
    tags: ['Viajes', 'Cultura', 'Social'],
    phone: '+34 623 456 789',
    schedule: 'Lunes a Viernes, 18:00 - 00:00',
    accompanimentTypes: ['Amistad', 'Viajes', 'Actividades culturales', 'Personas afines'],
  },
  {
    id: '3',
    name: 'Luna',
    age: 28,
    category: 'social',
    city: 'Valencia',
    description:
      'Me gusta crear comunidad y compartir experiencias. Disponible para salidas, eventos y actividades culturales.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop',
    ],
    videos: [],
    rating: 4.8,
    reviews: 156,
    views: 4560,
    verified: true,
    premium: true,
    publicPlan: 'premium',
    tags: ['Comunidad', 'Eventos', 'Social'],
    whatsapp: '+34 634 567 890',
    schedule: 'Todos los días, 12:00 - 04:00',
    accompanimentTypes: ['Comunidad local', 'Eventos', 'Compartir experiencias'],
  },
  {
    id: '4',
    name: 'Club Paraíso',
    age: 0,
    category: 'social',
    city: 'Ibiza',
    description:
      'Espacio social para eventos y comunidad local. Actividades para conocer gente y compartir intereses.',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=1000&fit=crop',
    ],
    videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4',
    ],
    rating: 4.6,
    reviews: 342,
    views: 8900,
    verified: true,
    premium: true,
    publicPlan: 'vip',
    tags: ['Eventos', 'Comunidad', 'Social'],
    phone: '+34 971 123 456',
    schedule: 'Jueves a Domingo, 23:00 - 06:00',
    accompanimentTypes: ['Eventos', 'Vida social', 'Comunidad local'],
  },
  {
    id: '5',
    name: 'Pareja Liberal',
    age: 35,
    category: 'social',
    city: 'Marbella',
    description:
      'Pareja buscando ampliar círculo social y compartir experiencias (viajes, ocio, eventos). Siempre con respeto.',
    image: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=800&h=1000&fit=crop',
    ],
    videos: [],
    rating: 4.5,
    reviews: 67,
    views: 1890,
    verified: false,
    premium: false,
    publicPlan: 'free',
    tags: ['Pareja', 'Ocio', 'Viajes'],
    whatsapp: '+34 645 678 901',
    accompanimentTypes: ['Compartir experiencias', 'Salidas y ocio', 'Viajes', 'Eventos'],
  },
  {
    id: '6',
    name: 'Sensaciones Shop',
    age: 0,
    category: 'social',
    city: 'Madrid',
    description:
      'Comunidad local y vida social: espacios y actividades para conocer gente y compartir intereses.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=1000&fit=crop',
    ],
    videos: [],
    rating: 4.8,
    reviews: 523,
    views: 12400,
    verified: true,
    premium: true,
    publicPlan: 'premium',
    tags: ['Comunidad', 'Local', 'Social'],
    phone: '+34 910 234 567',
    schedule: 'Lunes a Sábado, 10:00 - 21:00',
    accompanimentTypes: ['Comunidad local', 'Personas afines', 'Vida social'],
  },
  {
    id: '7',
    name: 'Adriana',
    age: 24,
    category: 'social',
    city: 'Sevilla',
    description:
      'Me gusta conocer gente y compartir planes de ocio y eventos. Perfil orientado a amistad y experiencias.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1000&fit=crop',
    ],
    videos: [],
    rating: 4.6,
    reviews: 78,
    views: 2340,
    verified: true,
    premium: false,
    publicPlan: 'free',
    tags: ['Amistad', 'Eventos', 'Ocio'],
    phone: '+34 656 789 012',
    schedule: 'Lunes a Viernes, 16:00 - 00:00',
    accompanimentTypes: ['Amistad', 'Salidas y ocio', 'Eventos', 'Vida social'],
  },
  {
    id: '8',
    name: 'Daniel',
    age: 29,
    category: 'social',
    city: 'Madrid',
    description:
      'Interesado en networking, vida social y planes culturales. Comunicación respetuosa y transparente.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop',
    ],
    videos: [],
    rating: 4.9,
    reviews: 201,
    views: 5670,
    verified: true,
    premium: true,
    publicPlan: 'vip',
    tags: ['Networking', 'Cultura', 'Viajes'],
    whatsapp: '+34 667 890 123',
    schedule: 'Disponibilidad flexible',
    accompanimentTypes: ['Networking', 'Actividades culturales', 'Viajes', 'Personas afines'],
  },
];
