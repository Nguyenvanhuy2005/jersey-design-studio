
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Order } from "@/types";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customer-form";
import { CustomerOrdersList } from "@/components/customer/customer-orders-list";
import { ChangePasswordForm } from "@/components/customer/change-password-form";
import { dbOrderToOrder } from "@/utils/adapters";

const CustomerDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    id: '',
    name: "",
    phone: "",
    address: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/customer/auth");
      return;
    }

    if (user) {
      fetchCustomerData();
      fetchCustomerOrders();
    }
  }, [user, authLoading]);

  const fetchCustomerData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching customer data:", error);
        toast.error("Không thể tải thông tin khách hàng");
        return;
      }
      
      if (data) {
        setCustomerInfo({
          id: data.id,
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          delivery_note: data.delivery_note || "",
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Có lỗi khi tải thông tin khách hàng");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCustomerOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Không thể tải danh sách đơn hàng");
        return;
      }
      
      if (data) {
        // Convert database orders to application Order type
        // Each order now includes players, logos, etc. as JSONB arrays
        const convertedOrders = data.map((order: any) => {
          console.log("Raw order data:", order);
          return dbOrderToOrder(order as any);
        });
        setOrders(convertedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Có lỗi khi tải danh sách đơn hàng");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Trang khách hàng</h1>
            <p className="text-muted-foreground">
              Xin chào, {customerInfo.name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/create-order")}>
              Tạo đơn hàng mới
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng của tôi</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Quản lý thông tin cá nhân và địa chỉ giao hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Đang tải thông tin...</span>
                  </div>
                ) : (
                  <CustomerForm 
                    initialCustomer={customerInfo}
                    onCustomerInfoChange={setCustomerInfo}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng của tôi</CardTitle>
                <CardDescription>
                  Xem và quản lý các đơn hàng bạn đã đặt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex items-center justify-center p-4">
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Đang tải đơn hàng...</span>
                  </div>
                ) : (
                  <CustomerOrdersList orders={orders} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật</CardTitle>
                <CardDescription>
                  Quản lý mật khẩu và bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
