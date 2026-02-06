'use client';

import { Heart, Menu, User, Plus, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const router = useRouter();
  const { user, isAdmin, isModerator, hasProfile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handlePublish = () => {
    if (user) {
      router.push('/crear-anuncio');
      return;
    }
    router.push('/auth?next=/crear-anuncio');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <span className="font-display text-xl font-bold gradient-text hidden sm:inline">
            Contactalia
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </Link>
          <Link href="/como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cómo funciona
          </Link>
          <Link href="/tarifas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Tarifas
          </Link>
          <Link href="/contacto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </Link>
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
                      size="icon"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={(user.user_metadata?.avatar_url as string) ?? undefined}
                          alt="Tu foto"
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                          {user.email
                            ? user.email.slice(0, 2).toUpperCase()
                            : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push('/cuenta')}>
                      <User className="w-4 h-4 mr-2" />
                      {hasProfile ? 'Dashboard anunciante' : 'Dashboard usuario'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favoritos')}>
                      <Heart className="w-4 h-4 mr-2" />
                      Mis favoritos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/crear-anuncio')}>
                      <Plus className="w-4 h-4 mr-2" />
                      {hasProfile ? 'Editar anuncio' : 'Crear anuncio'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(isAdmin || isModerator) && (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/admin')}>
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
                  onClick={() => router.push('/auth')}
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
            onClick={handlePublish}
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
              {user ? (
                <div className="flex items-center gap-3 pb-4 mt-4 border-b border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={(user.user_metadata?.avatar_url as string) ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {user.email ? user.email.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                </div>
              ) : null}
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg text-foreground hover:text-primary transition-colors">
                  Inicio
                </Link>
                <Link href="/como-funciona" className="text-lg text-foreground hover:text-primary transition-colors">
                  Cómo funciona
                </Link>
                <Link href="/tarifas" className="text-lg text-foreground hover:text-primary transition-colors">
                  Tarifas
                </Link>
                <Link href="/contacto" className="text-lg text-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
                <hr className="border-border" />
                {user ? (
                  <>
                    <Link
                      href="/cuenta"
                      className="text-lg text-foreground hover:text-primary transition-colors"
                    >
                      {hasProfile ? 'Dashboard anunciante' : 'Dashboard usuario'}
                    </Link>
                    <Link
                      href="/favoritos"
                      className="text-lg text-foreground hover:text-primary transition-colors"
                    >
                      Mis favoritos
                    </Link>
                    <Link
                      href="/crear-anuncio"
                      className="text-lg text-foreground hover:text-primary transition-colors"
                    >
                      {hasProfile ? 'Editar anuncio' : 'Crear anuncio'}
                    </Link>
                    {(isAdmin || isModerator) && (
                      <Link 
                        href="/admin" 
                        className="text-lg text-foreground hover:text-primary transition-colors"
                      >
                        Panel Admin
                      </Link>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="text-lg text-left text-foreground hover:text-primary transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/auth" 
                    className="text-lg text-foreground hover:text-primary transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
