'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { AdminAccounting } from '@/components/admin/AdminAccounting';

interface DashboardStats {
  totalProfiles: number;
  approvedProfiles: number;
  pendingProfiles: number;
  rejectedProfiles: number;
  suspendedProfiles: number;
  totalViews: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProfiles: 0,
    approvedProfiles: 0,
    pendingProfiles: 0,
    rejectedProfiles: 0,
    suspendedProfiles: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all profiles for counting
        const { data: profiles } = await supabase
          .from('profiles')
          .select('status, views_count');

        if (profiles) {
          const approved = profiles.filter((p) => p.status === 'approved').length;
          const pending = profiles.filter((p) => p.status === 'pending').length;
          const rejected = profiles.filter((p) => p.status === 'rejected').length;
          const suspended = profiles.filter((p) => p.status === 'suspended').length;
          const totalViews = profiles.reduce((acc, p) => acc + (p.views_count || 0), 0);

          setStats({
            totalProfiles: profiles.length,
            approvedProfiles: approved,
            pendingProfiles: pending,
            rejectedProfiles: rejected,
            suspendedProfiles: suspended,
            totalViews,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Perfiles',
      value: stats.totalProfiles,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Aprobados',
      value: stats.approvedProfiles,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pendientes',
      value: stats.pendingProfiles,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Rechazados',
      value: stats.rejectedProfiles,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Suspendidos',
      value: stats.suspendedProfiles,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Vistas',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? '...' : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Usa el menú lateral para gestionar perfiles, moderar contenido y ver estadísticas detalladas.
          </p>
        </CardContent>
      </Card>

      <AdminAccounting />
    </div>
  );
};
