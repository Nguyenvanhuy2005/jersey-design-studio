
import { Order } from "@/types";
import { OrderStatus } from "./OrderStatus";
import { OrderActions } from "./OrderActions";

type OrderTableRowProps = {
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed' | 'delivered') => void;
  onDeleteOrder: (orderId: string) => void;
};

export const OrderTableRow = ({
  order,
  onViewDetails,
  onStatusChange,
  onDeleteOrder
}: OrderTableRowProps) => {
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
  };
  
  return (
    <tr key={order.id} className="border-t border-muted">
      <td className="p-3">{order.id}</td>
      <td className="p-3">
        <div>
          <p className="font-medium">{order.customerName || "Không xác định"}</p>
          {order.teamName && (
            <p className="text-xs text-muted-foreground">Đội: {order.teamName}</p>
          )}
          {order.customerPhone && (
            <p className="text-xs text-muted-foreground">SĐT: {order.customerPhone}</p>
          )}
        </div>
      </td>
      <td className="p-3">{order.players.length}</td>
      <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
      <td className="p-3">
        <OrderStatus status={order.status} />
      </td>
      <td className="p-3">{formatDate(order.createdAt)}</td>
      <td className="p-3">
        <OrderActions 
          order={order}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
          onDeleteOrder={onDeleteOrder}
        />
      </td>
    </tr>
  );
};
