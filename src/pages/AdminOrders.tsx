import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order } from "@/types";
import { LogOut, AlertTriangle, Loader2, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { dbOrderToOrder } from "@/utils/adapters";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user,
    isLoading,
    isAdmin,
    signOut
  } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [customerFilter, setCustomerFilter] = useState<string>(searchParams.get("customer") || "all");
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") || "") : undefined,
    to: searchParams.get("dateTo") ? new Date(dateTo || "") : undefined,
  });
  const [customersList, setCustomersList] = useState<{ id: string; name: string }[]>([]);

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

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin, statusFilter, customerFilter, searchTerm, dateRange]);

  const fetchOrders = async () => {
    setFetchingData(true);
    setFetchError(null);
    console.log("Fetching orders data...");
    try {
      // Use separate queries to fetch orders and related data to avoid relationship ambiguity
      let query = supabase
        .from('orders')
        .select('*');
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (customerFilter && customerFilter !== 'all') {
        query = query.eq('customer_id', customerFilter);
      }
      
      if (dateRange.from) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        query = query.gte('created_at', `${fromDate}T00:00:00`);
      }
      
      if (dateRange.to) {
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        query = query.lte('created_at', `${toDate}T23:59:59`);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data: ordersData, error: ordersError } = await query;
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setFetchError(`Không thể tải dữ liệu đơn hàng: ${ordersError.message}`);
        toast.error(`Không thể tải dữ liệu đơn hàng: ${ordersError.message}`);
        setOrders([]);
        setFetchingData(false);
        return;
      }
      
      if (!ordersData || ordersData.length === 0) {
        console.log("No orders found");
        setOrders([]);
        setFetchingData(false);
        return;
      }
      
      console.log("Raw orders data:", ordersData);
      
      // Process orders with related data
      const transformedOrders: Order[] = await Promise.all(ordersData.map(async order => {
        // Fetch customer data separately to avoid relationship ambiguity
        let customerName = "Không xác định";
        let customerEmail = undefined;
        let customerPhone = undefined;
        let customerAddress = undefined;
        
        if (order.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('name, phone, address')
            .eq('id', order.customer_id)
            .single();
            
          if (customerData) {
            customerName = customerData.name || "Không xác định";
            customerPhone = customerData.phone;
            customerAddress = customerData.address;
          }
        }
        
        // Fetch players data
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('order_id', order.id);
          
        const players = playersData ? playersData.map(player => ({
          id: player.id,
          name: player.name || '',
          number: String(player.number),
          size: player.size as 'S' | 'M' | 'L' | 'XL',
          printImage: player.print_image || false
        })) : [];
        
        // Fetch product lines data
        const { data: productLinesData } = await supabase
          .from('product_lines')
          .select('*')
          .eq('order_id', order.id);
          
        const productLines = productLinesData ? productLinesData.map(line => ({
          id: line.id,
          product: line.product,
          position: line.position,
          material: line.material,
          size: line.size,
          points: line.points || 0,
          content: line.content || ''
        })) : [];
        
        // Fetch print config data
        const { data: printConfigData } = await supabase
          .from('print_configs')
          .select('*')
          .eq('order_id', order.id)
          .single();
          
        // Parse reference images
        let refImages: string[] = [];
        if (order.reference_images) {
          if (typeof order.reference_images === 'string') {
            try {
              refImages = JSON.parse(order.reference_images);
            } catch (e) {
              refImages = [];
            }
          } else if (Array.isArray(order.reference_images)) {
            refImages = order.reference_images.filter(item => typeof item === 'string').map(item => String(item));
          }
        }
        
        // Extract team name
        let teamName = '';
        if (order.design_data && typeof order.design_data === 'object') {
          teamName = (order.design_data as any)?.team_name || '';
        }
        
        return {
          id: order.id,
          status: order.status as 'new' | 'processing' | 'completed',
          totalCost: order.total_cost,
          createdAt: new Date(order.created_at || ''),
          notes: order.notes || '',
          designImage: order.design_image || '',
          designImageFront: order.design_image_front || '',
          designImageBack: order.design_image_back || '',
          referenceImages: refImages,
          customerName: customerName,
          customerId: order.customer_id,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          teamName: teamName,
          players: players,
          productLines: productLines,
          printConfig: printConfigData ? {
            id: printConfigData.id,
            font: printConfigData.font || 'Arial',
            backMaterial: printConfigData.back_material || 'In chuyển nhiệt',
            backColor: printConfigData.back_color || 'Đen',
            frontMaterial: printConfigData.front_material || 'In chuyển nhiệt',
            frontColor: printConfigData.front_color || 'Đen',
            sleeveMaterial: printConfigData.sleeve_material || 'In chuyển nhiệt',
            sleeveColor: printConfigData.sleeve_color || 'Đen',
            legMaterial: printConfigData.leg_material || 'In chuyển nhiệt',
            legColor: printConfigData.leg_color || 'Đen'
          } : {
            font: 'Arial',
            backMaterial: 'In chuyển nhiệt',
            backColor: 'Đen',
            frontMaterial: 'In chuyển nhiệt',
            frontColor: 'Đen',
            sleeveMaterial: 'In chuyển nhiệt',
            sleeveColor: 'Đen',
            legMaterial: 'In chuyển nhiệt',
            legColor: 'Đen'
          }
        };
      }));
      
      console.log("Transformed orders:", transformedOrders);
      setOrders(transformedOrders);
    } catch (e) {
      console.error("Exception in fetchOrders:", e);
      setFetchError(`Có lỗi xảy ra khi tải dữ liệu: ${e instanceof Error ? e.message : 'Unknown error'}`);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      setOrders([]);
    } finally {
      setFetchingData(false);
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
      setOrders(updatedOrders);
      
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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleViewImage = (imageUrl: string | null) => {
    console.log("Opening image viewer with URL:", imageUrl);
    setSelectedImage(imageUrl);
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
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
            {user && <div className="flex items-center mr-4">
              <span className="text-sm mr-2">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>}
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="new">Mới</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khách hàng</SelectItem>
                {customersList.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name || customer.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    {dateRange.from ? (
                      format(dateRange.from, "dd/MM/yyyy")
                    ) : (
                      <span className="text-muted-foreground">Từ ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    {dateRange.to ? (
                      format(dateRange.to, "dd/MM/yyyy")
                    ) : (
                      <span className="text-muted-foreground">Đến ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleFilter} className="flex items-center gap-1">
              <Filter className="h-4 w-4" /> Lọc
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </div>
        
        {fetchError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">Lỗi tải dữ liệu</h3>
                <p className="text-sm text-red-700 mt-1">{fetchError}</p>
              </div>
            </div>
          </div>
        )}
        
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
                    onViewDetails={handleViewDetails} 
                    onViewImage={handleViewImage} 
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
          {selectedOrder && <OrderDetails order={selectedOrder} onViewImage={handleViewImage} onStatusChange={handleStatusChange} />}
        </DialogContent>
      </Dialog>
      
      <ImageViewer isOpen={!!selectedImage} onClose={handleCloseImageViewer} imageUrl={selectedImage} />
    </Layout>
  );
};

export default AdminOrders;
