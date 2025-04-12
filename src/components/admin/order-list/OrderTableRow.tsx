
import { Order } from "@/types";
import { OrderStatus } from "./OrderStatus";
import { OrderImageButtons } from "./OrderImageButtons";
import { OrderActions } from "./OrderActions";

type OrderTableRowProps = {
  order: Order;
  imageAvailability: Record<string, {front: boolean, back: boolean}>;
  onViewDetails: (order: Order) => void;
  onViewImage: (imageUrl: string | null) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
};

export const OrderTableRow = ({
  order,
  imageAvailability,
  onViewDetails,
  onViewImage,
  onStatusChange
}: OrderTableRowProps) => {
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const orderAvailability = order.id ? imageAvailability[order.id] : { front: false, back: false };
  
  return (
    <tr key={order.id} className="border-t border-muted">
      <td className="p-3">{order.id}</td>
      <td className="p-3 font-medium">{order.teamName}</td>
      <td className="p-3">{order.players.length}</td>
      <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
      <td className="p-3">
        <OrderStatus status={order.status} />
      </td>
      <td className="p-3">{formatDate(order.createdAt)}</td>
      <td className="p-3">
        {(order.designImageFront || order.designImage || order.designImageBack) ? (
          <OrderImageButtons 
            orderId={order.id}
            frontDesignImage={order.designImageFront || order.designImage}
            backDesignImage={order.designImageBack}
            imageAvailability={orderAvailability}
            onViewImage={onViewImage}
          />
        ) : (
          <span className="text-muted-foreground text-sm">Không có</span>
        )}
      </td>
      <td className="p-3">
        <OrderActions 
          order={order}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  );
};
