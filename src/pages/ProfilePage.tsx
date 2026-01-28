import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mockProfiles } from '@/data/mockProfiles';
import { Header } from '@/components/Header';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const profile = mockProfiles.find(p => p.id === id);

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Perfil no encontrado</h1>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Column */}
          <div className="order-1">
            <ProfileGallery
              images={profile.images}
              videos={profile.videos}
              name={profile.name}
            />
          </div>

          {/* Info Column */}
          <div className="order-2">
            <div className="lg:sticky lg:top-24">
              <ProfileInfo profile={profile} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Contactos España. Todos los derechos reservados.</p>
          <p className="mt-2">Solo para mayores de 18 años.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
