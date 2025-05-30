
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserCircle, ShoppingBag, Settings, Users, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

// Custom white background color
const WHITE_BG = "bg-white text-black";

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await signOut();
      // Note: navigation is handled in the AuthContext to ensure proper session clearing first
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Có lỗi khi đăng xuất');
      // Reset the loading state after a delay to ensure UI feedback
      setTimeout(() => setIsLoggingOut(false), 500);
    }
  };
  
  const renderDesktopNav = () => (
    <div className="flex items-center gap-2">
      {user ? (
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button variant="secondary" asChild size="sm" className="text-white flex items-center gap-1">
                <Link to="/admin/orders">
                  <Settings className="h-4 w-4" /> Quản trị
                </Link>
              </Button>
              <Button variant="secondary" asChild size="sm" className="text-white flex items-center gap-1">
                <Link to="/admin/customers">
                  <Users className="h-4 w-4" /> Khách hàng
                </Link>
              </Button>
            </>
          )}
          <Button variant="secondary" asChild size="sm">
            <Link to="/customer/dashboard" className="text-white flex items-center gap-1">
              <UserCircle className="h-4 w-4" /> Tài khoản
            </Link>
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSignOut} 
            size="sm" 
            className="text-white flex items-center gap-1"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" /> {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
          </Button>
        </div>
      ) : (
        <Link to="/customer/auth">
          <Button variant="secondary" size="sm" className="text-white">
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
  );
  
  const renderMobileNav = () => (
    <div className="flex items-center gap-2">
      <Link to="/create-order" className="mr-2">
        <Button size="sm">
          <ShoppingBag className="h-4 w-4" />
          <span className="sr-only">Tạo đơn hàng</span>
        </Button>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {user ? (
            <>
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/orders" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Quản trị
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/customers" className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Khách hàng
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem asChild>
                <Link to="/customer/dashboard" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" /> Tài khoản
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="flex items-center gap-2"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" /> {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/customer/auth" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Đăng nhập
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
  
  return (
    <header className={`${WHITE_BG} shadow-sm`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/22f702c3-6095-4e93-be50-75d861b70af2.png" 
            alt="Easy Print Logo" 
            className="h-12 w-auto object-contain" 
            style={{filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))"}} 
          />
          <span 
            className="font-bold text-xl tracking-tight text-black" 
            style={{letterSpacing: "0.03em"}}
          >
            EASY PRINT 
          </span>
        </Link>
        {isMobile ? renderMobileNav() : renderDesktopNav()}
      </div>
    </header>
  );
}
