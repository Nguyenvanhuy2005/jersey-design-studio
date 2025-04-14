
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading, error } = useAuth();
  
  // While checking authentication status, show loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Đang kiểm tra thông tin đăng nhập...</p>
      </div>
    );
  }
  
  // If there's an authentication error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md">
          <h3 className="text-lg font-semibold mb-2">Lỗi xác thực</h3>
          <p>{error}</p>
          <div className="mt-4">
            <Navigate to="/login" replace />
          </div>
        </div>
      </div>
    );
  }
  
  // If user is authenticated
  if (user) {
    // If the route requires admin permission
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
