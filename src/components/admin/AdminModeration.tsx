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
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModerationLog {
  id: string;
  profile_id: string;
  moderator_id: string | null;
  action: string;
  reason: string | null;
  created_at: string;
  profiles: {
    name: string;
  } | null;
}

export const AdminModeration = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('moderation_logs')
          .select(`
            *,
            profiles (name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs((data as ModerationLog[]) || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
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
      case 'restored':
        return (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
            <RotateCcw className="w-3 h-3 mr-1" />
            Restaurado
          </Badge>
        );
      case 'verified':
        return (
          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Verificado
          </Badge>
        );
      case 'unverified':
        return (
          <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">
            <ShieldOff className="w-3 h-3 mr-1" />
            Sin verificar
          </Badge>
        );
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Historial de Moderación
        </h1>
        <p className="text-muted-foreground mt-1">
          Registro de todas las acciones de moderación realizadas
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Últimas acciones ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay registros de moderación
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Razón</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.profiles?.name || 'Perfil eliminado'}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.reason || '-'}
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
