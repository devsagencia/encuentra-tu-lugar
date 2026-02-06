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
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

type AdminView = 'dashboard' | 'profiles' | 'moderation' | 'stats' | 'users' | 'subscriptions' | 'contact' | 'reports';

export default function AdminPage() {
  const { user, loading, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col flex-shrink-0">
        <AdminSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isAdmin={isAdmin}
          onNavigate={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            isAdmin={isAdmin}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-display font-bold">Admin Panel</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
