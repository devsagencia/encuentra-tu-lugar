'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const friendlyAuthError = (message: string) => {
    const msg = (message || '').toLowerCase();
    if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
      return 'Tu email no está confirmado. Confírmalo en tu correo (revisa también la carpeta de spam/no deseado) o marca el usuario como “Confirmed” en Supabase → Authentication → Users.';
    }
    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
      return 'Credenciales inválidas. Revisa email/contraseña y vuelve a intentarlo.';
    }
    if (msg.includes('too many requests')) {
      return 'Demasiados intentos. Espera un minuto y vuelve a probar.';
    }
    return message;
  };

  const getDefaultRedirectForUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;

      const roles = (data ?? []).map((r) => r.role);
      const isPrivileged = roles.includes('admin') || roles.includes('moderator');
      if (isPrivileged) return '/admin';

      // Si ya tiene anuncio (perfil), llévalo a su panel.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (profileError) throw profileError;

      return profile?.id ? '/cuenta' : '/crear-anuncio';
    } catch {
      // Si falla la lectura de roles, no bloqueamos el acceso del usuario normal
      return '/crear-anuncio';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error, user } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Error al iniciar sesión',
        description: friendlyAuthError(error.message),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Bienvenido',
        description: 'Has iniciado sesión correctamente',
      });
      const next = searchParams.get('next');
      if (next) {
        router.push(next);
      } else if (user?.id) {
        const redirectTo = await getDefaultRedirectForUser(user.id);
        router.push(redirectTo);
      } else {
        router.push('/crear-anuncio');
      }
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error, session } = await signUp(email, password);

    if (error) {
      toast({
        title: 'Error al registrarse',
        description: friendlyAuthError(error.message),
        variant: 'destructive',
      });
    } else {
      if (!session) {
        toast({
          title: 'Revisa tu correo',
          description:
            'Tu cuenta se ha creado, pero necesitas confirmar el email para iniciar sesión (según la configuración de Supabase). Revisa también la carpeta de spam/no deseado.',
        });
      } else {
        toast({
          title: 'Cuenta creada',
          description: 'Tu cuenta ha sido creada exitosamente',
        });
        const next = searchParams.get('next');
        router.push(next || '/crear-anuncio');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        <Card className="glass-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display text-gradient">Acceso</CardTitle>
            <CardDescription>
              Inicia sesión o crea tu cuenta para publicar tu anuncio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Contraseña</Label>
                    <Input
                      id="password-login"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Iniciar sesión
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input
                      id="email-register"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Contraseña</Label>
                    <Input
                      id="password-register"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Crear cuenta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
