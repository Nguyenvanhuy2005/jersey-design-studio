import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order } from "@/types";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { OrderFilters } from "@/components/admin/order-list/OrderFilters";
import { OrdersError } from "@/components/admin/order-list/OrdersError";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [customerFilter, setCustomerFilter] = useState<string>(searchParams.get("customer") || "all");
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") || "") : undefined,
    to: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo") || "") : undefined,
  });
  const [customersList, setCustomersList] = useState<{ id: string; name: string }[]>([]);

  const { orders, fetchError, fetchingData, fetchOrders } = useOrders({
    statusFilter,
    customerFilter,
    dateRange
  });

  useEffect(() => {
    const status = searchParams.get("status");
    const customer = searchParams.get("customer");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    
    if (status) setStatusFilter(status);
    if (customer) setCustomerFilter(customer);
    if (search) setSearchTerm(search);
    if (dateFrom) setDateRange(prev => ({ ...prev, from: new Date(dateFrom) }));
    if (dateTo) setDateRange(prev => ({ ...prev, to: new Date(dateTo) }));
  }, [searchParams]);

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate("/customer/dashboard");
      return;
    }
    
    if (user && isAdmin) {
      fetchCustomers();
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin, statusFilter, customerFilter, searchTerm, dateRange]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name');
      
      if (error) {
        console.error("Error fetching customers:", error);
        return;
      }
      
      setCustomersList(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'new' | 'processing' | 'completed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error updating order status:", error);
        toast.error("Không thể cập nhật trạng thái đơn hàng");
        return;
      }
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${
        newStatus === 'new' ? 'Mới' : 
        newStatus === 'processing' ? 'Đang xử lý' : 
        'Đã hoàn thành'
      }`);

      const oldStatus = orders.find(order => order.id === orderId)?.status || '';
      console.log("Order " + orderId + " status changed from " + oldStatus + " to " + newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Có lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Đã đăng xuất khỏi hệ thống");
    navigate("/admin");
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    
    if (customerFilter && customerFilter !== 'all') {
      params.set('customer', customerFilter);
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (dateRange.from) {
      params.set('dateFrom', format(dateRange.from, 'yyyy-MM-dd'));
    }
    
    if (dateRange.to) {
      params.set('dateTo', format(dateRange.to, 'yyyy-MM-dd'));
    }
    
    setSearchParams(params);
  };

  const handleFilter = () => {
    updateSearchParams();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setCustomerFilter('all');
    setSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
    setSearchParams(new URLSearchParams());
  };

  if (isLoading || (fetchingData && orders.length === 0)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          
          <div className="flex gap-2 items-center">
            {user && (
              <div className="flex items-center mr-4">
                <span className="text-sm mr-2">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          customerFilter={customerFilter}
          setCustomerFilter={setCustomerFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customersList={customersList}
          onFilter={handleFilter}
          onResetFilters={handleResetFilters}
        />
        
        {fetchError && <OrdersError error={fetchError} />}
        
        <div className="bg-card rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-left">Số lượng áo</th>
                  <th className="p-3 text-left">Tổng chi phí</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-left">Thiết kế</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {fetchingData ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <OrdersList 
                    orders={orders} 
                    statusFilter={statusFilter} 
                    onViewDetails={setSelectedOrder} 
                    onViewImage={setSelectedImage} 
                    onStatusChange={handleStatusChange} 
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onViewImage={setSelectedImage} 
              onStatusChange={handleStatusChange} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      <ImageViewer 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
        imageUrl={selectedImage} 
      />
    </Layout>
  );
};

export default AdminOrders;
