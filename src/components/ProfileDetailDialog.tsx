import { Star, Eye, BadgeCheck, Crown, MapPin, X } from 'lucide-react';
import { Profile, categories } from '@/data/mockProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProfileDetailDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileDetailDialog = ({ profile, open, onOpenChange }: ProfileDetailDialogProps) => {
  if (!profile) return null;
  
  const category = categories.find(c => c.id === profile.category);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border p-0">
        {/* Image Section */}
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {profile.premium && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm">
                <Crown className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-semibold text-primary-foreground">Premium</span>
              </div>
            )}
            <div className="px-3 py-1.5 rounded-full bg-secondary/90 backdrop-blur-sm">
              <span className="text-sm font-medium text-secondary-foreground">
                {category?.icon} {category?.label}
              </span>
            </div>
          </div>
          
          {/* Views Counter */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{profile.views.toLocaleString()} visitas</span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                {profile.name}
              </DialogTitle>
              {profile.age > 0 && (
                <span className="text-xl text-muted-foreground">{profile.age} años</span>
              )}
              {profile.verified && (
                <BadgeCheck className="w-6 h-6 text-primary" />
              )}
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{profile.city}</span>
            </div>
          </DialogHeader>
          
          {/* Rating */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(profile.rating)
                      ? 'text-primary fill-primary'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">{profile.rating}</span>
            <span className="text-muted-foreground">({profile.reviews} reseñas)</span>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Descripción</h3>
            <p className="text-muted-foreground leading-relaxed">
              {profile.description}
            </p>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Características</h3>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-sm border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Contact Button */}
          <Button className="w-full h-12 text-lg font-semibold">
            Contactar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
