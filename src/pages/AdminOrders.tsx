import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order } from "@/types";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { checkDesignImageExists, checkStorageBucketsExist, createStorageBucketsIfNeeded } from "@/utils/image-utils";

const mockOrders: Order[] = [{
  id: "order-1",
  teamName: "FC Barcelona",
  players: Array(11).fill(null).map((_, i) => ({
    id: `player-${i + 1}-1`,
    name: `Player ${i + 1}`,
    number: i + 1,
    size: i % 2 === 0 ? "M" : "L",
    printImage: i % 3 === 0
  })),
  printConfig: {
    font: "Arial",
    backMaterial: "In chuyển nhiệt",
    backColor: "Trắng",
    frontMaterial: "In chuyển nhiệt",
    frontColor: "Đen",
    sleeveMaterial: "In chuyển nhiệt",
    sleeveColor: "Đen",
    legMaterial: "In chuyển nhiệt",
    legColor: "Đen"
  },
  productLines: [{
    id: "product-1-1",
    product: "Áo thi đấu",
    position: "Lưng trên",
    material: "In chuyển nhiệt",
    size: "Trung bình",
    points: 1,
    content: "Tên cầu thủ"
  }, {
    id: "product-1-2",
    product: "Áo thi đấu",
    position: "Lưng giữa",
    material: "In chuyển nhiệt",
    size: "Lớn",
    points: 1,
    content: "Số áo"
  }],
  totalCost: 3500000,
  status: "new",
  designImage: "order-1/design.png",
  createdAt: new Date(2023, 3, 15),
  referenceImages: []
}, {
  id: "order-2",
  teamName: "Manchester United",
  players: Array(15).fill(null).map((_, i) => ({
    id: `player-${i + 1}-2`,
    name: `Player ${i + 1}`,
    number: i + 1,
    size: i % 2 === 0 ? "L" : "XL",
    printImage: i % 2 === 0
  })),
  printConfig: {
    font: "Helvetica",
    backMaterial: "In trực tiếp",
    backColor: "Đen",
    frontMaterial: "In trực tiếp",
    frontColor: "Đen",
    sleeveMaterial: "In trực tiếp",
    sleeveColor: "Đen",
    legMaterial: "In trực tiếp",
    legColor: "Đen"
  },
  productLines: [{
    id: "product-2-1",
    product: "Áo thi đấu",
    position: "Lưng trên",
    material: "In trực tiếp",
    size: "Trung bình",
    points: 1,
    content: "Tên cầu thủ"
  }, {
    id: "product-2-2",
    product: "Áo thi đấu",
    position: "Lưng giữa",
    material: "In trực tiếp",
    size: "Lớn",
    points: 1,
    content: "Số áo"
  }],
  totalCost: 4200000,
  status: "processing",
  designImage: "order-2/design.png",
  createdAt: new Date(2023, 3, 20),
  referenceImages: []
}, {
  id: "order-3",
  teamName: "Real Madrid",
  players: Array(18).fill(null).map((_, i) => ({
    id: `player-${i + 1}-3`,
    name: `Player ${i + 1}`,
    number: i + 1,
    size: i % 3 === 0 ? "S" : i % 3 === 1 ? "M" : "L",
    printImage: true
  })),
  printConfig: {
    font: "Roboto",
    backMaterial: "In chuyển nhi���t",
    backColor: "Đen",
    frontMaterial: "In chuyển nhiệt",
    frontColor: "Trắng",
    sleeveMaterial: "In chuyển nhiệt",
    sleeveColor: "Trắng",
    legMaterial: "In chuyển nhiệt",
    legColor: "Trắng"
  },
  productLines: [{
    id: "product-3-1",
    product: "Áo thi đấu",
    position: "Lưng trên",
    material: "In chuyển nhiệt",
    size: "Trung bình",
    points: 1,
    content: "Tên cầu thủ"
  }, {
    id: "product-3-2",
    product: "Áo thi đấu",
    position: "Lưng giữa",
    material: "In chuyển nhiệt",
    size: "Lớn",
    points: 1,
    content: "Số áo"
  }],
  totalCost: 5400000,
  status: "completed",
  designImage: "order-3/design.png",
  createdAt: new Date(2023, 2, 10),
  referenceImages: []
}];

const AdminOrders = () => {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    signOut
  } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  useEffect(() => {
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
    if (user) {
      checkStorageBuckets();
    }
  }, [user]);

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

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setFetchingData(true);
        setFetchError(null);
        console.log("Fetching orders data...");
        try {
          const { data, error } = await supabase.from('orders').select('*, players(*), product_lines(*), print_configs(*)').order('created_at', { ascending: false });
          
          if (error) {
            console.error("Error fetching orders:", error);
            setFetchError(`Không thể tải dữ liệu đơn hàng: ${error.message}`);
            toast.error(`Không thể tải dữ liệu đơn hàng: ${error.message}`);
            setOrders([]); // Don't use mock data in production
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
            // Process reference images
            let processedReferenceImages: string[] = [];
            if (order.reference_images && Array.isArray(order.reference_images)) {
              processedReferenceImages = order.reference_images.filter(item => typeof item === 'string').map(item => String(item));
            }
            
            // Process design data
            if (order.design_data) {
              const designData = order.design_data as {
                reference_images?: any[];
              };
              if (designData && typeof designData === 'object' && designData.reference_images && Array.isArray(designData.reference_images)) {
                const refImagesFromDesignData = designData.reference_images.filter(item => typeof item === 'string').map(item => String(item));
                processedReferenceImages = [...processedReferenceImages, ...refImagesFromDesignData];
              }
            }
            
            // Check design images existence
            let designImageFront = order.design_image_front || order.design_image || '';
            let designImageBack = order.design_image_back || '';
            
            console.log(`Order ${order.id} design images:`, {
              front: designImageFront,
              back: designImageBack
            });
            
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
          setOrders([]); // Don't use mock data in production
        } finally {
          setFetchingData(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  if (isLoading || fetchingData) {
    return <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>;
  }

  const handleStatusChange = (orderId: string, newStatus: 'new' | 'processing' | 'completed') => {
    const updatedOrders = orders.map(order => order.id === orderId ? {
      ...order,
      status: newStatus
    } : order);
    setOrders(updatedOrders);
    supabase.from('orders').update({
      status: newStatus
    }).eq('id', orderId).then(({
      error
    }) => {
      if (error) {
        console.error("Error updating order status:", error);
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      } else {
        toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${newStatus === 'new' ? 'Mới' : newStatus === 'processing' ? 'Đang xử lý' : 'Đã hoàn thành'}`);
      }
    });
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
        
        {fetchError && <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">Lỗi tải dữ liệu</h3>
                <p className="text-sm text-red-700 mt-1">{fetchError}</p>
              </div>
            </div>
          </div>}
        
        <div className="bg-card rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Tên đội</th>
                  <th className="p-3 text-left">Số lượng áo</th>
                  <th className="p-3 text-left">Tổng chi phí</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-left">Thiết kế</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || fetchingData ? <tr>
                    <td colSpan={8} className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr> : orders.length > 0 ? <OrdersList orders={orders} statusFilter={statusFilter} onViewDetails={handleViewDetails} onViewImage={handleViewImage} onStatusChange={handleStatusChange} /> : <tr>
                    <td colSpan={8} className="p-4 text-center text-muted-foreground">
                      {fetchError ? "Không thể tải dữ liệu đơn hàng" : "Không có đơn hàng nào"}
                    </td>
                  </tr>}
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
