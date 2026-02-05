'use client';

import { Star, Eye, BadgeCheck, Crown, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Profile, activityOptions } from '@/data/mockProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProfileCardProps {
  profile: Profile;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggle, canAdd, limit, togglingId, loading: favoritesLoading } = useFavorites();
  const activities = profile.accompanimentTypes ?? [];
  const fav = isFavorite(profile.id);
  const busy = togglingId === profile.id;
  const canFavorite = user && (fav || canAdd) && limit > 0;
  const primaryActivity = activities[0];
  const activity = primaryActivity ? activityOptions.find((a) => a.id === primaryActivity) : null;
  const activitySuffix = activities.length > 1 ? ` +${activities.length - 1}` : '';
  const plan = (profile.publicPlan || (profile.premium ? 'premium' : 'free')) as 'free' | 'premium' | 'vip';
  
  const handleViewProfile = () => {
    router.push(`/perfil/${profile.id}`);
  };
  
  return (
    <div className="glass-card group overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Views Counter */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{profile.views.toLocaleString()}</span>
        </div>

        {/* Favorito */}
        <div className="absolute top-3 right-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      router.push(`/auth?next=${encodeURIComponent(`/perfil/${profile.id}`)}`);
                      return;
                    }
                    if (canFavorite && !busy) toggle(profile.id);
                  }}
                  disabled={user ? !canFavorite || busy : false}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                    fav
                      ? 'bg-primary/90 text-primary-foreground'
                      : 'bg-background/80 text-muted-foreground hover:text-primary hover:bg-background/90'
                  } ${busy ? 'opacity-60 pointer-events-none' : ''}`}
                  aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {!user
                  ? 'Inicia sesión para guardar favoritos'
                  : fav
                    ? 'Quitar de favoritos'
                    : !canAdd && limit > 0
                      ? 'Límite de favoritos alcanzado'
                      : 'Añadir a favoritos'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Badges (fuera de la imagen) */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-border/50 text-foreground">
            {activity ? (
              <>
                <span className="text-muted-foreground">{activity.icon}</span> {activity.label}{activitySuffix}
              </>
            ) : primaryActivity ? (
              <>✨ {primaryActivity}{activitySuffix}</>
            ) : (
              <>✨ Social</>
            )}
          </Badge>

          {plan === 'vip' ? (
            <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30">👑 VIP</Badge>
          ) : plan === 'premium' ? (
            <Badge className="bg-primary/15 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          ) : null}
        </div>

        {/* Name & Verified */}
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl font-semibold text-foreground">
            {profile.name}
          </h3>
          {profile.age > 0 && (
            <span className="text-muted-foreground">{profile.age}</span>
          )}
          {profile.verified && (
            <BadgeCheck className="w-5 h-5 text-primary" />
          )}
        </div>
        
        {/* Location */}
        <p className="text-sm text-muted-foreground">📍 {profile.city}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(profile.rating)
                    ? 'text-primary fill-primary'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">{profile.rating}</span>
          <span className="text-sm text-muted-foreground">({profile.reviews} reseñas)</span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {profile.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {profile.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs border-border/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {profile.tags.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs border-border/50 text-muted-foreground"
            >
              +{profile.tags.length - 3}
            </Badge>
          )}
        </div>
        
        {/* View Button */}
        <Button 
          onClick={handleViewProfile}
          className="w-full mt-3"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver perfil
        </Button>
      </div>
    </div>
  );
};
