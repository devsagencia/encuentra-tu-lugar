'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Shield, ShieldCheck, User as UserIcon, Trash2, Megaphone } from 'lucide-react';

type AppRole = 'admin' | 'moderator' | 'user';

type UserRoleRow = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};

type ProfileLite = { user_id: string; name: string };

export function AdminUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRoleRow[]>([]);
  const [profilesByUserId, setProfilesByUserId] = useState<Record<string, ProfileLite>>({});
  const [emailsByUserId, setEmailsByUserId] = useState<Record<string, string>>({});
  const [emailsError, setEmailsError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');

  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<AppRole>('user');
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error al cargar roles',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const roleRows = (data as UserRoleRow[]) ?? [];
    setRows(roleRows);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name');
    const map: Record<string, ProfileLite> = {};
    for (const p of profiles ?? []) {
      map[(p as ProfileLite).user_id] = { user_id: (p as ProfileLite).user_id, name: (p as ProfileLite).name };
    }
    setProfilesByUserId(map);

    const { data: emailRows, error: emailErr } = await supabase.rpc('get_user_emails_for_admin');
    if (!emailErr && emailRows?.length) {
      const emailMap: Record<string, string> = {};
      for (const row of emailRows as { user_id: string; email: string | null }[]) {
        if (row.email) emailMap[row.user_id] = row.email;
      }
      setEmailsByUserId(emailMap);
      setEmailsError(null);
    } else {
      setEmailsByUserId({});
      setEmailsError(emailErr ? emailErr.message : null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const profile = profilesByUserId[r.user_id];
      const email = emailsByUserId[r.user_id] ?? '';
      const matchesSearch = search
        ? r.user_id.toLowerCase().includes(search.toLowerCase()) ||
          (profile?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
          email.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesRole = roleFilter === 'all' ? true : r.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [rows, search, roleFilter, profilesByUserId, emailsByUserId]);

  const roleBadge = (r: AppRole) => {
    switch (r) {
      case 'admin':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Moderador
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border/40">
            <UserIcon className="w-3 h-3 mr-1" />
            Usuario
          </Badge>
        );
    }
  };

  const handleGrant = async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      toast({
        title: 'Falta user_id',
        description: 'Pega el UUID del usuario (auth.users.id).',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('user_roles').insert({
      user_id: trimmed,
      role,
    });
    setSaving(false);

    if (error) {
      toast({
        title: 'No se pudo asignar el rol',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Rol asignado', description: `Rol ${role} asignado a ${trimmed}` });
    setUserId('');
    setRole('user');
    fetchRoles();
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('id', id);
    if (error) {
      toast({
        title: 'No se pudo revocar',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Rol revocado' });
    fetchRoles();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Usuarios</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona roles (admin/moderador/usuario). El user_id coincide con el de Perfiles para cruzar datos. Quien tiene perfil es anunciante.
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Asignar rol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="user_id (UUID) de auth.users"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Para crear el primer admin, lo normal es hacerlo desde el SQL Editor (bootstrap).
              </p>
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="moderator">moderator</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGrant} disabled={saving}>
            {saving ? 'Asignando…' : 'Asignar rol'}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Roles ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailsError && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm p-3">
              Los emails no se pudieron cargar. Ejecuta en Supabase (SQL Editor) la migración{' '}
              <code className="text-xs bg-muted px-1 rounded">20260130010000_get_user_emails_function.sql</code> (función get_user_emails_for_admin).
              <br />
              <span className="text-muted-foreground">{emailsError}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por user_id, email o nombre de perfil…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AppRole | 'all')}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filtrar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="moderator">moderator</SelectItem>
                <SelectItem value="user">user</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sin resultados</p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono text-xs whitespace-nowrap">user_id</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Rol</TableHead>
                    <TableHead className="whitespace-nowrap">Perfil / Anunciante</TableHead>
                    <TableHead className="whitespace-nowrap">Creado</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const profile = profilesByUserId[r.user_id];
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap" title={r.user_id}>
                          {r.user_id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {emailsByUserId[r.user_id] ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{roleBadge(r.role)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {profile ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <Megaphone className="w-3 h-3 mr-1" />
                                Anunciante
                              </Badge>
                              <span className="font-medium">{profile.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Usuario (sin perfil)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRevoke(r.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

