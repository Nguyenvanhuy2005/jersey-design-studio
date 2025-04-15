
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";

interface OrderBasicInfoProps {
  order: Order;
}

export const OrderBasicInfo = ({ order }: OrderBasicInfoProps) => {
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
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

  return (
    <div>
      <h3 className="font-semibold">Thông tin cơ bản</h3>
      <div className="grid grid-cols-1 gap-1 mt-2">
        <p><span className="text-muted-foreground">ID:</span> {order.id}</p>
        <p><span className="text-muted-foreground">Tên đội:</span> {order.teamName || 'Không có tên'}</p>
        <p><span className="text-muted-foreground">Số lượng áo:</span> {order.players.length}</p>
        <p><span className="text-muted-foreground">Tổng chi phí:</span> {order.totalCost.toLocaleString()} VNĐ</p>
        <p><span className="text-muted-foreground">Trạng thái:</span> {getStatusBadge(order.status)}</p>
        <p><span className="text-muted-foreground">Ngày tạo:</span> {formatDate(order.createdAt)}</p>
        
        <div className="mt-2 pt-2 border-t">
          <h4 className="font-medium mb-1">Thông tin khách hàng</h4>
          <p><span className="text-muted-foreground">Tên khách hàng:</span> {order.customerName || 'Không xác định'}</p>
          {order.customerPhone && (
            <p><span className="text-muted-foreground">Số điện thoại:</span> {order.customerPhone}</p>
          )}
          {order.customerAddress && (
            <p><span className="text-muted-foreground">Địa chỉ:</span> {order.customerAddress}</p>
          )}
        </div>
        
        {order.notes && (
          <div className="mt-2 pt-2 border-t">
            <h4 className="font-medium">Ghi chú</h4>
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
