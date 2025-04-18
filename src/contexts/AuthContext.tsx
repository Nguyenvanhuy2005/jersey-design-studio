
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'customer';
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        console.log("Auth state changed:", _event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check admin status if user is logged in
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks with Supabase auth
          setTimeout(() => {
            checkAdminStatus(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check admin status if user is logged in
        if (currentSession?.user) {
          await checkAdminStatus(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for user:", userId);
      
      // First try with RLS function
      const { data: functionData, error: functionError } = await supabase.rpc('is_admin');
      
      if (!functionError && typeof functionData === 'boolean') {
        console.log("Admin status from RPC function:", functionData);
        setIsAdmin(functionData);
        return;
      } else {
        console.log("RPC function error or invalid result, falling back to direct query:", functionError);
      }
      
      // Fallback: direct query to user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      console.log("Admin role data:", data);
      setIsAdmin(!!data); // Convert to boolean
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Có lỗi khi đăng xuất');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
