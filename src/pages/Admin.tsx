import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProfiles } from '@/components/admin/AdminProfiles';
import { AdminModeration } from '@/components/admin/AdminModeration';
import { AdminStats } from '@/components/admin/AdminStats';
import { Loader2 } from 'lucide-react';

type AdminView = 'dashboard' | 'profiles' | 'moderation' | 'stats';

const Admin = () => {
  const { user, loading, isAdmin, isModerator } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin && !isModerator) {
      // User doesn't have admin/moderator role - redirect
      navigate('/');
    }
  }, [user, loading, isAdmin, isModerator, navigate]);

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
        return <AdminStats />;
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
};

export default Admin;
