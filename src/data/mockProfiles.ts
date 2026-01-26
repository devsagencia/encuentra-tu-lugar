export type Category = 'escort' | 'gay' | 'trans' | 'swinger' | 'club' | 'tienda';

export interface Profile {
  id: string;
  name: string;
  age: number;
  category: Category;
  city: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  views: number;
  verified: boolean;
  premium: boolean;
  tags: string[];
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
    description: 'Elegante y sofisticada. Servicio exclusivo de alto nivel.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
    rating: 4.9,
    reviews: 127,
    views: 3420,
    verified: true,
    premium: true,
    tags: ['VIP', 'Disponible 24h'],
  },
  {
    id: '2',
    name: 'Marcos',
    age: 32,
    category: 'gay',
    city: 'Barcelona',
    description: 'Atlético y carismático. Experiencias únicas garantizadas.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    rating: 4.7,
    reviews: 89,
    views: 2180,
    verified: true,
    premium: false,
    tags: ['Deportista', 'Viajes'],
  },
  {
    id: '3',
    name: 'Luna',
    age: 28,
    category: 'trans',
    city: 'Valencia',
    description: 'Belleza única y personalidad encantadora.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
    rating: 4.8,
    reviews: 156,
    views: 4560,
    verified: true,
    premium: true,
    tags: ['Premium', 'Bilingüe'],
  },
  {
    id: '4',
    name: 'Club Paraíso',
    age: 0,
    category: 'club',
    city: 'Ibiza',
    description: 'El club más exclusivo de la isla. Noches inolvidables.',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=500&fit=crop',
    rating: 4.6,
    reviews: 342,
    views: 8900,
    verified: true,
    premium: true,
    tags: ['VIP Area', 'Eventos'],
  },
  {
    id: '5',
    name: 'Pareja Liberal',
    age: 35,
    category: 'swinger',
    city: 'Marbella',
    description: 'Pareja joven buscando nuevas experiencias.',
    image: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400&h=500&fit=crop',
    rating: 4.5,
    reviews: 67,
    views: 1890,
    verified: false,
    premium: false,
    tags: ['Pareja', 'Discretos'],
  },
  {
    id: '6',
    name: 'Sensaciones Shop',
    age: 0,
    category: 'tienda',
    city: 'Madrid',
    description: 'Tu tienda erótica de confianza. Envío discreto 24h.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
    rating: 4.8,
    reviews: 523,
    views: 12400,
    verified: true,
    premium: true,
    tags: ['Envío gratis', '24h'],
  },
  {
    id: '7',
    name: 'Adriana',
    age: 24,
    category: 'escort',
    city: 'Sevilla',
    description: 'Joven y apasionada. Trato cercano y natural.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
    rating: 4.6,
    reviews: 78,
    views: 2340,
    verified: true,
    premium: false,
    tags: ['Nueva', 'Fotos reales'],
  },
  {
    id: '8',
    name: 'Daniel',
    age: 29,
    category: 'gay',
    city: 'Madrid',
    description: 'Profesional discreto. Máxima confidencialidad.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    rating: 4.9,
    reviews: 201,
    views: 5670,
    verified: true,
    premium: true,
    tags: ['Ejecutivo', 'Hotel'],
  },
];
