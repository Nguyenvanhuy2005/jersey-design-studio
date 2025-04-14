
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Order, Player } from "@/types";
import { Loader2, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            players(*),
            product_lines(*),
            print_configs(*)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform orders data
        const transformedOrders: Order[] = data.map((order) => ({
          id: order.id,
          teamName: order.team_name || '',
          status: order.status as 'new' | 'processing' | 'completed',
          totalCost: order.total_cost,
          createdAt: new Date(order.created_at || ''),
          notes: order.notes || '',
          designImage: order.design_image || '',
          designImageFront: order.design_image_front || '',
          designImageBack: order.design_image_back || '',
          referenceImages: Array.isArray(order.reference_images) ? order.reference_images as string[] : [],
          customer_id: order.customer_id,
          players: (order.players || []).map((player: any): Player => ({
            id: player.id,
            name: player.name || '',
            number: player.number.toString(), // Convert number to string
            size: player.size as 'S' | 'M' | 'L' | 'XL',
            printImage: player.print_image || false // Correctly map print_image to printImage
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
        }));
        
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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            {error}
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
                    <CardTitle className="text-lg">{order.teamName}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt?.toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Số lượng:</span> {order.players.length} áo</p>
                    <p><span className="font-medium">Tổng giá:</span> {order.totalCost.toLocaleString()} VND</p>
                    
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
