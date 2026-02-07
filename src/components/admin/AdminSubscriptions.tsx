'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { CreditCard, RefreshCcw, Copy } from 'lucide-react';

type SubStatus = 'inactive' | 'active' | 'past_due' | 'canceled';

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: SubStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider: string | null;
  provider_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export function AdminSubscriptions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [emailByUserId, setEmailByUserId] = useState<Record<string, string>>({});

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubStatus | 'all'>('all');

  // Create/Update form
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('free');
  const [status, setStatus] = useState<SubStatus>('inactive');
  const [periodEnd, setPeriodEnd] = useState(''); // yyyy-mm-dd
  const [saving, setSaving] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    let query = supabase.from('subscriptions').select('*').order('updated_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const [subsRes, emailsRes] = await Promise.all([
      query,
      supabase.rpc('get_user_emails_for_admin'),
    ]);

    if (subsRes.error) {
      toast({
        title: 'Error al cargar suscripciones',
        description: subsRes.error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const emails = (emailsRes.data ?? []) as { user_id: string; email: string | null }[];
    const map: Record<string, string> = {};
    emails.forEach((e) => {
      if (e.user_id && e.email) map[e.user_id] = e.email;
    });
    setEmailByUserId(map);
    setRows((subsRes.data as SubscriptionRow[]) ?? []);
    setLoading(false);
  };

  const copyUserId = (id: string) => {
    navigator.clipboard.writeText(id).then(
      () => toast({ title: 'ID copiado', description: 'user_id copiado al portapapeles.' }),
      () => toast({ title: 'Error', description: 'No se pudo copiar.', variant: 'destructive' })
    );
  };

  useEffect(() => {
    fetchSubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const email = emailByUserId[r.user_id] ?? '';
      return (
        r.user_id.toLowerCase().includes(q) ||
        r.plan.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q)
      );
    });
  }, [rows, search, emailByUserId]);

  const statusBadge = (s: SubStatus) => {
    switch (s) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">active</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">past_due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">canceled</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border/40">inactive</Badge>;
    }
  };

  const handleUpsert = async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      toast({
        title: 'Falta user_id',
        description: 'Pega el UUID del usuario (auth.users.id).',
        variant: 'destructive',
      });
      return;
    }

    const end = periodEnd ? new Date(`${periodEnd}T23:59:59.000Z`).toISOString() : null;

    setSaving(true);
    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: trimmed,
          plan: plan.trim() || 'free',
          status,
          current_period_end: end,
          current_period_start: null,
        },
        { onConflict: 'user_id' }
      );
    setSaving(false);

    if (error) {
      toast({
        title: 'No se pudo guardar la suscripción',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Suscripción actualizada' });
    setUserId('');
    setPlan('free');
    setStatus('inactive');
    setPeriodEnd('');
    fetchSubs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Suscripciones</h1>
        <p className="text-muted-foreground mt-1">
          Controla estado y plan de suscripción de usuarios (modo admin).
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Crear/actualizar suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="user_id (UUID) de auth.users"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Input
              placeholder="Plan (ej: free, premium, vip)"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            />
            <Select value={status} onValueChange={(v) => setStatus(v as SubStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inactive">inactive</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="past_due">past_due</SelectItem>
                <SelectItem value="canceled">canceled</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Fin de periodo (opcional). Para pruebas, basta con activar/inactivar.
              </p>
            </div>
          </div>

          <Button onClick={handleUpsert} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listado ({filtered.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchSubs}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refrescar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por email, user_id o plan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
                <SelectItem value="past_due">past_due</SelectItem>
                <SelectItem value="canceled">canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sin resultados</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>user_id</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fin periodo</TableHead>
                    <TableHead>Actualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-foreground">
                        {emailByUserId[r.user_id] ?? (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs break-all">{r.user_id}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => copyUserId(r.user_id)}
                            title="Copiar user_id"
                          >
                            <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{r.plan}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(r.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

