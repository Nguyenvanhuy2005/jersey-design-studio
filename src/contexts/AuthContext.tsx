
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, clearLocalSession } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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

// Create context with a meaningful default value
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {
    console.warn('AuthContext not initialized');
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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
      // First call Supabase signOut method
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Force local logout even if API call fails
        forceLocalLogout();
        return;
      }
      
      // Then clear local session data
      clearLocalSession();
      
      // Reset auth state
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      toast.success('Đăng xuất thành công');
      
      // Redirect to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Có lỗi khi đăng xuất, vui lòng thử lại');
      
      // Force local logout in case of any error
      forceLocalLogout();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback function to force local logout when API fails
  const forceLocalLogout = () => {
    try {
      // Clear all local session data
      clearLocalSession();
      
      // Reset auth state
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      toast.success('Đăng xuất cục bộ thành công');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error in force logout:', err);
      toast.error('Không thể đăng xuất. Vui lòng tải lại trang.');
    }
  };

  const contextValue: AuthContextType = {
    session,
    user,
    isLoading,
    isAdmin,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook separately from the provider
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
