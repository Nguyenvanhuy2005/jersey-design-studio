
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import { checkDesignImageExists, checkStorageBucketsExist, createStorageBucketsIfNeeded } from "@/utils/image-utils";

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
  const [storageBucketsStatus, setStorageBucketsStatus] = useState<{
    designImages: boolean;
    referenceImages: boolean;
    checking: boolean;
    error?: string;
  }>({
    designImages: false,
    referenceImages: false,
    checking: true
  });
  const [creatingBuckets, setCreatingBuckets] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") || "") : undefined,
    to: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo") || "") : undefined,
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
    
    const checkStorageBuckets = async () => {
      if (!user) return;
      setStorageBucketsStatus(prev => ({
        ...prev,
        checking: true
      }));
      try {
        const result = await checkStorageBucketsExist();
        setStorageBucketsStatus({
          designImages: result.designImages,
          referenceImages: result.referenceImages,
          checking: false,
          error: result.error
        });
        console.log("Storage buckets check:", result);
        if (!result.designImages || !result.referenceImages) {
          toast.error("Bucket không tồn tại trong storage. Hãy tạo bucket để hiển thị hình ảnh.", {
            duration: 5000,
          });
        }
      } catch (err) {
        console.error("Error checking storage buckets:", err);
        setStorageBucketsStatus({
          designImages: false,
          referenceImages: false,
          checking: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    };
    if (user && isAdmin) {
      checkStorageBuckets();
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

  const handleCreateBuckets = async () => {
    setCreatingBuckets(true);
    try {
      const result = await createStorageBucketsIfNeeded();
      if (result.success) {
        if (result.created.designImages || result.created.referenceImages) {
          toast.success("Đã tạo bucket thành công!");

          const updatedStatus = await checkStorageBucketsExist();
          setStorageBucketsStatus({
            designImages: updatedStatus.designImages,
            referenceImages: updatedStatus.referenceImages,
            checking: false,
            error: updatedStatus.error
          });
        } else {
          toast.info("Buckets đã tồn tại, không cần tạo mới.");
        }
      } else {
        toast.error(`Không thể tạo bucket: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating buckets:", error);
      toast.error("Có lỗi khi tạo bucket");
    } finally {
      setCreatingBuckets(false);
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
      let query = supabase
        .from('orders')
        .select('*, players(*), product_lines(*), print_configs(*)');
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (customerFilter && customerFilter !== 'all') {
        query = query.eq('customer_id', customerFilter);
      }
      
      if (searchTerm) {
        query = query.or(`team_name.ilike.%${searchTerm}%, notes.ilike.%${searchTerm}%`);
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
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching orders:", error);
        setFetchError(`Không thể tải dữ liệu đơn hàng: ${error.message}`);
        toast.error(`Không thể tải dữ liệu đơn hàng: ${error.message}`);
        setOrders([]);
        setFetchingData(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No orders found");
        setOrders([]);
        setFetchingData(false);
        return;
      }
      
      console.log("Raw orders data:", data);
      
      const transformedOrders: Order[] = await Promise.all(data.map(async order => {
        let processedReferenceImages: string[] = [];
        if (order.reference_images && Array.isArray(order.reference_images)) {
          processedReferenceImages = order.reference_images.filter(item => typeof item === 'string').map(item => String(item));
        }
        
        if (order.design_data) {
          const designData = order.design_data as {
            reference_images?: any[];
          };
          if (designData && typeof designData === 'object' && designData.reference_images && Array.isArray(designData.reference_images)) {
            const refImagesFromDesignData = designData.reference_images.filter(item => typeof item === 'string').map(item => String(item));
            processedReferenceImages = [...processedReferenceImages, ...refImagesFromDesignData];
          }
        }
        
        let designImageFront = order.design_image_front || order.design_image || '';
        let designImageBack = order.design_image_back || '';
        
        console.log(`Order ${order.id} design images:`, {
          front: designImageFront,
          back: designImageBack
        });
        
        let customerName = "Không xác định";
        if (order.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('name')
            .eq('id', order.customer_id)
            .single();
            
          if (customerData) {
            customerName = customerData.name || "Không xác định";
          }
        }
        
        return {
          id: order.id,
          teamName: order.team_name || '',
          status: order.status as 'new' | 'processing' | 'completed',
          totalCost: order.total_cost,
          createdAt: new Date(order.created_at || ''),
          notes: order.notes || '',
          designImage: order.design_image || '',
          designImageFront: order.design_image_front || '',
          designImageBack: order.design_image_back || '',
          referenceImages: processedReferenceImages,
          customerName: customerName,
          customerId: order.customer_id,
          players: order.players ? order.players.map((player: any) => ({
            id: player.id,
            name: player.name || '',
            number: player.number,
            size: player.size as 'S' | 'M' | 'L' | 'XL',
            printImage: player.print_image || false
          })) : [],
          productLines: order.product_lines ? order.product_lines.map((line: any) => ({
            id: line.id,
            product: line.product,
            position: line.position,
            material: line.material,
            size: line.size,
            points: line.points || 0,
            content: line.content || ''
          })) : [],
          printConfig: order.print_configs && order.print_configs.length > 0 ? {
            id: order.print_configs[0].id,
            font: order.print_configs[0].font || 'Arial',
            backMaterial: order.print_configs[0].back_material || '',
            backColor: order.print_configs[0].back_color || '',
            frontMaterial: order.print_configs[0].front_material || '',
            frontColor: order.print_configs[0].front_color || '',
            sleeveMaterial: order.print_configs[0].sleeve_material || '',
            sleeveColor: order.print_configs[0].sleeve_color || '',
            legMaterial: order.print_configs[0].leg_material || '',
            legColor: order.print_configs[0].leg_color || ''
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

      // Fix the template literal syntax by using regular string concatenation
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
    return <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </Layout>;
  }

  return <Layout>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên đội..."
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
      </div>
      
      {(!storageBucketsStatus.designImages || !storageBucketsStatus.referenceImages) && !storageBucketsStatus.checking && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <h3 className="font-medium">Cần tạo bucket lưu trữ</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Để hiển thị hình ảnh thiết kế và tham khảo, hãy tạo các bucket lưu trữ.
              </p>
              <Button 
                className="mt-2" 
                size="sm" 
                onClick={handleCreateBuckets} 
                disabled={creatingBuckets}
              >
                {creatingBuckets ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : "Tạo buckets"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
                <th className="p-3 text-left">Tên đội</th>
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
                  <td colSpan={9} className="p-4 text-center">
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
  </Layout>;
};

export default AdminOrders;
