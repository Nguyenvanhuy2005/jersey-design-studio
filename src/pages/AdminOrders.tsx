
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order } from "@/types";
import { AlertTriangle, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { 
  checkStorageBucketsExist, 
  createStorageBucketsIfNeeded,
  type StorageBucketsStatus
} from "@/services/storageService";
import { fetchOrders, updateOrderStatus } from "@/services/orderService";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  
  // State definitions
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [storageBucketsStatus, setStorageBucketsStatus] = useState<StorageBucketsStatus>({
    designImages: false,
    referenceImages: false,
    checking: true
  });
  const [creatingBuckets, setCreatingBuckets] = useState<boolean>(false);

  // Check storage buckets on component mount
  useEffect(() => {
    const checkBuckets = async () => {
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
    
    if (user) {
      checkBuckets();
    }
  }, [user]);

  // Fetch orders data
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      setFetchingData(true);
      const { orders, error } = await fetchOrders();
      
      setOrders(orders);
      if (error) {
        setFetchError(error);
        toast.error(error);
      } else {
        setFetchError(null);
      }
      
      setFetchingData(false);
    };
    
    if (user) {
      loadOrders();
    }
  }, [user]);

  // Create storage buckets
  const handleCreateBuckets = async () => {
    setCreatingBuckets(true);
    
    try {
      const result = await createStorageBucketsIfNeeded();
      
      if (result.success) {
        if (result.created.designImages || result.created.referenceImages) {
          toast.success("Đã tạo bucket thành công!");

          // Re-check bucket status
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

  // Handle order status change
  const handleStatusChange = async (orderId: string, newStatus: 'new' | 'processing' | 'completed') => {
    // Update local state for immediate feedback
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    
    // Update in database
    await updateOrderStatus(orderId, newStatus);
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    toast.success("Đã đăng xuất khỏi hệ thống");
    navigate("/login");
  };

  // Handler for viewing order details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  // Handler for viewing image
  const handleViewImage = (imageUrl: string | null) => {
    setSelectedImage(imageUrl);
  };

  // Handler for closing image viewer
  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  // Show loading state while auth is loading
  if (authLoading || fetchingData) {
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="new">Mới</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Storage buckets warning */}
        {(!storageBucketsStatus.designImages || !storageBucketsStatus.referenceImages) && 
         !storageBucketsStatus.checking && (
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
        
        {/* Error message */}
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
        
        {/* Orders table */}
        <div className="bg-card rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Họ tên khách hàng</TableHead>
                  <TableHead>Số lượng áo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thiết kế</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <OrdersList 
                  orders={orders} 
                  statusFilter={statusFilter} 
                  onViewDetails={handleViewDetails} 
                  onViewImage={handleViewImage} 
                  onStatusChange={handleStatusChange}
                  isLoading={fetchingData}
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Order details dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onViewImage={handleViewImage} 
              onStatusChange={handleStatusChange} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Image viewer */}
      <ImageViewer 
        isOpen={!!selectedImage} 
        onClose={handleCloseImageViewer} 
        imageUrl={selectedImage} 
      />
    </Layout>
  );
};

export default AdminOrders;
