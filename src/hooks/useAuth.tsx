'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  profileId: string | null;
  hasProfile: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; user: User | null; session: Session | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const checkRoles = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (roles) {
        setIsAdmin(roles.some((r) => r.role === 'admin'));
        setIsModerator(roles.some((r) => r.role === 'moderator'));
      }
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfileId(data?.id ?? null);
    } catch (error) {
      console.error('Error checking profile:', error);
      setProfileId(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid deadlock with Supabase client
          setTimeout(() => {
            checkRoles(session.user.id);
            checkProfile(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsModerator(false);
          setProfileId(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRoles(session.user.id);
        checkProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { error, user: data.user ?? null, session: data.session ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error, user: data.user ?? null, session: data.session ?? null };
  };

  const signOut = async () => {
    // Importante: algunos entornos en Windows pueden no disparar el listener de forma fiable;
    // forzamos limpieza de estado local para que la UI refleje el logout inmediatamente.
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } finally {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsModerator(false);
      setProfileId(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isModerator,
        profileId,
        hasProfile: Boolean(profileId),
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
