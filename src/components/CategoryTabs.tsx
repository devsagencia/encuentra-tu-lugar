'use client';

import { categories, Category } from '@/data/mockProfiles';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onCategoryChange('all')}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
          activeCategory === 'all'
            ? "bg-primary text-primary-foreground glow"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        ✨ Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            activeCategory === cat.id
              ? "bg-primary text-primary-foreground glow"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  );
};
