
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Registration form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = loginMethod === "email" ? loginEmail : loginPhone;
    if (!identifier || !loginPassword) {
      toast.error(loginMethod === "email" 
        ? "Vui lòng nhập email và mật khẩu"
        : "Vui lòng nhập số điện thoại và mật khẩu"
      );
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword(
        loginMethod === "email"
          ? { email: loginEmail, password: loginPassword }
          : { phone: loginPhone, password: loginPassword }
      );
      
      if (error) {
        toast.error(error.message || "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.");
        return;
      }
      
      toast.success("Đăng nhập thành công!");
      navigate("/customer/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đăng nhập thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !password || !phone || !address) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 kí tự");
      return;
    }
    
    setLoading(true);
    
    try {
      const signUpData = email 
        ? { email, password }
        : { phone, password };

      const { data, error } = await supabase.auth.signUp({
        ...signUpData,
        options: {
          data: {
            name,
            phone,
            address,
          },
        },
      });
      
      if (error) {
        toast.error(error.message || "Không thể đăng ký. Vui lòng thử lại.");
        return;
      }
      
      toast.success("Đăng ký thành công!");
      if (data?.user && !data?.session) {
        toast("Vui lòng kiểm tra email để xác nhận tài khoản của bạn.");
        navigate("/");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-10">
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tài khoản khách hàng</CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Đăng nhập để quản lý đơn hàng và thông tin cá nhân" 
                : "Đăng ký tài khoản mới để đặt hàng dễ dàng hơn"}
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-center space-x-4 mb-4">
                    <Button
                      type="button"
                      variant={loginMethod === "email" ? "default" : "outline"}
                      onClick={() => setLoginMethod("email")}
                    >
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={loginMethod === "phone" ? "default" : "outline"}
                      onClick={() => setLoginMethod("phone")}
                    >
                      Số điện thoại
                    </Button>
                  </div>

                  {loginMethod === "email" ? (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0912345678"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Họ tên</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Số điện thoại</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-address">Địa chỉ</Label>
                    <Input
                      id="register-address"
                      type="text"
                      placeholder="Địa chỉ giao hàng"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerAuth;
