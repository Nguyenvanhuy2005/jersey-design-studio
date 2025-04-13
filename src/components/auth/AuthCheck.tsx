
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuthCheckProps {
  children: ReactNode;
  redirectTo?: string;
}

export const AuthCheck = ({ children, redirectTo = '/admin' }: AuthCheckProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, isLoading, navigate, redirectTo]);

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

  return <>{children}</>;
};
