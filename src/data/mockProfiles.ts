export type Category = 'escort' | 'gay' | 'trans' | 'swinger' | 'club' | 'tienda';

export interface Profile {
  id: string;
  name: string;
  age: number;
  category: Category;
  city: string;
  description: string;
  image: string;
  images: string[];
  videos: string[];
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
  { id: 'escort', label: 'Escorts', icon: '💋' },
  { id: 'gay', label: 'Gay', icon: '🌈' },
  { id: 'trans', label: 'Trans', icon: '⚧️' },
  { id: 'swinger', label: 'Swinger', icon: '💑' },
  { id: 'club', label: 'Clubs', icon: '🎭' },
  { id: 'tienda', label: 'Tiendas', icon: '🛍️' },
];

export const spanishCities = [
  'Todas las ciudades',
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Málaga',
  'Bilbao',
  'Zaragoza',
  'Alicante',
  'Palma de Mallorca',
  'Granada',
  'Murcia',
  'Las Palmas',
  'Tenerife',
  'Ibiza',
  'Marbella',
  'San Sebastián',
];

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Valentina',
    age: 26,
    category: 'escort',
    city: 'Madrid',
    description: 'Elegante y sofisticada. Servicio exclusivo de alto nivel. Me encanta conocer gente interesante y disfrutar de buenas conversaciones. Disponible para cenas, eventos y compañía de calidad.',
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
    tags: ['VIP', 'Disponible 24h', 'Idiomas', 'Cenas'],
    phone: '+34 612 345 678',
    whatsapp: '+34 612 345 678',
    schedule: 'Lunes a Domingo, 10:00 - 02:00',
  },
  {
    id: '2',
    name: 'Marcos',
    age: 32,
    category: 'gay',
    city: 'Barcelona',
    description: 'Atlético y carismático. Experiencias únicas garantizadas. Persona educada y discreta para todo tipo de encuentros.',
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
    tags: ['Deportista', 'Viajes', 'Discreto'],
    phone: '+34 623 456 789',
    schedule: 'Lunes a Viernes, 18:00 - 00:00',
  },
  {
    id: '3',
    name: 'Luna',
    age: 28,
    category: 'trans',
    city: 'Valencia',
    description: 'Belleza única y personalidad encantadora. Experiencia completa y satisfacción garantizada.',
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
    tags: ['Premium', 'Bilingüe', 'Hotel'],
    whatsapp: '+34 634 567 890',
    schedule: 'Todos los días, 12:00 - 04:00',
  },
  {
    id: '4',
    name: 'Club Paraíso',
    age: 0,
    category: 'club',
    city: 'Ibiza',
    description: 'El club más exclusivo de la isla. Noches inolvidables con el mejor ambiente y la mejor música.',
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
    tags: ['VIP Area', 'Eventos', 'Reservas'],
    phone: '+34 971 123 456',
    schedule: 'Jueves a Domingo, 23:00 - 06:00',
  },
  {
    id: '5',
    name: 'Pareja Liberal',
    age: 35,
    category: 'swinger',
    city: 'Marbella',
    description: 'Pareja joven buscando nuevas experiencias. Discretos y respetuosos.',
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
    tags: ['Pareja', 'Discretos', 'Fiestas'],
    whatsapp: '+34 645 678 901',
  },
  {
    id: '6',
    name: 'Sensaciones Shop',
    age: 0,
    category: 'tienda',
    city: 'Madrid',
    description: 'Tu tienda erótica de confianza. Envío discreto 24h. Gran variedad de productos.',
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
    tags: ['Envío gratis', '24h', 'Online'],
    phone: '+34 910 234 567',
    schedule: 'Lunes a Sábado, 10:00 - 21:00',
  },
  {
    id: '7',
    name: 'Adriana',
    age: 24,
    category: 'escort',
    city: 'Sevilla',
    description: 'Joven y apasionada. Trato cercano y natural.',
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
    tags: ['Nueva', 'Fotos reales', 'Domicilio'],
    phone: '+34 656 789 012',
    schedule: 'Lunes a Viernes, 16:00 - 00:00',
  },
  {
    id: '8',
    name: 'Daniel',
    age: 29,
    category: 'gay',
    city: 'Madrid',
    description: 'Profesional discreto. Máxima confidencialidad garantizada.',
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
    tags: ['Ejecutivo', 'Hotel', 'Viajes'],
    whatsapp: '+34 667 890 123',
    schedule: 'Disponibilidad flexible',
  },
];
