'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SubmissionStatus = 'new' | 'read' | 'replied' | 'archived';

interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
}

export function AdminContact() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('all');
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('id, created_at, name, email, subject, message, status')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setSubmissions([]);
    } else {
      setSubmissions((data ?? []) as ContactSubmission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter((s) => s.status === filter);

  const statusBadge = (status: string) => {
    const v = status as SubmissionStatus;
    if (v === 'new') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Nuevo</Badge>;
    if (v === 'read') return <Badge variant="secondary">Leído</Badge>;
    if (v === 'replied') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Respondido</Badge>;
    if (v === 'archived') return <Badge variant="outline">Archivado</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Consultas de contacto
        </h2>
        <p className="text-muted-foreground mt-1">
          Mensajes enviados desde el formulario de contacto.
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Mensajes ({filtered.length})</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as SubmissionStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Nuevos</SelectItem>
              <SelectItem value="read">Leídos</SelectItem>
              <SelectItem value="replied">Respondidos</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay mensajes con este filtro.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead className="max-w-[280px]">Mensaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${row.email}`}
                        className="text-primary hover:underline"
                      >
                        {row.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.subject || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[280px] truncate">
                      {row.message}
                    </TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={row.status}
                        onValueChange={(v) => updateStatus(row.id, v as SubmissionStatus)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nuevo</SelectItem>
                          <SelectItem value="read">Leído</SelectItem>
                          <SelectItem value="replied">Respondido</SelectItem>
                          <SelectItem value="archived">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
