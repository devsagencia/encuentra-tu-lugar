'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { activityOptions, spanishCities, type Activity } from '@/data/mockProfiles';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchFiltersProps {
  keyword: string;
  setKeyword: (value: string) => void;
  activities: Activity[];
  setActivities: (value: Activity[]) => void;
  city: string;
  setCity: (value: string) => void;
  ageRange: [number, number];
  setAgeRange: (value: [number, number]) => void;
  onClear: () => void;
}

export const SearchFilters = ({
  keyword,
  setKeyword,
  activities,
  setActivities,
  city,
  setCity,
  ageRange,
  setAgeRange,
  onClear,
}: SearchFiltersProps) => {
  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="font-display text-2xl font-semibold gradient-text">
        Buscar Anuncios
      </h2>
      
      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Palabra clave
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      
      {/* Actividades / intereses */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Actividades / intereses
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activityOptions.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={activities.includes(a.id)}
                onCheckedChange={() =>
                  setActivities(
                    activities.includes(a.id)
                      ? (activities.filter((x) => x !== a.id) as Activity[])
                      : ([...activities, a.id] as Activity[])
                  )
                }
              />
              <span className="text-muted-foreground">{a.icon}</span>
              {a.label}
            </label>
          ))}
        </div>
      </div>
      
      {/* City */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Ciudad
        </label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Seleccionar ciudad" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-60">
            {spanishCities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Age Range */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-muted-foreground">
            Rango de edad
          </label>
          <span className="text-sm text-primary font-medium">
            {ageRange[0]} - {ageRange[1]} años
          </span>
        </div>
        <Slider
          value={ageRange}
          onValueChange={(v) => setAgeRange(v as [number, number])}
          min={18}
          max={60}
          step={1}
          className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
        />
      </div>
      
      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={onClear}
        className="w-full border-border hover:bg-muted hover:text-foreground"
      >
        Limpiar filtros
      </Button>
    </div>
  );
};
