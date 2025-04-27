
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, ClipboardList, LayoutDashboard, LogIn, ShoppingBag, Shirt, UserCircle } from "lucide-react";

const Index = () => {
  const {
    user
  } = useAuth();
  const [imageError, setImageError] = useState(false);
  return <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Thiết kế áo đấu bóng đá chuyên nghiệp
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Tạo và đặt thiết kế áo đấu độc đáo cho đội của bạn với dịch vụ thiết kế và sản xuất hàng đầu.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/create-order">
                    Bắt đầu thiết kế <ShoppingBag className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                {!user ? <Button asChild variant="outline" size="lg">
                    <Link to="/customer/auth">
                      Đăng nhập <LogIn className="ml-2 h-5 w-5" />
                    </Link>
                  </Button> : <Button asChild variant="outline" size="lg">
                    <Link to="/customer/dashboard">
                      Tài khoản <UserCircle className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                {imageError ? <div className="rounded-xl shadow-lg border bg-muted flex items-center justify-center aspect-[4/3]">
                    <div className="text-center p-4">
                      <Shirt className="mx-auto h-16 w-16 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Easy Print Vietnam</p>
                    </div>
                  </div> : <img alt="Soccer jersey" className="rounded-xl shadow-lg border w-full object-cover aspect-[4/3]" onError={() => setImageError(true)} src="/lovable-uploads/76e6c29f-4361-49d2-a359-3c7ca475fc5c.png" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Tính năng nổi bật</h2>
            <p className="text-muted-foreground mt-2">
              Đặt hàng dễ dàng, quản lý tiện lợi
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 rounded-full bg-primary/10">
                <Shirt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl">Thiết kế tùy chỉnh</h3>
              <p className="text-muted-foreground">
                Tạo thiết kế áo đấu độc đáo với các tùy chọn về màu sắc, chất liệu và logo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 rounded-full bg-primary/10">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl">Theo dõi đơn hàng</h3>
              <p className="text-muted-foreground">
                Xem trạng thái và theo dõi tiến độ đơn hàng của bạn qua tài khoản cá nhân.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 rounded-full bg-primary/10">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl">Quản lý tài khoản</h3>
              <p className="text-muted-foreground">
                Quản lý thông tin cá nhân, địa chỉ giao hàng và lịch sử đơn hàng.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button asChild variant="outline">
              <Link to="/customer/auth">
                Khám phá thêm <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Bắt đầu tạo áo đấu cho đội bóng của bạn
            </h2>
            <p className="text-lg max-w-2xl">
              Chỉ cần vài phút để thiết kế và đặt hàng. Đăng ký tài khoản để theo dõi đơn hàng và quản lý thông tin của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="secondary" size="lg">
                <Link to="/create-order">
                  Tạo đơn hàng
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/customer/auth">
                  {user ? "Quản lý tài khoản" : "Đăng ký / Đăng nhập"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Index;

