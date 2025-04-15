import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  order_count: number;
}

interface CustomerWithOrderCount extends Customer {
  order_count: number;
}

const AdminCustomers = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithOrderCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAdmin) {
      navigate("/customer/dashboard");
      return;
    }
    
    fetchCustomers();
  }, [isAdmin, navigate]);
  
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (customersError) throw customersError;

      if (customersData) {
        const customersWithOrderCounts = await Promise.all(
          customersData.map(async (customer) => {
            const { count } = await supabase
              .from("orders")
              .select("id", { count: 'exact', head: true })
              .eq("customer_id", customer.id);
            
            return {
              ...customer,
              email: '',
              created_at: new Date(customer.created_at || new Date()),
              order_count: count || 0
            } as CustomerWithOrderCount;
          })
        );

        setCustomers(customersWithOrderCounts);
      }
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Error fetching customers data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleContactCustomer = (customer: Customer) => {
    toast.success(`Đã gửi email tới khách hàng: ${customer.name}`);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };
  
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          
          <div className="flex gap-2 items-center">
            {user && <div className="flex items-center mr-4">
              <span className="text-sm mr-2">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={fetchCustomers}>Làm mới</Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="bg-card rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Số điện thoại</th>
                  <th className="p-3 text-left">Địa chỉ</th>
                  <th className="p-3 text-left">Số đơn hàng</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      {searchTerm ? "Không tìm thấy khách hàng phù hợp" : "Chưa có khách hàng nào"}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-muted">
                      <td className="p-3 font-medium">{customer.name || "Không có tên"}</td>
                      <td className="p-3">{customer.email}</td>
                      <td className="p-3">{customer.phone || "Không có SĐT"}</td>
                      <td className="p-3">{customer.address || "Không có địa chỉ"}</td>
                      <td className="p-3">{customer.order_count}</td>
                      <td className="p-3">
                        {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 flex justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactCustomer(customer)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Liên hệ
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/orders?customer=${customer.id}`)}
                        >
                          Xem đơn hàng
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCustomers;
