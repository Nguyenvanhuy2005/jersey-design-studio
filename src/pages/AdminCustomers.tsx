
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Customer } from "@/types";
import { Loader2, Search, User, UserPlus, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthCheck } from "@/components/auth/AuthCheck";
import { Link } from "react-router-dom";

// Define custom PostgresError type
interface PostgresError {
  code?: string;
  message?: string;
}

// Type guard for Postgres errors
function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === 'object' && error !== null && ('code' in error || 'message' in error);
}

const AdminCustomers = () => {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Không thể tải danh sách khách hàng");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const makeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }
    
    try {
      // Instead of directly querying auth.users, we'll use a RPC function to get the user ID
      const { data: userData, error: userError } = await supabase.rpc('get_user_by_email', {
        email: adminEmail
      });
      
      if (userError || !userData) {
        toast.error("Không tìm thấy người dùng với email này");
        return;
      }
      
      // Insert into user_roles with admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData,
          role: 'admin'
        });
        
      if (error) {
        if (isPostgresError(error) && error.code === '23505') { // Unique constraint violation
          toast.info("Người dùng này đã có quyền admin");
        } else {
          toast.error("Không thể cấp quyền admin");
          console.error(error);
        }
      } else {
        toast.success(`Đã cấp quyền admin cho ${adminEmail}`);
        setIsAdminDialogOpen(false);
        setAdminEmail("");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Có lỗi xảy ra");
    }
  };
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <AuthCheck adminOnly={true}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  className="pl-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button onClick={() => setIsAdminDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm Admin
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchQuery ? "Không tìm thấy khách hàng phù hợp" : "Chưa có khách hàng nào"}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Khách hàng từ {new Date(customer.created_at as string).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.email || "Chưa có email"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phone || "Chưa có số điện thoại"}</span>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{customer.address || "Chưa có địa chỉ"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thông tin khách hàng</DialogTitle>
              </DialogHeader>
              
              {selectedCustomer && (
                <div className="space-y-4">
                  <div>
                    <Label>Họ tên</Label>
                    <div className="font-medium">{selectedCustomer.name}</div>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <div>{selectedCustomer.email || "Chưa có email"}</div>
                  </div>
                  
                  <div>
                    <Label>Số điện thoại</Label>
                    <div>{selectedCustomer.phone || "Chưa có số điện thoại"}</div>
                  </div>
                  
                  <div>
                    <Label>Địa chỉ</Label>
                    <div>{selectedCustomer.address || "Chưa có địa chỉ"}</div>
                  </div>
                  
                  <div>
                    <Label>Ghi chú giao hàng</Label>
                    <div>{selectedCustomer.delivery_note || "Không có ghi chú"}</div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm quản trị viên mới</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={makeAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email của người dùng</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Nhập email người dùng"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">Thêm quyền admin</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AuthCheck>
    </Layout>
  );
};

export default AdminCustomers;
