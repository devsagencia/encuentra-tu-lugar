'use client';

import { activityOptions, Activity } from '@/data/mockProfiles';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  selected: Activity[];
  onToggle: (activity: Activity) => void;
  onClear: () => void;
}

export const CategoryTabs = ({ selected, onToggle, onClear }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={onClear}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
          selected.length === 0
            ? "bg-primary text-primary-foreground glow"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        ✨ Todos
      </button>
      {activityOptions.map((a) => {
        const isActive = selected.includes(a.id);
        return (
        <button
          key={a.id}
          onClick={() => onToggle(a.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            isActive
              ? "bg-primary text-primary-foreground glow"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {a.icon} {a.label}
        </button>
      )})}
    </div>
  );
};
