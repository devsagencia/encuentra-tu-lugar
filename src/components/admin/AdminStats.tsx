'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

interface CategoryStats {
  activity: string;
  count: number;
}

interface CityStats {
  city: string;
  count: number;
}

export const AdminStats = () => {
  const [activityStats, setActivityStats] = useState<CategoryStats[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('accompaniment_types, city, status')
          .eq('status', 'approved');

        if (profiles) {
          // Activity stats (multi-select)
          const activityCount: Record<string, number> = {};
          const cityCount: Record<string, number> = {};

          profiles.forEach((profile) => {
            const acts = (profile as any).accompaniment_types as string[] | null;
            if (acts?.length) {
              acts.forEach((a) => {
                activityCount[a] = (activityCount[a] || 0) + 1;
              });
            }
            cityCount[profile.city] = (cityCount[profile.city] || 0) + 1;
          });

          setActivityStats(
            Object.entries(activityCount)
              .map(([activity, count]) => ({ activity, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 12)
          );

          setCityStats(
            Object.entries(cityCount)
              .map(([city, count]) => ({ city, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
          );
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(47, 100%, 50%)',
    'hsl(280, 100%, 60%)',
    'hsl(160, 100%, 40%)',
    'hsl(200, 100%, 50%)',
    'hsl(340, 100%, 50%)',
  ];

  const categoryLabels: Record<string, string> = {
    // mantenemos por compatibilidad; en la nueva taxonomía usamos directamente el texto
  };

  const chartConfig = {
    count: {
      label: 'Perfiles',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Estadísticas
        </h1>
        <p className="text-muted-foreground mt-1">
          Análisis y métricas del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Distribución por Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Cargando...
              </p>
            ) : activityStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Sin datos disponibles
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={activityStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ activity, percent }) =>
                      `${categoryLabels[activity] || activity} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {activityStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle>Top 10 Ciudades</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Cargando...
              </p>
            ) : cityStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Sin datos disponibles
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={cityStats} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="city"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Actividades (top)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activityStats.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Ciudades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cityStats.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Perfiles Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {cityStats.reduce((acc, c) => acc + c.count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
