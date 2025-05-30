
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  
  // Log for debugging
  console.log("Protected Route Check:", { 
    path: location.pathname,
    requireAdmin, 
    isAdmin, 
    isAuthenticated: !!user,
    isLoading 
  });
  
  // While checking authentication status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/customer/auth" replace />;
  }
  
  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    console.warn("Admin access required but user is not admin");
    return <Navigate to="/customer/dashboard" replace />;
  }
  
  // If user is authenticated and meets role requirements, render child routes
  return <Outlet />;
};
