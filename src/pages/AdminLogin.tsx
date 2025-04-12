
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Chuyển hướng người dùng nếu đã đăng nhập
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/admin/orders");
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Đăng nhập quản trị thành công");
      
      // Chuyển hướng sẽ được xử lý bởi useEffect khi user được cập nhật
      // Thêm một setTimeout để đảm bảo chuyển hướng nếu useEffect không hoạt động
      setTimeout(() => {
        navigate("/admin/orders");
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  // Nếu đang kiểm tra trạng thái đăng nhập, hiển thị trạng thái loading
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Nếu đã đăng nhập, redirect tới trang admin (không hiển thị form đăng nhập)
  if (user) {
    return null; // Không hiển thị gì cả vì useEffect sẽ chuyển hướng người dùng
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-card p-8 rounded-xl shadow">
            <h1 className="text-2xl font-bold mb-6">Đăng nhập quản trị</h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email quản trị"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
            
            <p className="text-sm text-center mt-4 text-muted-foreground">
              Sử dụng tài khoản quản trị đã được tạo
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
