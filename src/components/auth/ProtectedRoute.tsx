
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // While checking authentication status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is authenticated
  if (user) {
    // If the route requires admin permission and user is not admin
    if (requireAdmin && !isAdmin) {
      // User is not an admin, redirect to home
      return <Navigate to="/" replace />;
    }
    
    // User is authenticated and has necessary permissions, render child routes
    return <Outlet />;
  }
  
  // If user is not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};
