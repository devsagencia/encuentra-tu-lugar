'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Shield,
  ShieldOff,
  Eye,
  PhoneCall,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  category: string;
  accompaniment_types?: string[] | null;
  city: string;
  zone?: string | null;
  image_url?: string | null;
  status: string;
  verified: boolean;
  phone_verified?: boolean;
  phone?: string | null;
  premium: boolean;
  views_count: number;
  created_at: string;
}

type SubscriptionLite = {
  user_id: string;
  plan: 'free' | 'premium' | 'vip' | string;
  status: 'inactive' | 'active' | 'past_due' | 'canceled' | string;
};

export const AdminProfiles = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subsByUserId, setSubsByUserId] = useState<Record<string, SubscriptionLite | undefined>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('id,user_id,name,category,accompaniment_types,city,zone,image_url,status,verified,phone_verified,phone,premium,views_count,created_at')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      const rows = (data || []) as Profile[];
      setProfiles(rows);

      // Cargar suscripciones para poder mostrar Gratis/Premium/VIP en la tabla
      const userIds = Array.from(new Set(rows.map((p) => p.user_id).filter(Boolean)));
      if (userIds.length === 0) {
        setSubsByUserId({});
      } else {
        const { data: subs, error: subsErr } = await supabase
          .from('subscriptions')
          .select('user_id,plan,status')
          .in('user_id', userIds);
        if (subsErr) {
          // No bloquea la UI; simplemente no mostramos el plan
          console.warn('Error fetching subscriptions:', subsErr);
          setSubsByUserId({});
        } else {
          const map: Record<string, SubscriptionLite> = {};
          for (const s of (subs || []) as SubscriptionLite[]) {
            map[s.user_id] = s;
          }
          setSubsByUserId(map);
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [statusFilter]);

  const updateProfileStatus = async (
    profileId: string,
    newStatus: string,
    action: string
  ) => {
    try {
      // Update profile status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // Log the moderation action
      const { error: logError } = await supabase.from('moderation_logs').insert({
        profile_id: profileId,
        moderator_id: user?.id,
        action,
        reason: null,
      });

      if (logError) console.error('Error logging action:', logError);

      toast({
        title: 'Perfil actualizado',
        description: `El perfil ha sido ${
          newStatus === 'approved' ? 'aprobado' : newStatus === 'rejected' ? 'rechazado' : 'suspendido'
        }`,
      });

      fetchProfiles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    }
  };

  const toggleVerification = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verified: !currentStatus })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // Log verification action
      await supabase.from('moderation_logs').insert({
        profile_id: profileId,
        moderator_id: user?.id,
        action: !currentStatus ? 'verified' : 'unverified',
      });

      toast({
        title: 'Verificación actualizada',
        description: `Perfil ${!currentStatus ? 'verificado' : 'sin verificar'}`,
      });

      fetchProfiles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la verificación',
        variant: 'destructive',
      });
    }
  };

  const togglePhoneVerification = async (
    profileId: string,
    currentStatus: boolean,
    phone: string | null | undefined
  ) => {
    if (!phone) {
      toast({
        title: 'Sin teléfono',
        description: 'Este perfil no tiene teléfono para verificar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_verified: !currentStatus,
          phone_verified_at: !currentStatus ? now : null,
          phone_verified_by: !currentStatus ? user?.id : null,
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast({
        title: 'Teléfono verificado',
        description: `Teléfono ${!currentStatus ? 'verificado' : 'desverificado'}`,
      });

      fetchProfiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo actualizar la verificación del teléfono',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Suspendido
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (profile: Profile) => {
    const sub = subsByUserId[profile.user_id];
    const isActive = sub?.status === 'active';
    const plan = (isActive ? sub?.plan : 'free') || 'free';

    if (plan === 'vip') {
      return <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30">VIP</Badge>;
    }
    if (plan === 'premium') {
      return <Badge className="bg-primary/15 text-primary border-primary/30">Premium</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground border-border/40">Gratis</Badge>;
  };

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(search.toLowerCase()) ||
    profile.city.toLowerCase().includes(search.toLowerCase()) ||
    profile.category.toLowerCase().includes(search.toLowerCase())
  );

  const activityLabel = (p: Profile) => {
    const acts = (p.accompaniment_types ?? []) as string[];
    if (!acts.length) return '—';
    return acts.length > 1 ? `${acts[0]} +${acts.length - 1}` : acts[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Gestión de Perfiles
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra y modera los perfiles de anunciantes
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, ciudad o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>
            Perfiles ({filteredProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando...</p>
          ) : filteredProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron perfiles
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage src={profile.image_url ?? undefined} alt={profile.name} />
                        <AvatarFallback className="bg-muted/40 text-foreground">
                          {(profile.name || '?').slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="leading-tight">{profile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {profile.zone ? profile.zone : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {activityLabel(profile)}
                    </TableCell>
                    <TableCell>{profile.city}</TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell>{getPlanBadge(profile)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {profile.views_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVerification(profile.id, profile.verified)}
                            className={profile.verified ? 'text-green-500' : 'text-muted-foreground'}
                          >
                            {profile.verified ? (
                              <Shield className="w-4 h-4" />
                            ) : (
                              <ShieldOff className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {profile.verified ? 'Quitar verificación del perfil' : 'Verificar perfil'}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-foreground">
                          {profile.phone ? profile.phone : <span className="text-muted-foreground">—</span>}
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                togglePhoneVerification(profile.id, Boolean(profile.phone_verified), profile.phone)
                              }
                              className={
                                profile.phone_verified ? 'text-green-500' : 'text-muted-foreground'
                              }
                            >
                              <PhoneCall className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {profile.phone
                              ? profile.phone_verified
                                ? 'Quitar verificación del teléfono'
                                : 'Verificar teléfono'
                              : 'Sin teléfono para verificar'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              onClick={() => router.push(`/perfil/${profile.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver anuncio</TooltipContent>
                        </Tooltip>
                        {profile.status !== 'approved' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                onClick={() => updateProfileStatus(profile.id, 'approved', 'approved')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Aprobar anuncio</TooltipContent>
                          </Tooltip>
                        )}
                        {profile.status !== 'rejected' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => updateProfileStatus(profile.id, 'rejected', 'rejected')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rechazar anuncio</TooltipContent>
                          </Tooltip>
                        )}
                        {profile.status === 'approved' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                onClick={() => updateProfileStatus(profile.id, 'suspended', 'suspended')}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Suspender anuncio</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
};
