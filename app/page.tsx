'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SearchFilters } from '@/components/SearchFilters';
import { ProfileCard } from '@/components/ProfileCard';
import { type Activity, Profile } from '@/data/mockProfiles';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toProfileCardModel } from '@/lib/profileAdapters';

export default function HomePage() {
  const [keyword, setKeyword] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [city, setCity] = useState('Todas las ciudades');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dbProfiles, setDbProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroStats, setHeroStats] = useState<{ activeProfiles: number; cities: number; satisfactionPercent: number }>({
    activeProfiles: 0,
    cities: 0,
    satisfactionPercent: 0,
  });

  const clearFilters = () => {
    setKeyword('');
    setActivities([]);
    setCity('Todas las ciudades');
    setAgeRange([18, 60]);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
        `
        )
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading public profiles:', error);
        setDbProfiles([]);
        setLoading(false);
        return;
      }

      const mapped = (data ?? []).map((row: any) =>
        toProfileCardModel(row, row.profile_media ?? [])
      );

      setDbProfiles(mapped);
      setLoading(false);

      // Stats reales para el Hero (basadas en perfiles aprobados cargados)
      const activeProfiles = mapped.length;
      const citySet = new Set<string>();
      let ratingSum = 0;
      let ratingCount = 0;
      for (const p of mapped) {
        if (p.city) citySet.add(p.city);
        if (typeof p.rating === 'number' && p.rating > 0) {
          ratingSum += p.rating;
          ratingCount += 1;
        }
      }
      const avgRating = ratingCount ? ratingSum / ratingCount : 0;
      const satisfactionPercent = avgRating ? (avgRating / 5) * 100 : 0;
      setHeroStats({
        activeProfiles,
        cities: citySet.size,
        satisfactionPercent,
      });
    };

    load();
  }, []);

  const allProfiles = useMemo(() => dbProfiles, [dbProfiles]);

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

      // Actividades / intereses (multi-select): si hay filtros, debe coincidir al menos uno
      if (activities.length) {
        const selected = new Set(activities);
        const profileActs = profile.accompanimentTypes ?? [];
        const matches = profileActs.some((a) => selected.has(a as Activity));
        if (!matches) return false;
      }

      // City filter
      if (city !== 'Todas las ciudades' && profile.city !== city) return false;

      // Age filter (skip for clubs and stores)
      if (profile.age > 0) {
        if (profile.age < ageRange[0] || profile.age > ageRange[1]) return false;
      }

      return true;
    });
  }, [allProfiles, keyword, activities, city, ageRange]);

  const filterContent = (
    <SearchFilters
      keyword={keyword}
      setKeyword={setKeyword}
      activities={activities}
      setActivities={setActivities}
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
      <Hero stats={heroStats} />

      <main className="container mx-auto px-4 pb-16">
        {/* Category Tabs */}
        <div className="mb-8">
          <CategoryTabs selected={activities} onToggle={(a) => setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))} onClear={() => setActivities([])} />
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

            {loading ? (
              <div className="glass-card p-12 text-center">
                <p className="text-xl text-muted-foreground">Cargando resultados…</p>
              </div>
            ) : filteredProfiles.length > 0 ? (
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
