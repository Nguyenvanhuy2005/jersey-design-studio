
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, UserCog, ShoppingBag } from "lucide-react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();

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
          
          {/* Show customer links only for logged in users */}
          {user && (
            <Link to="/my-orders" className="hover:text-primary transition-colors">
              Đơn hàng của tôi
            </Link>
          )}
          
          {/* Show admin links only for admin users */}
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
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="text-secondary-foreground flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" className="text-secondary-foreground flex items-center gap-1">
                  <User className="h-4 w-4 mr-1" />
                  Đăng nhập
                </Button>
              </Link>
              
              {/* Admin login link */}
              <Link to="/admin/login">
                <Button variant="ghost" size="sm" className="text-secondary-foreground flex items-center gap-1">
                  <UserCog className="h-4 w-4 mr-1" />
                  Quản trị
                </Button>
              </Link>
            </div>
          )}
          
          <Link to="/create-order">
            <Button className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4 mr-1" />
              Tạo đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
