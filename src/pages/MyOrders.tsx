
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Order, Player } from "@/types";
import { Loader2, FileText, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { Link } from "react-router-dom";
import { checkStorageBucketsExist, createStorageBucketsIfNeeded } from "@/utils/storage/bucket-utils";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Check if storage buckets exist
  useEffect(() => {
    const checkBuckets = async () => {
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
          toast.warning(
            "Để xem hình ảnh thiết kế, cần tạo các buckets lưu trữ",
            { duration: 5000 }
          );
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
    
    checkBuckets();
  }, []);

  // Handle creating storage buckets
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
    const fetchMyOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fixed query to properly handle the relationship between orders and customers
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            customers(*)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching orders:', error);
          setError(`Không thể tải dữ liệu đơn hàng: ${error.message}`);
          return;
        }
        
        if (!data || data.length === 0) {
          // No error but no data
          setOrders([]);
          setError(null);
          setIsLoading(false);
          return;
        }
        
        // Transform orders data
        const transformedOrders: Order[] = data.map((order) => {
          // Get customer info - safely handling the customers object
          const customerInfo = order.customers ? {
            id: order.customers.id,
            name: order.customers.name || '',
            address: order.customers.address || '',
            phone: order.customers.phone || '',
            delivery_note: order.customers.delivery_note || '',
            created_at: order.customers.created_at ? new Date(order.customers.created_at) : undefined
          } : undefined;
          
          // Ensure reference images are always an array of strings
          let processedReferenceImages: string[] = [];
          if (order.reference_images && Array.isArray(order.reference_images)) {
            processedReferenceImages = order.reference_images
              .filter((item: any) => typeof item === 'string')
              .map((item: string) => item);
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
            customer_id: order.customer_id,
            customerInfo: customerInfo,
            players: (order.players || []).map((player: any): Player => ({
              id: player.id,
              name: player.name || '',
              number: player.number.toString(), // Convert number to string
              size: player.size as 'S' | 'M' | 'L' | 'XL',
              printImage: player.print_image || false, 
              jersey_color: player.jersey_color || '',
              uniform_type: player.uniform_type || 'player',
              line_1: player.line_1 || '',
              line_2: player.line_2 || '',
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
            })),
            productLines: order.product_lines || [],
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
        
        setOrders(transformedOrders);
      } catch (e) {
        console.error("Error fetching orders:", e);
        setError("Không thể tải dữ liệu đơn hàng");
        toast.error("Có lỗi xảy ra khi tải dữ liệu đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyOrders();
  }, [user]);
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const handleViewImage = (imageUrl: string | null) => {
    setSelectedImage(imageUrl);
  };
  
  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Mới';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Đã hoàn thành';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
        
        {(!storageBucketsStatus.designImages || !storageBucketsStatus.referenceImages) && 
         !storageBucketsStatus.checking && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-medium">Cần tạo bucket lưu trữ</h3>
                <p className="text-sm text-amber-700 mt-1">
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải dữ liệu đơn hàng...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              <div>
                <h3 className="font-medium">Lỗi tải dữ liệu</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Bạn chưa có đơn hàng nào</p>
              <Button asChild className="mt-4">
                <Link to="/create-order">Tạo đơn hàng mới</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {order.teamName || `Đơn hàng #${order.id?.substring(0, 6)}`}
                    </CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt?.toLocaleDateString('vi-VN')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p><span className="font-medium">Số lượng:</span> {order.players.length} áo</p>
                      <p>
                        <span className="font-medium">Cầu thủ/Thủ môn:</span> {' '}
                        {order.players.filter(p => p.uniform_type === 'player' || !p.uniform_type).length}/{order.players.filter(p => p.uniform_type === 'goalkeeper').length}
                      </p>
                    </div>
                    <p><span className="font-medium">Tổng giá:</span> {order.totalCost.toLocaleString('vi-VN')} VND</p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => handleViewDetails(order)}
                    >
                      <FileText className="h-4 w-4 mr-2" /> Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <OrderDetails 
                order={selectedOrder} 
                onViewImage={handleViewImage}
                // Read-only mode for customers
                onStatusChange={() => {}}
              />
            )}
          </DialogContent>
        </Dialog>
        
        <ImageViewer 
          isOpen={!!selectedImage} 
          onClose={handleCloseImageViewer} 
          imageUrl={selectedImage} 
        />
      </div>
    </Layout>
  );
};

export default MyOrders;
