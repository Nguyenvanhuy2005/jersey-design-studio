
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuthCheckProps {
  children: ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
}

export const AuthCheck = ({ children, redirectTo = '/admin', requireAdmin = false }: AuthCheckProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // Log for debugging
      console.log("AuthCheck Component:", { 
        path: location.pathname,
        requireAdmin, 
        isAdmin, 
        isAuthenticated: !!user
      });
      
      // If not logged in, redirect to login
      if (!user) {
        navigate(redirectTo, { replace: true });
        return;
      }
      
      // If admin access required but user is not admin
      if (requireAdmin && !isAdmin) {
        console.warn("Admin access required but user is not admin");
        navigate('/customer/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, isAdmin, navigate, redirectTo, requireAdmin, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Đăng nhập để tiếp tục</CardTitle>
          <CardDescription>
            Bạn cần đăng nhập hoặc đăng ký tài khoản để tạo đơn hàng mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate(redirectTo)}>
              Đăng nhập / Đăng ký
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Quay lại trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If admin access required but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Không có quyền truy cập</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập vào trang này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate('/customer/dashboard')}>
              Quay lại trang khách hàng
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Quay lại trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
