import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order, Customer, DesignData } from "@/types";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { checkStorageBucketsExist, createStorageBucketsIfNeeded } from "@/utils/storage/bucket-utils";

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

  const fetchOrders = async () => {
    setFetchingData(true);
    setFetchError(null);
    console.log("Fetching orders data...");
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          players(*), 
          product_lines(*), 
          print_configs(*),
          customers(*)
        `)
        .order('created_at', { ascending: false });
      
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
      
      const transformedOrders: Order[] = await Promise.all(data.map(async (order: any) => {
        let customerInfo: Customer | undefined = undefined;
        
        if (order.customers) {
          if (Array.isArray(order.customers) && order.customers.length > 0) {
            const customerData = order.customers[0];
            
            if (customerData) {
              customerInfo = {
                id: customerData.id,
                name: customerData.name || '',
                address: customerData.address || '',
                phone: customerData.phone || '',
                delivery_note: customerData.delivery_note || '',
                created_at: customerData.created_at ? new Date(customerData.created_at) : undefined
              };
            }
          }
        }
        
        let processedReferenceImages: string[] = [];
        if (order.reference_images && Array.isArray(order.reference_images)) {
          processedReferenceImages = order.reference_images.filter((item: any) => typeof item === 'string').map((item: any) => String(item));
        }
        
        let typedDesignData: DesignData | undefined = undefined;
        
        if (order.design_data && typeof order.design_data === 'object') {
          const rawData: any = order.design_data;
          
          typedDesignData = {
            uniform_type: rawData.uniform_type as 'player' | 'goalkeeper' | 'mixed' | undefined,
            quantity: rawData.quantity,
            logos: Array.isArray(rawData.logos) ? rawData.logos.map((logo: any) => ({
              logo_id: logo.logo_id || '',
              position: logo.position || '',
              x_position: Number(logo.x_position) || 0,
              y_position: Number(logo.y_position) || 0,
              scale: Number(logo.scale) || 1.0,
            })) : undefined,
            line_1: rawData.line_1 ? {
              enabled: Boolean(rawData.line_1.enabled),
              material: rawData.line_1.material,
              color: rawData.line_1.color,
              content: rawData.line_1.content,
              font: rawData.line_1.font,
              font_file: rawData.line_1.font_file
            } : undefined,
            line_2: rawData.line_2 ? {
              enabled: Boolean(rawData.line_2.enabled),
              material: rawData.line_2.material,
              color: rawData.line_2.color,
              content: rawData.line_2.content,
              font: rawData.line_2.font,
              font_file: rawData.line_2.font_file
            } : undefined,
            line_3: rawData.line_3 ? {
              enabled: Boolean(rawData.line_3.enabled),
              material: rawData.line_3.material,
              color: rawData.line_3.color,
              content: rawData.line_3.content,
              font: rawData.line_3.font,
              font_file: rawData.line_3.font_file
            } : undefined,
            chest_text: rawData.chest_text ? {
              enabled: Boolean(rawData.chest_text.enabled),
              material: rawData.chest_text.material,
              color: rawData.chest_text.color,
              content: rawData.chest_text.content,
              font: rawData.chest_text.font,
              font_file: rawData.chest_text.font_file
            } : undefined,
            chest_number: rawData.chest_number ? {
              enabled: Boolean(rawData.chest_number.enabled),
              material: rawData.chest_number.material,
              color: rawData.chest_number.color,
              content: rawData.chest_number.content
            } : undefined,
            pants_number: rawData.pants_number ? {
              enabled: Boolean(rawData.pants_number.enabled),
              material: rawData.pants_number.material,
              color: rawData.pants_number.color,
              content: rawData.pants_number.content
            } : undefined,
            logo_chest_left: rawData.logo_chest_left ? {
              enabled: Boolean(rawData.logo_chest_left.enabled),
              material: rawData.logo_chest_left.material,
              color: rawData.logo_chest_left.color,
              logo_id: rawData.logo_chest_left.logo_id,
              x_position: Number(rawData.logo_chest_left.x_position) || 0,
              y_position: Number(rawData.logo_chest_left.y_position) || 0,
              scale: Number(rawData.logo_chest_left.scale) || 1.0
            } : undefined,
            logo_chest_right: rawData.logo_chest_right ? {
              enabled: Boolean(rawData.logo_chest_right.enabled),
              material: rawData.logo_chest_right.material,
              color: rawData.logo_chest_right.color,
              logo_id: rawData.logo_chest_right.logo_id,
              x_position: Number(rawData.logo_chest_right.x_position) || 0,
              y_position: Number(rawData.logo_chest_right.y_position) || 0,
              scale: Number(rawData.logo_chest_right.scale) || 1.0
            } : undefined,
            logo_chest_center: rawData.logo_chest_center ? {
              enabled: Boolean(rawData.logo_chest_center.enabled),
              material: rawData.logo_chest_center.material,
              color: rawData.logo_chest_center.color,
              logo_id: rawData.logo_chest_center.logo_id,
              x_position: Number(rawData.logo_chest_center.x_position) || 0,
              y_position: Number(rawData.logo_chest_center.y_position) || 0,
              scale: Number(rawData.logo_chest_center.scale) || 1.0
            } : undefined,
            logo_sleeve_left: rawData.logo_sleeve_left ? {
              enabled: Boolean(rawData.logo_sleeve_left.enabled),
              material: rawData.logo_sleeve_left.material,
              color: rawData.logo_sleeve_left.color,
              logo_id: rawData.logo_sleeve_left.logo_id,
              x_position: Number(rawData.logo_sleeve_left.x_position) || 0,
              y_position: Number(rawData.logo_sleeve_left.y_position) || 0,
              scale: Number(rawData.logo_sleeve_left.scale) || 1.0
            } : undefined,
            logo_sleeve_right: rawData.logo_sleeve_right ? {
              enabled: Boolean(rawData.logo_sleeve_right.enabled),
              material: rawData.logo_sleeve_right.material,
              color: rawData.logo_sleeve_right.color,
              logo_id: rawData.logo_sleeve_right.logo_id,
              x_position: Number(rawData.logo_sleeve_right.x_position) || 0,
              y_position: Number(rawData.logo_sleeve_right.y_position) || 0,
              scale: Number(rawData.logo_sleeve_right.scale) || 1.0
            } : undefined,
            pet_chest: rawData.pet_chest ? {
              enabled: Boolean(rawData.pet_chest.enabled),
              material: rawData.pet_chest.material,
              color: rawData.pet_chest.color,
              content: rawData.pet_chest.content
            } : undefined,
            logo_pants: rawData.logo_pants ? {
              enabled: Boolean(rawData.logo_pants.enabled),
              material: rawData.logo_pants.material,
              color: rawData.logo_pants.color,
              logo_id: rawData.logo_pants.logo_id,
              x_position: Number(rawData.logo_pants.x_position) || 0,
              y_position: Number(rawData.logo_pants.y_position) || 0,
              scale: Number(rawData.logo_pants.scale) || 1.0
            } : undefined,
            font_text: rawData.font_text ? {
              font: rawData.font_text.font || 'Arial',
              font_file: rawData.font_text.font_file
            } : {
              font: 'Arial'
            },
            font_number: rawData.font_number ? {
              font: rawData.font_number.font || 'Arial',
              font_file: rawData.font_number.font_file
            } : {
              font: 'Arial'
            },
            print_style: rawData.print_style,
            print_color: rawData.print_color,
            reference_images: Array.isArray(rawData.reference_images) ? rawData.reference_images : []
          };
        }
        
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
          customerInfo: customerInfo,
          customer_id: order.customer_id,
          players: order.players ? order.players.map((player: any) => ({
            id: player.id,
            name: player.name || '',
            number: player.number?.toString() || "0",
            size: player.size as 'S' | 'M' | 'L' | 'XL',
            printImage: player.print_image || false,
            jersey_color: player.jersey_color || '',
            uniform_type: player.uniform_type || 'player',
            line_1: player.line_1 || '',
            line_3: player.line_3 || '',
            chest_text: player.chest_text || '',
            chest_number: player.chest_number || false,
            pants_number: player.pants_number || false,
            logo_chest_left: player.logo_chest_left || false,
            logo_chest_right: player.logo_chest_right || false,
            logo_chest_center: player.logo_chest_center || false,
            logo_sleeve_left: player.logo_sleeve_left || false,
            logo_sleeve_right: player.logo_sleeve_right || false,
            pet_chest: player.pet_chest || '',
            logo_pants: player.logo_pants || false,
            note: player.note || ''
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
          },
          designData: typedDesignData
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

  useEffect(() => {
    if (user) {
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
        toast.success(`Trạng thái đơn hàng đã được cập nh��t thành ${newStatus === 'new' ? 'Mới' : newStatus === 'processing' ? 'Đang xử lý' : 'Đã hoàn thành'}`);
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
                  <th className="p-3 text-left">Họ tên khách hàng</th>
                  <th className="p-3 text-left">Số lượng áo</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-left">Thiết kế</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || fetchingData ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
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
