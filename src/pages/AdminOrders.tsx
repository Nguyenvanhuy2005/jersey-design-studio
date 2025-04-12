
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order, Player, DesignData } from "@/types";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";

const mockOrders: Order[] = [
  {
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
    productLines: [
      {
        id: "product-1-1",
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: "In chuyển nhiệt",
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: "product-1-2",
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: "In chuyển nhiệt",
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ],
    totalCost: 3500000,
    status: "new",
    designImage: "order-1/design.png",
    createdAt: new Date(2023, 3, 15)
  },
  {
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
    productLines: [
      {
        id: "product-2-1",
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: "In trực tiếp",
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: "product-2-2",
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: "In trực tiếp",
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ],
    totalCost: 4200000,
    status: "processing",
    designImage: "order-2/design.png",
    createdAt: new Date(2023, 3, 20)
  },
  {
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
      backMaterial: "In chuyển nhiệt",
      backColor: "Đen",
      frontMaterial: "In chuyển nhiệt",
      frontColor: "Trắng",
      sleeveMaterial: "In chuyển nhiệt",
      sleeveColor: "Trắng",
      legMaterial: "In chuyển nhiệt",
      legColor: "Trắng"
    },
    productLines: [
      {
        id: "product-3-1",
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: "In chuyển nhiệt",
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: "product-3-2",
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: "In chuyển nhiệt",
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ],
    totalCost: 5400000,
    status: "completed",
    designImage: "order-3/design.png",
    createdAt: new Date(2023, 2, 10)
  }
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        console.log("Fetching orders data...");
        
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*, players(*), product_lines(*), print_configs(*)');
          
          if (error) {
            console.error("Error fetching orders:", error);
            toast.error("Không thể tải dữ liệu đơn hàng");
            setOrders(mockOrders);
          } else if (data && data.length > 0) {
            console.log("Raw orders data:", data);
            
            const transformedOrders: Order[] = data.map(order => {
              // Process reference_images to ensure it's a string array
              let processedReferenceImages: string[] = [];
              
              // Handle potential reference_images in the database
              if (order.reference_images && Array.isArray(order.reference_images)) {
                processedReferenceImages = order.reference_images
                  .filter(item => typeof item === 'string')
                  .map(item => String(item));
              }
              
              // Check design_data for reference_images as fallback
              if (order.design_data) {
                // Safely check if design_data is an object and has reference_images property
                const designData = order.design_data as { reference_images?: any[] };
                if (designData && 
                    typeof designData === 'object' && 
                    designData.reference_images && 
                    Array.isArray(designData.reference_images)) {
                  
                  const refImagesFromDesignData = designData.reference_images
                    .filter(item => typeof item === 'string')
                    .map(item => String(item));
                  
                  processedReferenceImages = [
                    ...processedReferenceImages,
                    ...refImagesFromDesignData
                  ];
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
            });
            
            console.log("Transformed orders:", transformedOrders);
            setOrders(transformedOrders);
          } else {
            console.log("No orders found, using mock data");
            setOrders(mockOrders);
          }
        } catch (e) {
          console.error("Exception in fetchOrders:", e);
          toast.error("Có lỗi xảy ra khi tải dữ liệu");
          setOrders(mockOrders);
        }
      };
      
      fetchOrders();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  const handleStatusChange = (orderId: string, newStatus: 'new' | 'processing' | 'completed') => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating order status:", error);
          toast.error("Không thể cập nhật trạng thái đơn hàng");
        } else {
          toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${
            newStatus === 'new' ? 'Mới' : 
            newStatus === 'processing' ? 'Đang xử lý' : 
            'Đã hoàn thành'
          }`);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          
          <div className="flex gap-2 items-center">
            {user && (
              <div className="flex items-center mr-4">
                <span className="text-sm mr-2">{user.email}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-1"
                >
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
                <OrdersList 
                  orders={orders}
                  statusFilter={statusFilter}
                  onViewDetails={handleViewDetails}
                  onViewImage={handleViewImage} 
                  onStatusChange={handleStatusChange}
                />
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
              onViewImage={handleViewImage}
              onStatusChange={handleStatusChange}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <ImageViewer 
        isOpen={!!selectedImage} 
        onClose={handleCloseImageViewer} 
        imageUrl={selectedImage} 
      />
    </Layout>
  );
};

export default AdminOrders;
