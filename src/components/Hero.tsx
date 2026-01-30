import { Sparkles } from 'lucide-react';

export const Hero = ({
  stats,
}: {
  stats?: { activeProfiles: number; cities: number; satisfactionPercent: number };
}) => {
  const activeProfiles = stats?.activeProfiles ?? 0;
  const cities = stats?.cities ?? 0;
  const satisfactionPercent = stats?.satisfactionPercent ?? 0;

  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>
      
      <div className="relative container mx-auto px-4 text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            La plataforma líder en España
          </span>
        </div>
        
        {/* Title */}
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="text-foreground">Encuentra </span>
          <span className="gradient-text">Conexiones</span>
          <br />
          <span className="text-foreground">Exclusivas</span>
        </h1>
        
        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          Descubre personas y actividades para socializar con respeto, afinidad y comunicación.
          Tu privacidad y la seguridad son nuestra prioridad.
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 pt-8">
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
              {activeProfiles.toLocaleString('es-ES')}
            </div>
            <div className="text-sm text-muted-foreground">Perfiles activos</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
              {cities.toLocaleString('es-ES')}
            </div>
            <div className="text-sm text-muted-foreground">Ciudades</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold gradient-text">
              {Math.max(0, Math.min(100, Math.round(satisfactionPercent)))}%
            </div>
            <div className="text-sm text-muted-foreground">Satisfacción</div>
          </div>
        </div>
      </div>
    </div>
  );
};
