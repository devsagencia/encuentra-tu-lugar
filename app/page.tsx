'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SearchFilters } from '@/components/SearchFilters';
import { ProfileCard } from '@/components/ProfileCard';
import { mockProfiles, Category, Profile } from '@/data/mockProfiles';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toProfileCardModel } from '@/lib/profileAdapters';

export default function HomePage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [city, setCity] = useState('Todas las ciudades');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dbProfiles, setDbProfiles] = useState<Profile[]>([]);

  const clearFilters = () => {
    setKeyword('');
    setCategory('all');
    setCity('Todas las ciudades');
    setAgeRange([18, 60]);
  };

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
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
          tags,
          phone,
          whatsapp,
          schedule,
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
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Silencioso: si falla, seguimos mostrando demos
        console.error('Error loading public profiles:', error);
        return;
      }

      const mapped = (data ?? []).map((row: any) =>
        toProfileCardModel(row, row.profile_media ?? [])
      );

      setDbProfiles(mapped);
    };

    load();
  }, []);

  const allProfiles = useMemo(() => {
    // Mostrar primero reales, luego demos
    const seen = new Set<string>();
    const merged: Profile[] = [];
    for (const p of [...dbProfiles, ...mockProfiles]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      merged.push(p);
    }
    return merged;
  }, [dbProfiles]);

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      // Keyword filter
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        const matchesKeyword =
          profile.name.toLowerCase().includes(searchTerm) ||
          profile.description.toLowerCase().includes(searchTerm) ||
          profile.tags.some((tag) => tag.toLowerCase().includes(searchTerm));
        if (!matchesKeyword) return false;
      }

      // Category filter
      if (category !== 'all' && profile.category !== category) return false;

      // City filter
      if (city !== 'Todas las ciudades' && profile.city !== city) return false;

      // Age filter (skip for clubs and stores)
      if (profile.age > 0) {
        if (profile.age < ageRange[0] || profile.age > ageRange[1]) return false;
      }

      return true;
    });
  }, [allProfiles, keyword, category, city, ageRange]);

  const filterContent = (
    <SearchFilters
      keyword={keyword}
      setKeyword={setKeyword}
      category={category}
      setCategory={setCategory}
      city={city}
      setCity={setCity}
      ageRange={ageRange}
      setAgeRange={setAgeRange}
      onClear={clearFilters}
    />
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      <main className="container mx-auto px-4 pb-16">
        {/* Category Tabs */}
        <div className="mb-8">
          <CategoryTabs activeCategory={category} onCategoryChange={setCategory} />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full border-border">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background border-border p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-semibold">Filtros</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {filterContent}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">{filterContent}</div>
          </aside>

          {/* Profiles Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{filteredProfiles.length}</span>{' '}
                {filteredProfiles.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-xl text-muted-foreground mb-4">
                  No se encontraron resultados
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <Button onClick={clearFilters} className="bg-primary text-primary-foreground">
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
