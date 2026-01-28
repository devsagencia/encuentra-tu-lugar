import { Star, Eye, BadgeCheck, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Profile, categories } from '@/data/mockProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileCardProps {
  profile: Profile;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const navigate = useNavigate();
  const category = categories.find(c => c.id === profile.category);
  
  const handleViewProfile = () => {
    navigate(`/perfil/${profile.id}`);
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
        
        {/* Premium Badge */}
        {profile.premium && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
            <Crown className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs font-semibold text-primary-foreground">Premium</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-secondary/90 backdrop-blur-sm">
          <span className="text-xs font-medium text-secondary-foreground">
            {category?.icon} {category?.label}
          </span>
        </div>
        
        {/* Views Counter */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{profile.views.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
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
