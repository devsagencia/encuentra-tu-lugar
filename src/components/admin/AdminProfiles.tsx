import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Shield,
  ShieldOff,
  Eye,
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  category: string;
  city: string;
  status: string;
  verified: boolean;
  premium: boolean;
  views_count: number;
  created_at: string;
}

export const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles(data || []);
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

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(search.toLowerCase()) ||
    profile.city.toLowerCase().includes(search.toLowerCase()) ||
    profile.category.toLowerCase().includes(search.toLowerCase())
  );

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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell className="capitalize">{profile.category}</TableCell>
                    <TableCell>{profile.city}</TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {profile.views_count}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {profile.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() =>
                              updateProfileStatus(profile.id, 'approved', 'approved')
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {profile.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() =>
                              updateProfileStatus(profile.id, 'rejected', 'rejected')
                            }
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {profile.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                            onClick={() =>
                              updateProfileStatus(profile.id, 'suspended', 'suspended')
                            }
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
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
