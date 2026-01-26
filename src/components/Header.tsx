import { Heart, Menu, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <span className="font-display text-xl font-bold gradient-text hidden sm:inline">
            Contactos España
          </span>
        </a>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cómo funciona
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Tarifas
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </a>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            Iniciar sesión
          </Button>
          <Button 
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Publicar anuncio</span>
            <span className="sm:hidden">Publicar</span>
          </Button>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background border-border">
              <nav className="flex flex-col gap-4 mt-8">
                <a href="#" className="text-lg text-foreground hover:text-primary transition-colors">
                  Inicio
                </a>
                <a href="#" className="text-lg text-foreground hover:text-primary transition-colors">
                  Cómo funciona
                </a>
                <a href="#" className="text-lg text-foreground hover:text-primary transition-colors">
                  Tarifas
                </a>
                <a href="#" className="text-lg text-foreground hover:text-primary transition-colors">
                  Contacto
                </a>
                <hr className="border-border" />
                <a href="#" className="text-lg text-foreground hover:text-primary transition-colors">
                  Iniciar sesión
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
