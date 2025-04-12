
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Mail, Eye, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";
import { getDesignImageUrl, checkDesignImageExists, getFallbackImageUrl } from "@/utils/image-utils";

interface OrdersListProps {
  orders: Order[];
  statusFilter: string;
  onViewDetails: (order: Order) => void;
  onViewImage: (imageUrl: string | null) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrdersList = ({
  orders,
  statusFilter,
  onViewDetails,
  onViewImage,
  onStatusChange
}: OrdersListProps) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [imageAvailability, setImageAvailability] = useState<Record<string, {front: boolean, back: boolean}>>({});
  
  // Check image availability when orders change
  useEffect(() => {
    const checkImagesExistence = async () => {
      const availability: Record<string, {front: boolean, back: boolean}> = {};
      
      for (const order of orders) {
        if (order.id) {
          // Check front design image
          const frontImagePath = order.designImageFront || order.designImage;
          const frontAvailable = frontImagePath ? await checkDesignImageExists(frontImagePath) : false;
          
          // Check back design image
          const backAvailable = order.designImageBack ? await checkDesignImageExists(order.designImageBack) : false;
          
          availability[order.id] = {
            front: frontAvailable,
            back: backAvailable
          };
          
          console.log(`Order ${order.id} image availability - front: ${frontAvailable}, back: ${backAvailable}`);
          console.log(`  Front image path: ${frontImagePath}`);
          console.log(`  Back image path: ${order.designImageBack}`);
        }
      }
      
      setImageAvailability(availability);
      console.log("Design images availability checked:", availability);
    };
    
    checkImagesExistence();
  }, [orders]);
  
  const handleSendEmail = (order: Order) => {
    toast.success(`Email đã được gửi đến khách hàng về đơn hàng: ${order.teamName}`);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleImageError = (orderId: string, side: 'front' | 'back') => {
    console.error(`Failed to load ${side} design image for order ${orderId}`);
    setImageLoadErrors(prev => ({ ...prev, [`${orderId}-${side}`]: true }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">Mới</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500">Đang xử lý</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Đã hoàn thành</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (filteredOrders.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="p-4 text-center text-muted-foreground">
          Không có đơn hàng nào
        </td>
      </tr>
    );
  }

  return (
    <>
      {filteredOrders.map((order) => {
        // Check if order has front/back design images and if they're available
        const hasFrontDesignImage = !!(order.designImageFront || order.designImage);
        const hasBackDesignImage = !!order.designImageBack;
        
        const orderAvailability = order.id ? imageAvailability[order.id] : { front: false, back: false };
        
        // Log image paths and availability for debugging
        console.log(`Rendering order ${order.id || 'unknown'} images:`, {
          frontPath: order.designImageFront || order.designImage,
          backPath: order.designImageBack,
          hasFront: hasFrontDesignImage,
          hasBack: hasBackDesignImage,
          availability: orderAvailability
        });
        
        const hasFrontDesignImageError = order.id ? imageLoadErrors[`${order.id}-front`] : false;
        const hasBackDesignImageError = order.id ? imageLoadErrors[`${order.id}-back`] : false;
        
        return (
          <tr key={order.id} className="border-t border-muted">
            <td className="p-3">{order.id}</td>
            <td className="p-3 font-medium">{order.teamName}</td>
            <td className="p-3">{order.players.length}</td>
            <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
            <td className="p-3">{getStatusBadge(order.status)}</td>
            <td className="p-3">{formatDate(order.createdAt)}</td>
            <td className="p-3">
              {(hasFrontDesignImage || hasBackDesignImage) ? (
                <div className="flex flex-col gap-2">
                  {hasFrontDesignImage && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const imagePath = order.designImageFront || order.designImage;
                        console.log(`View front design - path: ${imagePath}`);
                        
                        if (imagePath) {
                          const imageUrl = getDesignImageUrl(imagePath);
                          console.log(`Generated front design image URL:`, imageUrl);
                          
                          if (imageUrl) {
                            onViewImage(imageUrl);
                          } else {
                            console.error(`Failed to get URL for front design image: ${imagePath}`);
                            toast.error("Không thể tải hình ảnh thiết kế mặt trước");
                            onViewImage(getFallbackImageUrl('design'));
                          }
                        }
                      }}
                      className="flex items-center gap-1 w-full"
                    >
                      <ImageIcon className="h-4 w-4" /> Xem mặt trước
                    </Button>
                  )}
                  
                  {hasBackDesignImage && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const imagePath = order.designImageBack;
                        console.log(`View back design - path: ${imagePath}`);
                        
                        if (imagePath) {
                          const imageUrl = getDesignImageUrl(imagePath);
                          console.log(`Generated back design image URL:`, imageUrl);
                          
                          if (imageUrl) {
                            onViewImage(imageUrl);
                          } else {
                            console.error(`Failed to get URL for back design image: ${imagePath}`);
                            toast.error("Không thể tải hình ảnh thiết kế mặt sau");
                            onViewImage(getFallbackImageUrl('design'));
                          }
                        }
                      }}
                      className="flex items-center gap-1 w-full"
                    >
                      <ImageIcon className="h-4 w-4" /> Xem mặt sau
                    </Button>
                  )}
                  
                  {(orderAvailability && 
                    ((hasFrontDesignImage && !orderAvailability.front) || 
                     (hasBackDesignImage && !orderAvailability.back) ||
                     hasFrontDesignImageError || 
                     hasBackDesignImageError)) && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" /> 
                      Có vấn đề với hình ảnh thiết kế
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Không có</span>
              )}
            </td>
            <td className="p-3">
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(order)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Chi tiết
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {order.status === 'new' && (
                      <DropdownMenuItem onClick={() => onStatusChange(order.id!, 'processing')}>
                        Chuyển sang "Đang xử lý"
                      </DropdownMenuItem>
                    )}
                    {order.status === 'processing' && (
                      <DropdownMenuItem onClick={() => onStatusChange(order.id!, 'completed')}>
                        Chuyển sang "Đã hoàn thành"
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleSendEmail(order)}>
                      <Mail className="h-4 w-4 mr-2" /> Gửi email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
};
