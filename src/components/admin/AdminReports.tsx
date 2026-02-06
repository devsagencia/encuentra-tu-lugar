'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Flag, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

interface ReportRow {
  id: string;
  reporter_id: string;
  profile_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  profiles: { name: string } | null;
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Contenido inapropiado',
  fake: 'Perfil falso',
  harassment: 'Acoso',
  other: 'Otro',
};

export function AdminReports() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');

  const fetchReports = async () => {
    setLoading(true);
    const { data: reportData, error } = await supabase
      .from('reports')
      .select('id, reporter_id, profile_id, reason, description, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setRows([]);
      setLoading(false);
      return;
    }

    const list = (reportData ?? []) as Omit<ReportRow, 'profiles'>[];
    const profileIds = [...new Set(list.map((r) => r.profile_id))];
    let nameByProfileId: Record<string, string> = {};
    if (profileIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', profileIds);
      if (profileData) {
        nameByProfileId = Object.fromEntries(
          (profileData as { id: string; name: string }[]).map((p) => [p.id, p.name])
        );
      }
    }

    setRows(
      list.map((r) => ({
        ...r,
        profiles: nameByProfileId[r.profile_id] ? { name: nameByProfileId[r.profile_id] } : null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, status: ReportStatus) => {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error al actualizar', description: error.message, variant: 'destructive' });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const statusBadge = (status: string) => {
    const v = status as ReportStatus;
    if (v === 'pending') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendiente</Badge>;
    if (v === 'reviewed') return <Badge variant="secondary">Revisado</Badge>;
    if (v === 'resolved') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Resuelto</Badge>;
    if (v === 'dismissed') return <Badge variant="outline">Descartado</Badge>;
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
          <Flag className="w-6 h-6" />
          Reportes
        </h2>
        <p className="text-muted-foreground mt-1">
          Reportes de usuarios sobre perfiles. Revisa y cambia el estado.
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Reportes ({filtered.length})</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as ReportStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="reviewed">Revisados</SelectItem>
              <SelectItem value="resolved">Resueltos</SelectItem>
              <SelectItem value="dismissed">Descartados</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay reportes con este filtro.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Perfil reportado</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="max-w-[220px]">Detalles</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {row.profiles?.name ?? row.profile_id.slice(0, 8) + '…'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/perfil/${row.profile_id}`)}
                          aria-label="Ver perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{REASON_LABELS[row.reason] ?? row.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                      {row.description || '—'}
                    </TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={row.status}
                        onValueChange={(v) => updateStatus(row.id, v as ReportStatus)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="reviewed">Revisado</SelectItem>
                          <SelectItem value="resolved">Resuelto</SelectItem>
                          <SelectItem value="dismissed">Descartado</SelectItem>
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
