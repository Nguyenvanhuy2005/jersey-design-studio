
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

      toast.success("Đăng nhập thành công");
      navigate("/admin/orders");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

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
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
            
            <p className="text-sm text-center mt-4 text-muted-foreground">
              Để demo, hãy đăng ký tài khoản mới tại Supabase Auth
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
