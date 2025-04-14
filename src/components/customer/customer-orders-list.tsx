
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Order } from "@/types";
import { parseDateSafely } from "@/utils/format-utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface CustomerOrdersListProps {
  orders: Order[];
}

export function CustomerOrdersList({ orders }: CustomerOrdersListProps) {
  const formatStatus = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Đơn mới</Badge>;
      case "processing":
        return <Badge variant="default">Đang xử lý</Badge>;
      case "completed":
        return <Badge variant="success" className="bg-green-500">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : parseDateSafely(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : parseDateSafely(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">Bạn chưa có đơn hàng nào</h3>
        <p className="text-muted-foreground mb-4">
          Tạo đơn hàng mới để bắt đầu thiết kế áo đấu của bạn
        </p>
        <Button asChild>
          <Link to="/create-order">Tạo đơn hàng mới</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Tên đội</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order, index) => {
            const createdAt = parseDateSafely(order.createdAt);
            const playerCount = order.players?.length || 0;
            
            return (
              <TableRow key={order.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{createdAt.toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>{order.teamName || "Không có tên"}</TableCell>
                <TableCell>{playerCount} áo</TableCell>
                <TableCell>{order.totalCost?.toLocaleString("vi-VN")} đ</TableCell>
                <TableCell>{formatStatus(order.status)}</TableCell>
                <TableCell>
                  <Link to={`/customer/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> Xem
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
