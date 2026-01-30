import {
  Star,
  BadgeCheck,
  Crown,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Globe,
  CalendarDays,
  Handshake,
  Ruler,
  Weight,
  Briefcase,
  Flag,
  Baby,
  ShieldCheck,
  ShieldOff,
  Hash,
} from 'lucide-react';
import { Profile, activityOptions } from '@/data/mockProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProfileInfoProps {
  profile: Profile;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const activities = profile.accompanimentTypes ?? [];
  const primaryActivity = activities[0];
  const activity = primaryActivity ? activityOptions.find((a) => a.id === primaryActivity) : null;
  const activitySuffix = activities.length > 1 ? ` +${activities.length - 1}` : '';

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
          {activity || primaryActivity ? (
            <div className="px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30">
              <span className="text-sm font-medium text-secondary-foreground">
                {activity ? `${activity.icon} ${activity.label}${activitySuffix}` : `✨ ${primaryActivity}${activitySuffix}`}
              </span>
            </div>
          ) : null}
          {profile.phoneVerified ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Teléfono verificado</span>
            </div>
          ) : null}
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

        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">
            {profile.city}
            {profile.zone ? <span className="text-muted-foreground"> · {profile.zone}</span> : null}
          </span>
          {profile.postalCode ? (
            <span className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-muted/40 border border-border/40">
              <Hash className="w-3 h-3" />
              {profile.postalCode}
            </span>
          ) : null}
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
          {profile.description?.trim()
            ? profile.description
            : 'Sin descripción todavía.'}
        </p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-3">
          <h3 className="font-display text-lg font-semibold">Información</h3>
          <div className="space-y-2 text-sm">
            {profile.nationality ? (
              <div className="flex items-start gap-2">
                <Flag className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <div className="text-muted-foreground">Nacionalidad</div>
                  <div className="text-foreground font-medium">{profile.nationality}</div>
                </div>
              </div>
            ) : null}
            {profile.birthPlace ? (
              <div className="flex items-start gap-2">
                <Baby className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <div className="text-muted-foreground">Nacimiento</div>
                  <div className="text-foreground font-medium">{profile.birthPlace}</div>
                </div>
              </div>
            ) : null}
            {profile.profession ? (
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <div className="text-muted-foreground">Profesión</div>
                  <div className="text-foreground font-medium">{profile.profession}</div>
                </div>
              </div>
            ) : null}
            {!profile.nationality && !profile.birthPlace && !profile.profession ? (
              <div className="text-muted-foreground">Sin información adicional.</div>
            ) : null}
          </div>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h3 className="font-display text-lg font-semibold">Idiomas</h3>
          {profile.languages?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="border-border/50 text-foreground">
                  <Globe className="w-3 h-3 mr-1 text-primary" />
                  {lang}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No especificados.</div>
          )}
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <h3 className="font-display text-lg font-semibold">Tipo de acompañamiento</h3>
        {profile.accompanimentTypes?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.accompanimentTypes.map((t) => (
              <Badge key={t} variant="outline" className="border-border/50 text-foreground">
                <Handshake className="w-3 h-3 mr-1 text-primary" />
                {t}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No especificado.</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-3">
          <h3 className="font-display text-lg font-semibold">Disponibilidad</h3>
          {profile.availableDays?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.availableDays.map((d) => (
                <Badge key={d} variant="outline" className="border-border/50 text-foreground">
                  <CalendarDays className="w-3 h-3 mr-1 text-primary" />
                  {d}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No especificada.</div>
          )}
          {profile.schedule ? (
            <div className="flex items-start gap-2 pt-2">
              <Clock className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <div className="text-muted-foreground text-sm">Horario</div>
                <div className="text-foreground font-medium">{profile.schedule}</div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-card p-4 space-y-3">
          <h3 className="font-display text-lg font-semibold">Características físicas</h3>
          <div className="space-y-2 text-sm">
            {profile.hairColor ? (
              <div className="text-muted-foreground">
                Color de pelo: <span className="text-foreground font-medium">{profile.hairColor}</span>
              </div>
            ) : null}
            {typeof profile.heightCm === 'number' && profile.heightCm > 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ruler className="w-4 h-4 text-primary" />
                <span>
                  Altura: <span className="text-foreground font-medium">{profile.heightCm} cm</span>
                </span>
              </div>
            ) : null}
            {typeof profile.weightKg === 'number' && profile.weightKg > 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Weight className="w-4 h-4 text-primary" />
                <span>
                  Peso: <span className="text-foreground font-medium">{profile.weightKg} kg</span>
                </span>
              </div>
            ) : null}
            {!profile.hairColor && !(typeof profile.heightCm === 'number' && profile.heightCm > 0) && !(typeof profile.weightKg === 'number' && profile.weightKg > 0) ? (
              <div className="text-muted-foreground">No especificadas.</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tags (si existen) */}
      {profile.tags?.length ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Etiquetas</h2>
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
      ) : null}

      <Separator className="bg-border/50" />

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

        {profile.phone ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {profile.phoneVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-green-400" />
                Teléfono verificado
              </>
            ) : (
              <>
                <ShieldOff className="w-4 h-4 text-muted-foreground" />
                Teléfono sin verificar
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
