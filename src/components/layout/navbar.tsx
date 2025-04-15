
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle, ShoppingBag, Settings } from "lucide-react";

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-xl">
            Jersey Design Studio
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link to="/create-order" className="hover:text-primary transition-colors">
            Tạo đơn hàng
          </Link>
          {user && (
            <>
              <Link to="/customer/dashboard" className="hover:text-primary transition-colors">
                Trang khách hàng
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/orders" className="hover:text-primary transition-colors">
                    Quản lý đơn hàng
                  </Link>
                  <Link to="/admin/customers" className="hover:text-primary transition-colors">
                    Quản lý khách hàng
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" asChild className="text-secondary-foreground flex items-center gap-1">
                  <Link to="/admin/orders">
                    <Settings className="h-4 w-4" /> Quản trị
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/customer/dashboard" className="text-secondary-foreground flex items-center gap-1">
                  <UserCircle className="h-4 w-4" /> Tài khoản
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="text-secondary-foreground flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>
          ) : (
            <Link to="/customer/auth">
              <Button variant="outline" className="text-secondary-foreground">
                Đăng nhập
              </Button>
            </Link>
          )}
          
          <Link to="/create-order">
            <Button>
              <ShoppingBag className="h-4 w-4 mr-1" />
              Tạo đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
