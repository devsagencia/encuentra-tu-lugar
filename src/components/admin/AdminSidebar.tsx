import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  LogOut,
  Home,
} from 'lucide-react';

type AdminView = 'dashboard' | 'profiles' | 'moderation' | 'stats';

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  isAdmin: boolean;
}

export const AdminSidebar = ({
  activeView,
  setActiveView,
  isAdmin,
}: AdminSidebarProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profiles' as AdminView, label: 'Perfiles', icon: Users },
    { id: 'moderation' as AdminView, label: 'Moderación', icon: ShieldCheck },
    ...(isAdmin
      ? [{ id: 'stats' as AdminView, label: 'Estadísticas', icon: BarChart3 }]
      : []),
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-display font-bold text-gradient">
          Admin Panel
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeView === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4 mr-3" />
          Ir al sitio
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
};
