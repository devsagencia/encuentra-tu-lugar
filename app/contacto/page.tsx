'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      toast({
        title: 'Campo obligatorio',
        description: 'Introduce tu nombre.',
        variant: 'destructive',
      });
      return;
    }
    if (!trimmedEmail) {
      toast({
        title: 'Campo obligatorio',
        description: 'Introduce tu correo electrónico.',
        variant: 'destructive',
      });
      return;
    }
    if (!trimmedMessage) {
      toast({
        title: 'Campo obligatorio',
        description: 'Escribe tu mensaje.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    const { error } = await supabase.from('contact_submissions').insert({
      name: trimmedName,
      email: trimmedEmail,
      subject: subject.trim() || null,
      message: trimmedMessage,
      user_id: user?.id ?? null,
    });

    setSending(false);
    if (error) {
      toast({
        title: 'Error al enviar',
        description: error.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      return;
    }

    setSent(true);
    setName('');
    setEmail(user?.email ?? '');
    setSubject('');
    setMessage('');
    toast({
      title: 'Mensaje enviado',
      description: 'Te responderemos lo antes posible. Revisa tu correo.',
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Contacto</h1>
          <p className="text-muted-foreground">
            Soporte, incidencias y consultas. Te responderemos a la mayor brevedad.
          </p>
        </div>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Escríbenos</CardTitle>
            <CardDescription>
              Rellena el formulario y te contestaremos por correo. Si tienes un error, incluye la URL y una captura si es posible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary" />
                <p className="font-medium text-foreground">Mensaje enviado correctamente</p>
                <p className="text-sm text-muted-foreground">
                  Hemos recibido tu consulta. Revisaremos tu correo y te responderemos pronto.
                </p>
                <Button variant="outline" onClick={() => setSent(false)} className="mt-2">
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Nombre *</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={sending}
                    maxLength={200}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Correo electrónico *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={sending}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Asunto (opcional)</Label>
                  <Input
                    id="contact-subject"
                    type="text"
                    placeholder="Ej: Consulta sobre mi cuenta"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={sending}
                    maxLength={200}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Mensaje *</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Escribe tu consulta, incidencia o sugerencia..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending}
                    rows={5}
                    maxLength={2000}
                    className="bg-background resize-y min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">{message.length} / 2000</p>
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Respondemos en un plazo de 24–48 horas laborables. Para urgencias técnicas incluye capturas y mensajes de error.
        </p>
      </main>
    </div>
  );
}
