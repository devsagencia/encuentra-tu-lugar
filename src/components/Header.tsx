import { Heart, Menu, User, Plus, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isModerator, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hidden sm:flex text-muted-foreground hover:text-foreground"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mi cuenta
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {(isAdmin || isModerator) && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Panel Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hidden sm:flex text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/auth')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Iniciar sesión
                </Button>
              )}
            </>
          )}
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
                <a href="/" className="text-lg text-foreground hover:text-primary transition-colors">
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
                {user ? (
                  <>
                    {(isAdmin || isModerator) && (
                      <a 
                        href="/admin" 
                        className="text-lg text-foreground hover:text-primary transition-colors"
                      >
                        Panel Admin
                      </a>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="text-lg text-left text-foreground hover:text-primary transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <a 
                    href="/auth" 
                    className="text-lg text-foreground hover:text-primary transition-colors"
                  >
                    Iniciar sesión
                  </a>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
