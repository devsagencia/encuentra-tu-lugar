import { Star, BadgeCheck, Crown, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { Profile, categories } from '@/data/mockProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProfileInfoProps {
  profile: Profile;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const category = categories.find(c => c.id === profile.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {profile.premium && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Premium</span>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30">
            <span className="text-sm font-medium text-secondary-foreground">
              {category?.icon} {category?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {profile.name}
          </h1>
          {profile.age > 0 && (
            <span className="text-2xl text-muted-foreground">{profile.age} años</span>
          )}
          {profile.verified && (
            <BadgeCheck className="w-7 h-7 text-primary" />
          )}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">{profile.city}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-3">
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
          <span className="text-xl font-bold text-foreground">{profile.rating}</span>
          <span className="text-muted-foreground">({profile.reviews} reseñas)</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {profile.views.toLocaleString()} visitas al perfil
        </p>
      </div>

      <Separator className="bg-border/50" />

      {/* Description */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Sobre mí</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {profile.description}
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Características</h2>
        <div className="flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-sm px-3 py-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Schedule */}
      {profile.schedule && (
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Horario</h3>
            <p className="text-muted-foreground">{profile.schedule}</p>
          </div>
        </div>
      )}

      {/* Contact Buttons */}
      <div className="space-y-3 pt-4">
        {profile.phone && (
          <Button 
            asChild 
            className="w-full h-12 text-lg font-semibold"
          >
            <a href={`tel:${profile.phone}`}>
              <Phone className="w-5 h-5 mr-2" />
              Llamar ahora
            </a>
          </Button>
        )}
        
        {profile.whatsapp && (
          <Button 
            asChild 
            variant="outline"
            className="w-full h-12 text-lg font-semibold border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400"
          >
            <a 
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
          </Button>
        )}

        {!profile.phone && !profile.whatsapp && (
          <Button className="w-full h-12 text-lg font-semibold">
            Contactar
          </Button>
        )}
      </div>
    </div>
  );
};
