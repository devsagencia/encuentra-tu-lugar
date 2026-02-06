'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProfiles } from '@/components/admin/AdminProfiles';
import { AdminModeration } from '@/components/admin/AdminModeration';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminSubscriptions } from '@/components/admin/AdminSubscriptions';
import { AdminContact } from '@/components/admin/AdminContact';
import { AdminReports } from '@/components/admin/AdminReports';
import { Loader2 } from 'lucide-react';

type AdminView = 'dashboard' | 'profiles' | 'moderation' | 'stats' | 'users' | 'subscriptions' | 'contact' | 'reports';

export default function AdminPage() {
  const { user, loading, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !isAdmin && !isModerator) {
      // User doesn't have admin/moderator role - redirect
      router.push('/');
    }
  }, [user, loading, isAdmin, isModerator, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isModerator)) {
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'profiles':
        return <AdminProfiles />;
      case 'moderation':
        return <AdminModeration />;
      case 'stats':
        return isAdmin ? <AdminStats /> : <AdminDashboard />;
      case 'users':
        return isAdmin ? <AdminUsers /> : <AdminDashboard />;
      case 'subscriptions':
        return isAdmin ? <AdminSubscriptions /> : <AdminDashboard />;
      case 'contact':
        return <AdminContact />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isAdmin={isAdmin}
      />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
