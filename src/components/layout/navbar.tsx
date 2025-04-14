
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
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
          {user && !isAdmin && (
            <Link to="/my-orders" className="hover:text-primary transition-colors">
              Đơn hàng của tôi
            </Link>
          )}
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
        </nav>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline">{user.email}</span>
              <Button variant="outline" onClick={handleSignOut} className="text-secondary-foreground flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="text-secondary-foreground">
                Đăng nhập / Đăng ký
              </Button>
            </Link>
          )}
          
          <Link to="/create-order">
            <Button>
              Tạo đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
