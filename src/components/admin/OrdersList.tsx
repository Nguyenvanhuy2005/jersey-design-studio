
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Mail, Eye, Image as ImageIcon } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";
import { getDesignImageUrl } from "@/utils/image-utils";

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
  
  const handleSendEmail = (order: Order) => {
    toast.success(`Email đã được gửi đến khách hàng về đơn hàng: ${order.teamName}`);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleImageError = (orderId: string) => {
    console.error(`Failed to load design image for order ${orderId}`);
    setImageLoadErrors(prev => ({ ...prev, [orderId]: true }));
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
      {filteredOrders.map((order) => (
        <tr key={order.id} className="border-t border-muted">
          <td className="p-3">{order.id}</td>
          <td className="p-3 font-medium">{order.teamName}</td>
          <td className="p-3">{order.players.length}</td>
          <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
          <td className="p-3">{getStatusBadge(order.status)}</td>
          <td className="p-3">{formatDate(order.createdAt)}</td>
          <td className="p-3">
            {order.designImage ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const imageUrl = getDesignImageUrl(order.designImage);
                  onViewImage(imageUrl);
                  if (imageUrl) {
                    console.log(`Viewing design image: ${imageUrl}`);
                  } else {
                    console.error(`Failed to get URL for design image: ${order.designImage}`);
                  }
                }}
                className="flex items-center gap-1"
              >
                <ImageIcon className="h-4 w-4" /> Xem
              </Button>
            ) : (
              <span className="text-muted-foreground text-sm">Không có</span>
            )}
            {imageLoadErrors[order.id!] && (
              <p className="text-xs text-red-500 mt-1">Không thể tải hình ảnh</p>
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
      ))}
    </>
  );
};
