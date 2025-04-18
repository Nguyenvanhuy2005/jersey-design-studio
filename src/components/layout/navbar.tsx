
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle, ShoppingBag, Settings, Users } from "lucide-react";

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">
          Jersey Design Studio
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <Button variant="outline" asChild className="text-secondary-foreground flex items-center gap-1">
                    <Link to="/admin/orders">
                      <Settings className="h-4 w-4" /> Quản trị
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="text-secondary-foreground flex items-center gap-1">
                    <Link to="/admin/customers">
                      <Users className="h-4 w-4" /> Khách hàng
                    </Link>
                  </Button>
                </>
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
